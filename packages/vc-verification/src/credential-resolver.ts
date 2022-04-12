import { CachedDidDocCredentialResolver, IpfsCredentialResolver } from '.';

/**
 * This class handles the different approaches for credential resolution
 */
export class CredentialResolver {
  private _credentialResolver:
    | CachedDidDocCredentialResolver
    | IpfsCredentialResolver;

  constructor(
    credentialResolver: CachedDidDocCredentialResolver | IpfsCredentialResolver
  ) {
    this._credentialResolver = credentialResolver;
  }

  /**
   *
   * @param did
   * @param namespace
   * @returns Offchain claim of the holder for the given namespace
   */
  async getCredential(did: string, namespace: string) {
    return this._credentialResolver.getCredential(did, namespace);
  }
}
