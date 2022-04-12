import {
  IIssuerDefinition,
  IRoleDefinitionV2,
} from '@energyweb/credential-governance';
import { providers } from 'ethers';
import { RoleDefinitionResolverV2__factory } from '@energyweb/credential-governance/ethers/factories/RoleDefinitionResolverV2__factory';
import { RoleDefinitionResolverV2 } from '@energyweb/credential-governance/ethers/RoleDefinitionResolverV2';

abstract class RoleResolver {
  abstract getRoleIssuers(namespace: string): Promise<IIssuerDefinition>;
}

export class CachedRoleDefinitionResolver extends RoleResolver {
  private _roleDefinitions: IRoleDefinitionV2[];

  constructor(roleDefinitions: IRoleDefinitionV2[]) {
    super();
    this._roleDefinitions = roleDefinitions;
  }

  /**
   *
   * @param namespace
   * @returns issuers for the provided namespace form the cached RoleDefinitions
   */
  async getRoleIssuers(namespace: string): Promise<IIssuerDefinition> {
    let issuers: IIssuerDefinition = {};
    for (const role of this._roleDefinitions) {
      if (role.roleName == namespace) {
        issuers = role.issuer;
      }
    }
    return issuers;
  }
}

export class ENSRoleDefinitionResolver extends RoleResolver {
  private _roleDefResolver: RoleDefinitionResolverV2;

  constructor(provider: providers.Provider, roleDefResolverAddr: string) {
    super();
    this;
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
  async getRoleIssuers(namespace: string): Promise<IIssuerDefinition> {
    const issuers: IIssuerDefinition = {};
    const result = await this._roleDefResolver.issuers(namespace);
    const type = await this._roleDefResolver.issuerType(namespace);
    if (result.dids.length > 0 || result.role.length > 0) {
      issuers.did = result.dids;
      issuers.roleName = result.role;
      //confirm the type representation TODO
      issuers.issuerType = type.toString();
    }
    return issuers;
  }
}
