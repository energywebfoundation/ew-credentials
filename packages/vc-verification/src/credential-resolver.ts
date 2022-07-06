import type { RoleCredentialSubject } from '@energyweb/credential-governance';
import { VerifiableCredential } from '@ew-did-registry/credentials-interface';
import { OffChainClaim } from './models';

/**
 * An interface for a credential resolver
 */
export interface CredentialResolver {
  /**
   * Fetches verifiable credential belonging to a DID for the provided namespace
   * @param did
   * @param namespace
   * @returns Offchain claim of the holder for the namespace
   */
  getVerifiableCredential(
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

  /**
   * Fetches either claim issuedToken or VC belonging to a DID for the provided namespace
   * @param did
   * @param namespace
   * @returns Offchain claim of the holder for the namespace
   */
  getCredential(
    did: string,
    namespace: string
  ): Promise<
    VerifiableCredential<RoleCredentialSubject> | OffChainClaim | undefined
  >;
}
