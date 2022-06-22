import type { RoleCredentialSubject } from '@energyweb/credential-governance';
import { VerifiableCredential } from '@ew-did-registry/credentials-interface';

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
  ): Promise<VerifiableCredential<RoleCredentialSubject> | undefined>;

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
