import { IIssuerDefinition } from '@energyweb/credential-governance';
import { providers, utils } from 'ethers';
import { RoleDefinitionResolverV2__factory } from '@energyweb/credential-governance/ethers/factories/RoleDefinitionResolverV2__factory';
import { RoleDefinitionResolverV2 } from '@energyweb/credential-governance/ethers/RoleDefinitionResolverV2';
import { VOLTA_CHAIN_ID, EWC_CHAIN_ID } from '@energyweb/credential-governance';

/**
 * An interface for Resolution of issuers for a namespace
 */
export interface IssuerDefinitionResolver {
  /**
   * Fetches authorised issuers for the provided namespace
   * @param namespace
   * @returns IIssuerDefinition for the namespace
   */
  getIssuerDefinition(
    namespace: string
  ): Promise<IIssuerDefinition | undefined>;
}

/**
 * Resolves an issuer definition by reading smart contract state via an Ethers provider
 */
export class EthersProviderIssuerDefinitionResolver
  implements IssuerDefinitionResolver
{
  private _roleDefResolver: RoleDefinitionResolverV2;
  private _provider: providers.Provider;

  constructor(provider: providers.Provider, roleDefResolverAddr: string) {
    this._provider = provider;
    this._roleDefResolver = RoleDefinitionResolverV2__factory.connect(
      roleDefResolverAddr,
      provider
    );
  }

  /**
   *
   * @param namespace
   * @returns issuers for the namespace from blockchain contract
   */
  async getIssuerDefinition(
    namespace: string
  ): Promise<IIssuerDefinition | undefined> {
    let issuers: IIssuerDefinition;
    const resolvedNamespace = namespace.startsWith('0x')
      ? namespace
      : utils.namehash(namespace);
    const [result, type] = await Promise.all([
      this._roleDefResolver.issuers(resolvedNamespace),
      this._roleDefResolver.issuerType(resolvedNamespace),
    ]);
    const chainID = (await this._provider.getNetwork()).chainId;
    let issuerDIDs: string[] = result.dids;
    if (chainID == VOLTA_CHAIN_ID) {
      issuerDIDs = issuerDIDs.map(
        (issuerDIDs) => `did:ethr:volta:${issuerDIDs}`
      );
    } else if (chainID === EWC_CHAIN_ID) {
      issuerDIDs = issuerDIDs.map((issuerDIDs) => `did:ethr:ewc:${issuerDIDs}`);
    } else {
      throw new Error('Network not supported');
    }
    if (result.dids.length > 0 || result.role.length > 0) {
      return (issuers = {
        did: issuerDIDs,
        roleName: result.role,
        //confirm the type representation TODO
        issuerType: type.toString(),
      });
    }
    return undefined;
  }
}
