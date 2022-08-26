import { providers, utils, constants } from 'ethers';
import {
  IAppDefinition,
  IIssuerDefinition,
  IRevokerDefinition,
  IOrganizationDefinition,
  IRoleDefinition,
  IRoleDefinitionV2,
  IRoleDefinitionText,
  PreconditionType,
} from './types/domain-definitions';
import {
  VOLTA_CHAIN_ID,
  VOLTA_PUBLIC_RESOLVER_ADDRESS,
  VOLTA_RESOLVER_V1_ADDRESS,
  VOLTA_RESOLVER_V2_ADDRESS,
  EWC_CHAIN_ID,
} from './chain-constants';
import { ENSRegistry__factory } from '../ethers/factories/ENSRegistry__factory';
import { PublicResolver } from '../ethers/PublicResolver';
import { PublicResolver__factory } from '../ethers/factories/PublicResolver__factory';
import { RoleDefinitionResolver } from '../ethers/RoleDefinitionResolver';
import { RoleDefinitionResolver__factory } from '../ethers/factories/RoleDefinitionResolver__factory';
import { RoleDefinitionResolverV2 } from '../ethers/RoleDefinitionResolverV2';
import { RoleDefinitionResolverV2__factory } from '../ethers/factories/RoleDefinitionResolverV2__factory';
import { ResolverContractType } from './types/resolver-contract-type';
import { ENSRegistry } from '../ethers/ENSRegistry';
import {
  ChainIsNotSupported,
  DomainResolverNotSet,
  InvalidDomain,
  NodeNameMismatch,
  ResolverNotSupported,
} from './errors';

const { HashZero, AddressZero } = constants;

export class DomainReader {
  public static isOrgDefinition = (
    domainDefinition:
      | IRoleDefinitionText
      | IOrganizationDefinition
      | IAppDefinition
  ): domainDefinition is IOrganizationDefinition =>
    (domainDefinition as IOrganizationDefinition).orgName !== undefined;

  public static isAppDefinition = (
    domainDefinition:
      | IRoleDefinitionText
      | IOrganizationDefinition
      | IAppDefinition
  ): domainDefinition is IAppDefinition =>
    (domainDefinition as IAppDefinition).appName !== undefined;

  public static isRoleDefinition = (
    domainDefinition:
      | IRoleDefinitionText
      | IOrganizationDefinition
      | IAppDefinition
  ): domainDefinition is IRoleDefinition =>
    (domainDefinition as IRoleDefinition).roleName !== undefined;

  public static isRoleDefinitionV2 = (
    domainDefinition:
      | IRoleDefinitionText
      | IOrganizationDefinition
      | IAppDefinition
  ): domainDefinition is IRoleDefinitionV2 =>
    (domainDefinition as IRoleDefinitionV2).roleName !== undefined &&
    (domainDefinition as IRoleDefinitionV2).revoker !== undefined;

  private readonly _provider: providers.Provider;
  private readonly _ensRegistry: ENSRegistry;
  private readonly _knownEnsResolvers: Record<
    number,
    Record<string, ResolverContractType>
  > = {
    [VOLTA_CHAIN_ID]: {
      [VOLTA_PUBLIC_RESOLVER_ADDRESS]: ResolverContractType.PublicResolver,
      [VOLTA_RESOLVER_V1_ADDRESS]:
        ResolverContractType.RoleDefinitionResolver_v1,
      [VOLTA_RESOLVER_V2_ADDRESS]:
        ResolverContractType.RoleDefinitionResolver_v2,
    },
  };

  /**
   * Allows to map between chainId to network name that is used in ethr DID
   *
   */
  private readonly _knownDidEthrNetworkNames: Record<number, string> = {
    [VOLTA_CHAIN_ID]: 'volta',
    [EWC_CHAIN_ID]: 'ewc',
  };

  constructor({
    ensRegistryAddress,
    provider,
  }: {
    ensRegistryAddress: string;
    provider: providers.Provider;
  }) {
    this._provider = provider;
    this._ensRegistry = ENSRegistry__factory.connect(
      ensRegistryAddress,
      this._provider
    );
  }

  public addKnownResolver({
    chainId,
    address,
    type,
  }: {
    chainId: number;
    address: string;
    type: ResolverContractType;
  }): void {
    if (!this._knownEnsResolvers[chainId]) {
      this._knownEnsResolvers[chainId] = {};
    }
    this._knownEnsResolvers[chainId][address] = type;
  }

