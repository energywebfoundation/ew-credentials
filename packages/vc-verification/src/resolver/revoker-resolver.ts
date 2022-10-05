import { DomainReader } from '@energyweb/credential-governance';
import type { IRevokerDefinition } from '@energyweb/credential-governance';
import { utils } from 'ethers';
import { IRoleDefinitionCache } from '../models';

/**
 * An interface for Resolution of revokers for a namespace
 */
export interface RevokerResolver {
  /**
   * Fetches authorised revokers for the provided namespace
   * @param namespace
   * @param roleDefCache Cache to store RoleDefinition. Cache is updated with retrieved role definition if not present.
   * @returns IRevokerDefinition for the namespace
   */
  getRevokerDefinition(
    namespace: string,
    roleDefCache?: IRoleDefinitionCache
  ): Promise<IRevokerDefinition | undefined>;
}

/**
 * Resolves revokers definition by reading smart contract state via an Ethers provider
 */
export class EthersProviderRevokerResolver implements RevokerResolver {
  private _domainReader: DomainReader;

  constructor(domainReader: DomainReader) {
    this._domainReader = domainReader;
  }

  /**
   * Fetches revokers for the name space
   *
   * ```typescript
   * const revokerResolver = new EthersProviderRevokerResolver(domainReader);
   * const role = 'sampleRole';
   * const revokers = revokerResolver.getRevokerDefinition(role, roleDefCache);
   * ```
   * @param namespace for which revokers need to be fetched
   * @param roleDefCache Cache to store and fetch role definition. Cache is updated with retrieved role definition if not present.
   * @returns IRevokerDefinition for the namespace from blockchain contract
   */
  async getRevokerDefinition(
    namespace: string,
    roleDefCache?: IRoleDefinitionCache
  ): Promise<IRevokerDefinition | undefined> {
    const cachedRoleDefinition = roleDefCache?.getRoleDefinition(namespace);
    if (cachedRoleDefinition) {
      return cachedRoleDefinition.revoker;
    }
    const resolvedNamespace = namespace.startsWith('0x')
      ? namespace
      : utils.namehash(namespace);
    const roleDefinition = await this._domainReader.read({
      node: resolvedNamespace,
    });
    if (DomainReader.isRoleDefinitionV2(roleDefinition)) {
      roleDefCache?.setRoleDefinition(namespace, roleDefinition);
      return roleDefinition.revoker;
    }
    return undefined;
  }
}
