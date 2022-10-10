import type { RoleCredentialSubject } from '@energyweb/credential-governance';
import { VerifiableCredential } from '@ew-did-registry/credentials-interface';
import {
  RoleEIP191JWT,
  IDIDDocumentCache,
  IRoleCredentialCache,
} from '../models';
import { IDIDDocument } from '@ew-did-registry/did-resolver-interface';

/**
 * An interface for a credential resolver
 */
export interface CredentialResolver {
  /**
   * Fetches verifiable credential belonging to a DID for the provided namespace
   * @param did
   * @param namespace
   * @param roleCredentialCache
   * @param didDocumentCache
   * @returns Verifiable Credential of the holder for the namespace
   */
  getVerifiableCredential(
    did: string,
    namespace: string,
    roleCredentialCache?: IRoleCredentialCache,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<VerifiableCredential<RoleCredentialSubject> | undefined>;

  /**
   * Fetches RoleEIP191JWT belonging to a DID for the provided namespace
   * @param did
   * @param namespace
   * @param roleCredentialCache
   * @param didDocumentCache
   * @returns RoleEIP191JWT corresponding to credential of the holder for the namespace
   */
  getEIP191JWT(
    did: string,
    namespace: string,
    roleCredentialCache?: IRoleCredentialCache,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<RoleEIP191JWT | undefined>;

  /**
   * Fetches either RoleEIP191JWT or VC belonging to a DID for the provided namespace
   * @param did
   * @param namespace
   * @param roleCredentialCache
   * @param didDocumentCache
   * @returns RoleEIP191JWT or VC
   */
  getCredential(
    did: string,
    namespace: string,
    roleCredentialCache?: IRoleCredentialCache,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<
    VerifiableCredential<RoleCredentialSubject> | RoleEIP191JWT | undefined
  >;

  /**
   * Fetches all RoleEIP191JWT belonging to a subject DID
   * @param did
   * @param didDocumentCache
   * @returns RoleEIP191JWT list
   */
  eip191JwtsOf(
    did: string,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<RoleEIP191JWT[]>;

  /**
   * Fetches all Verifiable Credential belonging to a subject DID
   * @param did
   * @param didDocumentCache
   * @returns VerifiableCredential<RoleCredentialSubject> list
   */
  credentialsOf(
    did: string,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<VerifiableCredential<RoleCredentialSubject>[]>;

  /**
   * Fetches DID Document for the given DID
   * @param did
   * @param didDocumentCache
   */
  getDIDDocument(
    did: string,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<IDIDDocument>;
}
