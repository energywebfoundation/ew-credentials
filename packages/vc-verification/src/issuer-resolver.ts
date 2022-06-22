import { DomainReader } from '@energyweb/credential-governance';
import type { IIssuerDefinition } from '@energyweb/credential-governance';
import { utils } from 'ethers';

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

  constructor(domainReader: DomainReader) {
    this._domainReader = domainReader;
  }

  /**
   * Fetches authorised issuers for the provided namespace
   * @param namespace for which the issuers need to be fetched
   * @returns IIssuerDefinition for the namespace from blockchain contract
   */
  async getIssuerDefinition(
    namespace: string
  ): Promise<IIssuerDefinition | undefined> {
    const resolvedNamespace = namespace.startsWith('0x')
      ? namespace
      : utils.namehash(namespace);
    const roleDefinition = await this._domainReader.read({
      node: resolvedNamespace,
    });
    if (DomainReader.isRoleDefinitionV2(roleDefinition)) {
      return roleDefinition.issuer;
    }
    return undefined;
  }
}
