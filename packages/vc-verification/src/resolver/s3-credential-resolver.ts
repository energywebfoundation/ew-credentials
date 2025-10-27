import { providers, utils } from 'ethers';
import plimit from 'p-limit';
import { DidStore } from '@ew-did-registry/did-s3-store';
import { IDidStore } from '@ew-did-registry/did-store-interface';
import { Resolver } from '@ew-did-registry/did-ethr-resolver';
import {
  RegistrySettings,
  IDIDDocument,
} from '@ew-did-registry/did-resolver-interface';
import { decode } from 'jsonwebtoken';
import {
  RoleEIP191JWT,
  RolePayload,
  IDIDDocumentCache,
  IRoleCredentialCache,
} from '../models';
import {
  isEIP191Jwt,
  filterOutMaliciousClaims,
  transformClaim,
  isVerifiableCredential,
  isCID,
} from '../utils';
import { CredentialResolver } from './credential-resolver';
import { VerifiableCredential } from '@ew-did-registry/credentials-interface';
import { RoleCredentialSubject } from '@energyweb/credential-governance';

export class S3CredentialResolver implements CredentialResolver {
  private _didStore: IDidStore;
  private _resolver: Resolver;
  private RESOLVE_TIMEOUT = 90000;
  // NOTE: decrease this if receive `too many p2p requests
  private BATCH_SIZE = 10;

  constructor(
    provider: providers.Provider,
    registrySetting: RegistrySettings,
    didStore: DidStore
  ) {
    this._didStore = didStore;
    this._resolver = new Resolver(provider, registrySetting);
  }

