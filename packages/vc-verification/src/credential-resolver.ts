import { CachedDidDocCredentialResolver, IpfsCredentialResolver } from '.';

/**
 * An interface for a credential resolver
 */
export interface CredentialResolver {
  /**
   *
   * @param did
   * @param namespace
   * @returns Offchain claim of the holder for the given namespace
   */
  async getCredential(did: string, namespace: string)
}
