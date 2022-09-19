import {
  CachedDIDDocument,
  CachedRoleCredential,
  CachedRoleDefinition,
} from '../models';

/**
 * An Interface for Data aggreator to cache responses from Blockchain and SSI-Hub
 */
export interface IDataAggregator {
  /**
   * Stores role credential
   * @param did user DID
   * @param role namespace
   * @param data Credential of the user for the namespace
   */
  setRoleCredential(did: string, role: string, data: any): void;

  /**
   * Stores DID Document
   * @param did user DID
   * @param data DIDDocument of the user (DID)
   */
  setDIDDocument(did: string, data: any): void;

  /**
   * Stores RoleDefinition
   * @param role namespace for which definition is being stored
   * @param data role definition
   */
  setRoleDefinition(role: string, data: any): void;

  /**
   * Returns cached role credential
   * @param did user DID
   * @param role namespace
   */
  getRoleCredential(
    did: string,
    role: string
  ): CachedRoleCredential | undefined;

  /**
   * Returns cached DID Document (services)
   * @param did user DID
   */
  getDIDDocument(did: string): CachedDIDDocument | undefined;

  /**
   * Returns cached role defintion
   * @param role namespace
   */
  getRoleDefinition(role: string): CachedRoleDefinition | undefined;
}
