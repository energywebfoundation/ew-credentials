import { OffChainClaim } from './models';

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
  getCredential(
    did: string,
    namespace: string
  ): Promise<OffChainClaim | undefined>;
}
