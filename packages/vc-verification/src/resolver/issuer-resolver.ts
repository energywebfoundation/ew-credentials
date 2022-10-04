import { DomainReader } from '@energyweb/credential-governance';
import type { IIssuerDefinition } from '@energyweb/credential-governance';
import { utils } from 'ethers';
import { IRoleDefinitionCache } from '../models/cache-interfaces';

/**
 * An interface for Resolution of Issuers for a namespace
 */
export interface IssuerResolver {
  /**
   * Fetches authorised issuers for the provided namespace
   * @param namespace for which the issuers needs to be fetched
   * @param roleDefCache Cache to store and fetch RoleDefinition
   * @returns IIssuerDefinition for the namespace
   */
  getIssuerDefinition(
    namespace: string,
    roleDefCache?: IRoleDefinitionCache
  ): Promise<IIssuerDefinition | undefined>;
}

/**
 * Resolves issuers definition by reading smart contract state via an Ethers provider
 */
export class EthersProviderIssuerResolver implements IssuerResolver {
  private _domainReader: DomainReader;

  constructor(domainReader: DomainReader) {
    this._domainReader = domainReader;
  }

  /**
   * Fetches authorised issuers for the provided namespace
   *
   * ```typescript
   * const issuerResolver = new EthersProviderIssuerResolver(domainReader);
   * const role = 'sampleRole';
   * const issuers = issuerResolver.getIssuerDefinition(sampleRole, roleDefCache);
   * ```
   * @param namespace for which the issuers need to be fetched
   * @param roleDefCache Cache to store role definition
   * @returns IIssuerDefinition for the namespace from blockchain contract
   */
  async getIssuerDefinition(
    namespace: string,
    roleDefCache?: IRoleDefinitionCache
  ): Promise<IIssuerDefinition | undefined> {
    const cachedRoleDefinition = roleDefCache?.getRoleDefinition(namespace);
    if (cachedRoleDefinition) {
      return cachedRoleDefinition.issuer;
    }
    const resolvedNamespace = namespace.startsWith('0x')
      ? namespace
      : utils.namehash(namespace);
    const roleDefinition = await this._domainReader.read({
      node: resolvedNamespace,
    });
    if (DomainReader.isRoleDefinitionV2(roleDefinition)) {
      roleDefCache?.setRoleDefinition(namespace, roleDefinition);
      return roleDefinition.issuer;
    }
    return undefined;
  }
}
