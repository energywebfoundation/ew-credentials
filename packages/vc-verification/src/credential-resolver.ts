import { IVerifiableCredential, OffChainClaim } from './models';

/**
 * An interface for a credential resolver
 */
export interface CredentialResolver {
  /**
   * Fetches credential belonging to a DID for the provided namespace
   * @param did
   * @param namespace
   * @returns Offchain claim of the holder for the namespace
   */
  getCredential(
    did: string,
    namespace: string
  ): Promise<IVerifiableCredential | undefined>;

  /**
   * Fetches OffChainClaims belonging to a DID for the provided namespace
   * @param did
   * @param namespace
   * @returns Offchain claim of the holder for the namespace
   */
  getClaimIssuedToken(
    did: string,
    namespace: string
  ): Promise<string | undefined>;
}
