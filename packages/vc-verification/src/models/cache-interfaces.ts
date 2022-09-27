import {
  IRoleDefinitionV2,
  RoleCredentialSubject,
} from '@energyweb/credential-governance';
import { VerifiableCredential } from '@ew-did-registry/credentials-interface';
import { RoleEIP191JWT } from './credentials-types';
import { IDIDDocument } from '@ew-did-registry/did-resolver-interface';

/**
 * An Interface to cache DID Documents
 */
export interface IDIDDocumentCache {
  /**
   * Stores DID Document
   * @param did user DID
   * @param data DIDDocument of the user (DID)
   */
  setDIDDocument(did: string, data: IDIDDocument): void;

  /**
   * Returns cached DID Document (services)
   * @param did user DID
   */
  getDIDDocument(did: string): IDIDDocument | undefined;
}

/**
 * An Interface to cache role credential
 */
export interface IRoleCredentialCache {
  /**
   * Stores role credential
   * @param did user DID
   * @param role namespace
   * @param data Credential of the user for the namespace
   */
  setRoleCredential(
    did: string,
    role: string,
    data: RoleEIP191JWT | VerifiableCredential<RoleCredentialSubject>
  ): void;

  /**
   * Returns cached role credential
   * @param did user DID
   * @param role namespace
   */
  getRoleCredential(
    did: string,
    role: string
  ): RoleEIP191JWT | VerifiableCredential<RoleCredentialSubject> | undefined;
}

/**
 * An Interface to cache role definition
 */
export interface IRoleDefinitionCache {
  /**
   * Stores RoleDefinition
   * @param role namespace for which definition is being stored
   * @param data role definition
   */
  setRoleDefinition(role: string, data: IRoleDefinitionV2): void;

  /**
   * Returns cached role defintion
   * @param role namespace
   */
  getRoleDefinition(role: string): IRoleDefinitionV2 | undefined;
}
