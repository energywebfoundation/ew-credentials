import { RoleEIP191JWT } from '../models';
import { VerifiableCredential } from '@ew-did-registry/credentials-interface';
import type { RoleCredentialSubject } from '@energyweb/credential-governance';
import { IRoleCredentialCache } from '../models';

/**
 * A class to cache role credential from EVMs / Blockchain
 */
export class RoleCredentialCache implements IRoleCredentialCache {
  private cachedRoleCredential: {
    [key: string]: RoleEIP191JWT | VerifiableCredential<RoleCredentialSubject>;
  } = {};

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
  ) {
    this.cachedRoleCredential[did + role] = data;
  }

  /**
   * Returns cached role credential
   * @param did user DID
   * @param role namespace
   */
  getRoleCredential(
    did: string,
    role: string
  ): RoleEIP191JWT | VerifiableCredential<RoleCredentialSubject> | undefined {
    return this.cachedRoleCredential[did + role];
  }
}
