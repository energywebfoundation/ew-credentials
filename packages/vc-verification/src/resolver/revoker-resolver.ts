import { DomainReader } from '@energyweb/credential-governance';
import type { IRevokerDefinition } from '@energyweb/credential-governance';
import { utils } from 'ethers';
import { EVMDataAggregator } from './evm-data-aggregator';

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
}

/**
 * Resolves revokers definition by reading smart contract state via an Ethers provider
 */
export class EthersProviderRevokerResolver implements RevokerResolver {
  private _domainReader: DomainReader;
  private _dataAgregator: EVMDataAggregator;

  constructor(domainReader: DomainReader, dataAggregator: EVMDataAggregator) {
    this._domainReader = domainReader;
    this._dataAgregator = dataAggregator;
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
      this._dataAgregator.getRoleDefinition(namespace);
    if (cachedRoleDefinition) {
      return cachedRoleDefinition.data.revoker;
    }
    const resolvedNamespace = namespace.startsWith('0x')
      ? namespace
      : utils.namehash(namespace);
    const roleDefinition = await this._domainReader.read({
      node: resolvedNamespace,
    });
    if (DomainReader.isRoleDefinitionV2(roleDefinition)) {
      this._dataAgregator.setRoleDefinition(namespace, roleDefinition);
      return roleDefinition.revoker;
    }
    return undefined;
  }
}