  /**
   * Reads the reverse name for a node from its registered ENS resolver contract
   * @param node the ENS node hash of a domain name
   * @returns The name associated with the node.
   */
  public async readName(node: string): Promise<string> {
    const checkName = (name: string) => {
      if (node !== utils.namehash(name)) {
        throw new NodeNameMismatch(node, name);
      }
      return name;
    };

    const resolver = await this.getResolver(node);
    const name = await resolver.name(node);
    return checkName(name);
  }

  /**
   * Reads the App, Org or Role Definition from the registered ENS resolver contract
   * @param node the ENS node hash of a domain name
   * @returns
   */
  public async read({
    node,
  }: {
    node: string;
  }): Promise<
    | IRoleDefinition
    | IRoleDefinitionV2
    | IAppDefinition
    | IOrganizationDefinition
  > {
    const { resolverAddress, resolverType } = await this.getResolver(node);

    if (resolverType === ResolverContractType.PublicResolver) {
      const ensResolver: PublicResolver = PublicResolver__factory.connect(
        resolverAddress,
        this._provider
      );
      const textData = await ensResolver.text(node, 'metadata');
      let definition;
      try {
        definition = JSON.parse(textData, this.reviveDates) as
          | IRoleDefinition
          | IAppDefinition
          | IOrganizationDefinition;
      } catch (err) {
        throw Error(
          `unable to parse resolved textData for node: ${node}. textData: ${textData}. error: ${JSON.stringify(
            err
          )}`
        );
      }
      return definition;
    } else if (
      resolverType === ResolverContractType.RoleDefinitionResolver_v1
    ) {
      const ensResolver: RoleDefinitionResolver =
        RoleDefinitionResolver__factory.connect(
          resolverAddress,
          this._provider
        );
      const textData = await ensResolver.text(node, 'metadata');
      let textProps;
      try {
        textProps = JSON.parse(textData, this.reviveDates) as
          | IRoleDefinitionText
          | IAppDefinition
          | IOrganizationDefinition;
      } catch (err) {
        throw new InvalidDomain(node, textData);
      }

      if (
        DomainReader.isOrgDefinition(textProps) ||
        DomainReader.isAppDefinition(textProps)
      ) {
        return textProps;
      }
      if (DomainReader.isRoleDefinition(textProps)) {
        return await this.readRoleDefResolver_v1(node, textProps, ensResolver);
      }
      throw new InvalidDomain(node, textProps);
    } else if (
      resolverType === ResolverContractType.RoleDefinitionResolver_v2
    ) {
      const ensResolver: RoleDefinitionResolverV2 =
        RoleDefinitionResolverV2__factory.connect(
          resolverAddress,
          this._provider
        );
      const textData = await ensResolver.text(node, 'metadata');
      let textProps;
      try {
        textProps = JSON.parse(textData, this.reviveDates) as
          | IRoleDefinitionText
          | IAppDefinition
          | IOrganizationDefinition;
      } catch (err) {
        throw new InvalidDomain(node, textData);
      }

      if (
        DomainReader.isOrgDefinition(textProps) ||
        DomainReader.isAppDefinition(textProps)
      ) {
        return textProps;
      }
      if (DomainReader.isRoleDefinition(textProps)) {
        return await this.readRoleDefResolver_v2(node, textProps, ensResolver);
      }
      throw new InvalidDomain(node, textProps);
    }
    throw new ResolverNotSupported(node, resolverAddress);
  }

  protected async getResolver(
    node: string
  ): Promise<
    PublicResolver | RoleDefinitionResolver | RoleDefinitionResolverV2
  > {
    const network = await this._provider.getNetwork();
    const chainId = network.chainId;
    const resolverAddress = await this._ensRegistry.resolver(node);
    if (resolverAddress === AddressZero) {
      throw new DomainResolverNotSet(node);
    }

    const resolversForChain = this._knownEnsResolvers[chainId];
    if (resolversForChain === undefined) {
      throw new ChainIsNotSupported(chainId);
    }
    const resolverType = resolversForChain[resolverAddress];
    if (resolverType === undefined) {
      throw new ResolverNotSupported(node, resolverAddress);
    }

    switch (resolverType) {
      case ResolverContractType.PublicResolver:
        return PublicResolver__factory.connect(resolverAddress, this._provider);

      case ResolverContractType.RoleDefinitionResolver_v1:
        return RoleDefinitionResolver__factory.connect(
          resolverAddress,
          this._provider
        );
      case ResolverContractType.RoleDefinitionResolver_v2:
        return RoleDefinitionResolverV2__factory.connect(
          resolverAddress,
          this._provider
        );
      default:
        throw new ResolverNotSupported(node, resolverAddress);
    }
  }

