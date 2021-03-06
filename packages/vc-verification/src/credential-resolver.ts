import type { RoleCredentialSubject } from '@energyweb/credential-governance';
import { VerifiableCredential } from '@ew-did-registry/credentials-interface';
import { RoleEIP191JWT } from './models';

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
   * Fetches RoleEIP191JWT belonging to a DID for the provided namespace
   * @param did
   * @param namespace
   * @returns RoleEIP191JWT corresponding to credential of the holder for the namespace
   */
  getEIP191JWT(
    did: string,
    namespace: string
  ): Promise<RoleEIP191JWT | undefined>;

  /**
   * Fetches either RoleEIP191JWT or VC belonging to a DID for the provided namespace
   * @param did
   * @param namespace
   * @returns Offchain claim of the holder for the namespace
   */
  getCredential(
    did: string,
    namespace: string
  ): Promise<
    VerifiableCredential<RoleCredentialSubject> | RoleEIP191JWT | undefined
  >;
}
