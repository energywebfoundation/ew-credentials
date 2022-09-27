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
   * @returns IRevokerDefinition for the namespace
   */
  getRevokerDefinition(
    namespace: string
  ): Promise<IRevokerDefinition | undefined>;

  /**
   * Sets intermediate cache for the resolution request
   * @param roleDefCache
   */
  setRoleDefinitionCache(roleDefCache: IRoleDefinitionCache): void;
}

/**
 * Resolves revokers definition by reading smart contract state via an Ethers provider
 */
export class EthersProviderRevokerResolver implements RevokerResolver {
  private _domainReader: DomainReader;
  private _roleDefCache: IRoleDefinitionCache | undefined;

  constructor(domainReader: DomainReader) {
    this._domainReader = domainReader;
  }

  /**
   * Fetches revokers for the name space
   *
   * ```typescript
   * const revokerResolver = new EthersProviderRevokerResolver(domainReader);
   * const role = 'sampleRole';
   * const revokers = revokerResolver.getRevokerDefinition(role);
   * ```
   * @param namespace for which revokers need to be fetched
   * @returns IRevokerDefinition for the namespace from blockchain contract
   */
  async getRevokerDefinition(
    namespace: string
  ): Promise<IRevokerDefinition | undefined> {
    const cachedRoleDefinition =
      this._roleDefCache?.getRoleDefinition(namespace);
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
      this._roleDefCache?.setRoleDefinition(namespace, roleDefinition);
      return roleDefinition.revoker;
    }
    return undefined;
  }

  /**
   * Sets intermediate cache
   * @param roleDefCache
   */
  setRoleDefinitionCache(roleDefCache: IRoleDefinitionCache): void {
    this._roleDefCache = roleDefCache;
  }
}