  /**
   * Because a given resolver represents the contract from which the role definition data is read,
   * and because ethr DIDs are currently stored as addresses in the resolver contracts (so that they can be read by other smart contracts),
   * the network of the provider configured for the resolver is the network that should be used for the ethr DIDs
   * see {@link https://github.com/decentralized-identity/ethr-did-resolver#multi-network-configuration}
   * @param ensResolver ensResolver that is to be used to obtain the DIDs
   * @returns The network name that should be used for DID stored by this resolver
   */
  protected async getNetworkNameFromResolver(
    ensResolver: RoleDefinitionResolver | RoleDefinitionResolverV2
  ): Promise<string> {
    const { chainId } = await ensResolver.provider.getNetwork();
    if (!chainId) {
      throw new Error('Unable to read chainId from ensResolver provider');
    }
    const networkName = this._knownDidEthrNetworkNames[chainId];
    if (!networkName) {
      throw new Error(`No did:ethr networkName known for ${chainId}`);
    }
    return networkName;
  }

  // TODO: Muliticalify (make all the queries in one)
  protected async readRoleDefResolver_v1(
    node: string,
    roleDefinitionText: IRoleDefinitionText,
    ensResolver: RoleDefinitionResolver
  ): Promise<IRoleDefinition> {
    const issuersData = await ensResolver.issuers(node);
    let issuer: IIssuerDefinition;

    if (issuersData.dids.length > 0) {
      const networkName = await this.getNetworkNameFromResolver(ensResolver);
      issuer = {
        issuerType: 'DID',
        did: issuersData.dids.map(
          (address) => `did:ethr:${networkName}:${address}`
        ),
      };
    } else if (issuersData.role != '') {
      issuer = {
        issuerType: 'ROLE',
        roleName: await this.readName(issuersData.role),
      };
    } else {
      issuer = {};
    }

    const prerequisiteRolesNodes = await ensResolver.prerequisiteRoles(node);
    const prerequisiteRoles = await Promise.all(
      prerequisiteRolesNodes[0].map((node) => this.readName(node))
    );

    const enrolmentPreconditions =
      prerequisiteRoles.length >= 1
        ? [{ type: PreconditionType.Role, conditions: prerequisiteRoles }]
        : [];

    const version = (await ensResolver.versionNumber(node)).toNumber();

    return {
      ...roleDefinitionText,
      issuer,
      version,
      enrolmentPreconditions,
    };
  }

  // TODO: Muliticalify (make all the queries in one)
  protected async readRoleDefResolver_v2(
    node: string,
    roleDefinitionText: IRoleDefinitionText,
    ensResolver: RoleDefinitionResolverV2
  ): Promise<IRoleDefinitionV2> {
    const issuersData = await ensResolver.issuers(node);
    const revokersData = await ensResolver.revokers(node);
    let issuer: IIssuerDefinition;
    let revoker: IRevokerDefinition;

    const networkName = await this.getNetworkNameFromResolver(ensResolver);

    if (issuersData.dids.length > 0) {
      issuer = {
        issuerType: 'DID',
        did: issuersData.dids.map(
          (address) => `did:ethr:${networkName}:${address}`
        ),
      };
    } else if (issuersData.role !== HashZero) {
      issuer = {
        issuerType: 'ROLE',
        roleName: await this.readName(issuersData.role),
      };
    } else {
      issuer = {};
    }
    if (revokersData.dids.length > 0) {
      revoker = {
        revokerType: 'DID',
        did: revokersData.dids.map(
          (address) => `did:ethr:${networkName}:${address}`
        ),
      };
    } else if (revokersData.role !== HashZero) {
      revoker = {
        revokerType: 'ROLE',
        roleName: await this.readName(revokersData.role),
      };
    } else {
      revoker = {};
    }

    const prerequisiteRolesNodes = await ensResolver.prerequisiteRoles(node);
    const prerequisiteRoles = await Promise.all(
      prerequisiteRolesNodes[0].map((node) => ensResolver.name(node))
    );
    const enrolmentPreconditions =
      prerequisiteRoles.length >= 1
        ? [{ type: PreconditionType.Role, conditions: prerequisiteRoles }]
        : [];

    const version = (await ensResolver.versionNumber(node)).toNumber();

    return {
      ...roleDefinitionText,
      issuer,
      revoker,
      version,
      enrolmentPreconditions,
    };
  }

  protected reviveDates(
    key: string,
    value: string | number | Date
  ): string | number | Date {
    if ((key === 'minDate' || key === 'maxDate') && value !== null) {
      return new Date(value);
    }
    return value;
  }
}
