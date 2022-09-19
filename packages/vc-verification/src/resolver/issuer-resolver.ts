import { DomainReader } from '@energyweb/credential-governance';
import type { IIssuerDefinition } from '@energyweb/credential-governance';
import { utils } from 'ethers';
import { EVMDataAggregator } from './evm-data-aggregator';

/**
 * An interface for Resolution of Issuers for a namespace
 */
export interface IssuerResolver {
  /**
   * Fetches authorised issuers for the provided namespace
   * @param namespace for which the issuers needs to be fetched
   * @returns IIssuerDefinition for the namespace
   */
  getIssuerDefinition(
    namespace: string
  ): Promise<IIssuerDefinition | undefined>;
}

/**
 * Resolves issuers definition by reading smart contract state via an Ethers provider
 */
export class EthersProviderIssuerResolver implements IssuerResolver {
  private _domainReader: DomainReader;
  private _dataAgregator: EVMDataAggregator;

  constructor(domainReader: DomainReader, dataAggregator: EVMDataAggregator) {
    this._domainReader = domainReader;
    this._dataAgregator = dataAggregator;
  }

  /**
   * Fetches authorised issuers for the provided namespace
   *
   * ```typescript
   * const issuerResolver = new EthersProviderIssuerResolver(domainReader);
   * const role = 'sampleRole';
   * const issuers = issuerResolver.getIssuerDefinition(sampleRole);
   * ```
   * @param namespace for which the issuers need to be fetched
   * @returns IIssuerDefinition for the namespace from blockchain contract
   */
  async getIssuerDefinition(
    namespace: string
  ): Promise<IIssuerDefinition | undefined> {
    const cachedRoleDefinition =
      this._dataAgregator.getRoleDefinition(namespace);
    if (cachedRoleDefinition) {
      return cachedRoleDefinition.data.issuer;
    }
    const resolvedNamespace = namespace.startsWith('0x')
      ? namespace
      : utils.namehash(namespace);
    const roleDefinition = await this._domainReader.read({
      node: resolvedNamespace,
    });
    if (DomainReader.isRoleDefinitionV2(roleDefinition)) {
      this._dataAgregator.setRoleDefinition(namespace, roleDefinition);
      return roleDefinition.issuer;
    }
    return undefined;
  }
}
