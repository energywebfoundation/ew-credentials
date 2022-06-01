import {
  DomainReader,
  IIssuerDefinition,
  IRoleDefinitionV2,
} from '@energyweb/credential-governance';
import { utils } from 'ethers';

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
}
