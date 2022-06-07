import {
  DomainReader,
  IIssuerDefinition,
  IRevokerDefinition,
} from '@energyweb/credential-governance';
import { utils } from 'ethers';

/**
 * An interface for Resolution of issuers and revokers for a namespace
 */
export interface AuthorityResolver {
  /**
   * Fetches authorised issuers for the provided namespace
   * @param namespace
   * @returns IIssuerDefinition for the namespace
   */
  getIssuerDefinition(
    namespace: string
  ): Promise<IIssuerDefinition | undefined>;

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
 * Resolves issuers and revokers definition by reading smart contract state via an Ethers provider
 */
export class EthersProviderAuthorityResolver implements AuthorityResolver {
  private _domainReader: DomainReader;

  constructor(domainReader: DomainReader) {
    this._domainReader = domainReader;
  }

  /**
   *
   * @param namespace
   * @returns issuers for the namespace from blockchain contract
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

  /**
   *
   * @param namespace
   * @returns revokers for the namespace from blockchain contract
   */
  async getRevokerDefinition(
    namespace: string
  ): Promise<IRevokerDefinition | undefined> {
    const resolvedNamespace = namespace.startsWith('0x')
      ? namespace
      : utils.namehash(namespace);
    const roleDefinition = await this._domainReader.read({
      node: resolvedNamespace,
    });
    if (DomainReader.isRoleDefinitionV2(roleDefinition)) {
      return roleDefinition.revoker;
    }
    return undefined;
  }
}
