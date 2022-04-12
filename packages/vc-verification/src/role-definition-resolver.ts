import { CachedRoleDefinitionResolver, ENSRoleDefinitionResolver } from '.';
export class RoleDefinitionResolver {
  private _roleDefResolver:
    | CachedRoleDefinitionResolver
    | ENSRoleDefinitionResolver;

  /**
   * The RoleDefinitionResolver class could be initialised either with
   * CachedRoleDefinitionResolver or ENSRoleDefinitionResolver
   * @param rolDefResolver
   */
  constructor(
    rolDefResolver: CachedRoleDefinitionResolver | ENSRoleDefinitionResolver
  ) {
    this._roleDefResolver = rolDefResolver;
  }

  /**
   *
   * @param namespace
   * @returns list of authorised issuers for the namespace
   */
  async getRoleIssuers(namespace: string) {
    return this._roleDefResolver.getRoleIssuers(namespace);
  }
}