  /**
   * Fetches credential for the given did and role for a vc issuance hierarchy
   *
   * ```typescript
   * const credentialResolver = new S3CredentialResolver(
   *  provider,
   *  registrySettings,
   *  didStore );
   * const credential = credentialResolver.getCredential('did:ethr:1234', 'sampleRole', roleCredentialCache, didDocumentCache);
   * ```
   *
   * @param did subject DID for which the credential needs to be fetched
   * @param namespace role for which the credential needs to be fetched
   * @param roleCredentialCache Cache to store role credentials
   * @param didDocumentCache Cache to store DID Documents.
   * @returns
   */
  async getCredential(
    did: string,
    namespace: string,
    roleCredentialCache?: IRoleCredentialCache,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<
    VerifiableCredential<RoleCredentialSubject> | RoleEIP191JWT | undefined
  > {
    let credential:
      | VerifiableCredential<RoleCredentialSubject>
      | RoleEIP191JWT
      | undefined;
    const cachedRoleCredential = roleCredentialCache?.getRoleCredential(
      did,
      namespace
    );
    if (cachedRoleCredential) {
      return cachedRoleCredential;
    }
    credential = await this.getVerifiableCredential(
      did,
      namespace,
      roleCredentialCache,
      didDocumentCache
    );
    if (!credential) {
      credential = await this.getEIP191JWT(
        did,
        namespace,
        roleCredentialCache,
        didDocumentCache
      );
    }
    return credential;
  }

  /**
   * Fetches Verifiable Credential for the given did and role for a vc issuance hierarchy
   *
   * ```typescript
   * const credentialResolver = new S3CredentialResolver(
   *  provider,
   *  registrySettings,
   *  didStore );
   * const credential = credentialResolver.getVerifiableCredential('did:ethr:1234', 'sampleRole', roleCredentialCache, didDocumentCache);
   * ```
   *
   * @param did subject DID for which the credential needs to be fetched
   * @param namespace role for which the credential needs to be fetched
   * @param roleCredentialCache Cache to store role credentials. Cache is updated with all credentials retrieved for the DID
   * @param didDocumentCache Cache to store DID Documents.
   * @returns
   */
  async getVerifiableCredential(
    did: string,
    namespace: string,
    roleCredentialCache?: IRoleCredentialCache,
    didDocumentCache?: IDIDDocumentCache
  ) {
    const cachedRoleCredential = roleCredentialCache?.getRoleCredential(
      did,
      namespace
    );
    if (isVerifiableCredential(cachedRoleCredential)) {
      return cachedRoleCredential;
    }
    const credentials = await this.credentialsOf(did, didDocumentCache);
    credentials.forEach((credential) =>
      roleCredentialCache?.setRoleCredential(
        did,
        credential.credentialSubject.role.namespace,
        credential
      )
    );
    return credentials.find(
      (claim) =>
        claim.credentialSubject.role.namespace === namespace ||
        utils.namehash(claim.credentialSubject.role.namespace) === namespace
    );
  }

  /**
   * Fetches RoleEIP191JWT for the given did and role for an RoleEIP191JWT issuance hierarchy
   *
   * ```typescript
   * const credentialResolver = new S3CredentialResolver(
   *  provider,
   *  registrySettings,
   *  didStore );
   * const credential = credentialResolver.getEIP191JWT('did:ethr:1234', 'sampleRole', roleCredentialCache, didDocumentCache);
   * ```
   *
   * @param did subject DID for which the credential to be fetched
   * @param namespace role for which the credential need to be fetched
   * @param roleCredentialCache Cache to store role credentials. Cache is updated with all credentials retrieved for the DID
   * @param didDocumentCache Cache to store DID Documents
   * @returns RoleEIP191JWT
   */
  async getEIP191JWT(
    did: string,
    namespace: string,
    roleCredentialCache?: IRoleCredentialCache,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<RoleEIP191JWT | undefined> {
    const cachedRoleCredential = roleCredentialCache?.getRoleCredential(
      did,
      namespace
    );
    if (isEIP191Jwt(cachedRoleCredential)) {
      return cachedRoleCredential;
    }
    const eip191Jwts = await this.eip191JwtsOf(did, didDocumentCache);
    eip191Jwts.forEach((eip191Jwt) => {
      const claimType = eip191Jwt?.payload?.claimData?.claimType;
      if (claimType) {
        roleCredentialCache?.setRoleCredential(did, claimType, eip191Jwt);
      }
    });
    return eip191Jwts.find(
      (jwt) =>
        jwt?.payload?.claimData.claimType === namespace ||
        utils.namehash(jwt?.payload?.claimData.claimType) === namespace
    );
  }

  /**
   * Fetches all the Role eip191Jwts belonging to the subject DID
   * @param did subject DID
   * @param didDocumentCache Cache to store DID Documents.
   * @returns RoleEIP191JWT list
   */
  async eip191JwtsOf(
    did: string,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<RoleEIP191JWT[]> {
    const didDocument = await this.getDIDDocument(did, didDocumentCache);
    const services = didDocument.service.map((s) => s.serviceEndpoint) || [];
    const uniqueServices = [...new Set(services)];
    const resolved = await this.resolveFromDidStoreBatch(uniqueServices);

    return resolved
      .filter((claimToken) => claimToken.split('.').length === 3)
      .map((claimToken) => ({
        payload: decode(claimToken) as RolePayload,
        eip191Jwt: claimToken,
      }))
      .filter(isEIP191Jwt)
      .map(transformClaim)
      .filter(filterOutMaliciousClaims);
  }

  /**
   * Fetches all the Verifiable Credential belonging to the subject DID
   * @param did subject DID
   * @param didDocumentCache Cache to store DID Documents.
   * @returns VerifiableCredential<RoleCredentialSubject> list
   */
  async credentialsOf(
    did: string,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<VerifiableCredential<RoleCredentialSubject>[]> {
    const didDocument = await this.getDIDDocument(did, didDocumentCache);
    const services = didDocument.service.map((s) => s.serviceEndpoint) || [];
    const resolved = await this.resolveFromDidStoreBatch(services);

    return resolved
      .filter((cred) => cred.split('.').length !== 3)
      .map((cred) => JSON.parse(cred))
      .filter(isVerifiableCredential);
  }

  /**
   * Fetches DID Document for the given DID
   * @param did subject DID
   * @param didDocumentCache Cache to store DIDDocument. Cache is updated with Document retrieved for the DID
   * @returns
   */
  async getDIDDocument(
    did: string,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<IDIDDocument> {
    const cachedDIDDocument = didDocumentCache?.getDIDDocument(did);
    if (cachedDIDDocument) {
      return cachedDIDDocument;
    }
    const resolvedDIDDocument = await this._resolver.read(did);
    didDocumentCache?.setDIDDocument(did, resolvedDIDDocument);
    return resolvedDIDDocument;
  }

  private async resolveFromDidStore(service: string): Promise<string> {
    const timeoutMs = this.RESOLVE_TIMEOUT;

    return new Promise<string>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const msg = `[S3CredentialResolver] Timeout resolving ${service}. Token is skipped\n`;
        process.stdout.write(msg);
        reject(new Error(msg));
      }, timeoutMs);

      this._didStore.get(service)
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          reject(err);
        });
    });
  }

  private async resolveFromDidStoreBatch(
    services: string[]
  ): Promise<string[]> {
    const limit = plimit(this.BATCH_SIZE);
    const resolved = await Promise.allSettled(
      services
        .filter((service) => isCID(service))
        .map((service) => limit(() => this.resolveFromDidStore(service)))
    );
    return resolved
      .filter((r) => r.status == 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<string>).value);
  }
}
