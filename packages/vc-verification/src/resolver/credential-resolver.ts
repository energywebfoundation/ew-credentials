import type { RoleCredentialSubject } from '@energyweb/credential-governance';
import { VerifiableCredential } from '@ew-did-registry/credentials-interface';
import { RoleEIP191JWT } from '../models';
import { IRoleCredentialCache } from '../models/cache-interfaces';

/**
 * An interface for a credential resolver
 */
export interface CredentialResolver {
  /**
   * Fetches verifiable credential belonging to a DID for the provided namespace
   * @param did
   * @param namespace
   * @returns Verifiable Credential of the holder for the namespace
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
   * @returns RoleEIP191JWT or VC
   */
  getCredential(
    did: string,
    namespace: string
  ): Promise<
    VerifiableCredential<RoleCredentialSubject> | RoleEIP191JWT | undefined
  >;

  /**
   * Fetches all RoleEIP191JWT belonging to a subject DID
   * @param did
   * @returns RoleEIP191JWT list
   */
  eip191JwtsOf(did: string): Promise<RoleEIP191JWT[]>;

  /**
   * Fetches all Verifiable Credential belonging to a subject DID
   * @param did
   * @returns VerifiableCredential<RoleCredentialSubject> list
   */
  credentialsOf(
    did: string
  ): Promise<VerifiableCredential<RoleCredentialSubject>[]>;

  /**
   * Sets intermediate cache for the resolution request
   * @param roleCredentialcache
   */
  setRoleCredentialCache(roleCredentialcache: IRoleCredentialCache): void;
}
