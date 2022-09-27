import { IRoleDefinitionV2 } from '@energyweb/credential-governance';
import { IRoleDefinitionCache } from '../models';

/**
 * A class to cache role definition from EVMs / blockchain
 */
export class RoleDefinitionCache implements IRoleDefinitionCache {
  private cachedRoleDefinition: { [key: string]: IRoleDefinitionV2 } = {};

  /**
   * Stores RoleDefinition
   * @param role namespace for which definition is being stored
   * @param data role definition
   */
  setRoleDefinition(role: string, data: IRoleDefinitionV2) {
    this.cachedRoleDefinition[role] = data;
  }

  /**
   * Returns cached role defintion
   * @param role namespace
   */
  getRoleDefinition(role: string): IRoleDefinitionV2 | undefined {
    return this.cachedRoleDefinition[role];
  }
}
