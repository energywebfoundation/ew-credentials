import {
  CachedDIDDocument,
  CachedRoleCredential,
  CachedRoleDefinition,
} from '../models';
import { IDataAggregator } from './data-aggregator';

/**
 * A class to aggreagate data from EVMs
 */
export class EVMDataAggregator implements IDataAggregator {
  private cahedRoleDefinition: CachedRoleDefinition[] = [];
  private cachedDIDDocument: CachedDIDDocument[] = [];
  private cachedRoleCredential: CachedRoleCredential[] = [];

  /**
   * Stores role credential
   * @param did user DID
   * @param role namespace
   * @param data Credential of the user for the namespace
   */
  setRoleCredential(did: string, role: string, data: any) {
    this.cachedRoleCredential.push({ did, role, data });
  }

  /**
   * Stores DID Document
   * @param did user DID
   * @param data DIDDocument of the user (DID)
   */
  setDIDDocument(did: string, data: any) {
    this.cachedDIDDocument.push({ did, data });
  }

  /**
   * Stores RoleDefinition
   * @param role namespace for which definition is being stored
   * @param data role definition
   */
  setRoleDefinition(role: string, data: any) {
    this.cahedRoleDefinition.push({ role, data });
  }

  /**
   * Returns cached role credential
   * @param did user DID
   * @param role namespace
   */
  getRoleCredential(
    did: string,
    role: string
  ): CachedRoleCredential | undefined {
    return this.cachedRoleCredential.find(
      (credential) => credential.did === did && credential.role === role
    );
  }

  /**
   * Returns cached DID Document (services)
   * @param did user DID
   */
  getDIDDocument(did: string): CachedDIDDocument | undefined {
    return this.cachedDIDDocument.find(
      (didDocument) => didDocument.did === did
    );
  }

  /**
   * Returns cached role defintion
   * @param role namespace
   */
  getRoleDefinition(role: string): CachedRoleDefinition | undefined {
    return this.cahedRoleDefinition.find(
      (roleDefinition) => roleDefinition.role === role
    );
  }
}
