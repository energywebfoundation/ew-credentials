import { providers, utils } from 'ethers';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { IDidStore } from '@ew-did-registry/did-store-interface';
import { Resolver } from '@ew-did-registry/did-ethr-resolver';
import {
  RegistrySettings,
  IServiceEndpoint,
} from '@ew-did-registry/did-resolver-interface';
import * as jwt from 'jsonwebtoken';
import { RoleEIP191JWT, RolePayload } from '../models';
import {
  isEIP191Jwt,
  filterOutMaliciousClaims,
  transformClaim,
  isVerifiableCredential,
  isCID,
} from '../utils';
import { CredentialResolver } from './credential-resolver';
import { VerifiableCredential } from '@ew-did-registry/credentials-interface';
import type { RoleCredentialSubject } from '@energyweb/credential-governance';
import { IRoleCredentialCache } from '../models/cache-interfaces';

export class IpfsCredentialResolver implements CredentialResolver {
  private _ipfsStore: IDidStore;
  private _resolver: Resolver;
  private _roleCredentialCache: IRoleCredentialCache | undefined;

  constructor(
    provider: providers.Provider,
    registrySetting: RegistrySettings,
    didStore: DidStore
  ) {
    this._ipfsStore = didStore;
    this._resolver = new Resolver(provider, registrySetting);
  }

  /**
   * Fetches credential for the given did and role for a vc issuance hierarchy
   *
   * ```typescript
   * const credentialResolver = new IpfsCredentialResolver(
   *  provider,
   *  registrySettings,
   *  didStore );
   * const credential = credentialResolver.getCredential('did:ethr:1234', 'sampleRole');
   * ```
   *
   * @param did subject DID for which the credential needs to be fetched
   * @param namespace role for which the credential needs to be fetched
   * @returns
   */
  async getCredential(
    did: string,
    namespace: string
  ): Promise<
    VerifiableCredential<RoleCredentialSubject> | RoleEIP191JWT | undefined
  > {
    let credential:
      | VerifiableCredential<RoleCredentialSubject>
      | RoleEIP191JWT
      | undefined;
    const cachedRoleCredential = this._roleCredentialCache?.getRoleCredential(
      did,
      namespace
    );
    if (cachedRoleCredential) {
      return cachedRoleCredential;
    }
    credential = await this.getVerifiableCredential(did, namespace);
    if (!credential) {
      credential = await this.getEIP191JWT(did, namespace);
    }
    return credential;
  }

  /**
   * Fetches Verifiable Credential for the given did and role for a vc issuance hierarchy
   *
   * ```typescript
   * const credentialResolver = new IpfsCredentialResolver(
   *  provider,
   *  registrySettings,
   *  didStore );
   * const credential = credentialResolver.getVerifiableCredential('did:ethr:1234', 'sampleRole');
   * ```
   *
   * @param did subject DID for which the credential needs to be fetched
   * @param namespace role for which the credential needs to be fetched
   * @returns
   */
  async getVerifiableCredential(did: string, namespace: string) {
    const credentials = await this.credentialsOf(did);
    credentials.forEach((credential) =>
      this._roleCredentialCache?.setRoleCredential(
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
   * const credentialResolver = new IpfsCredentialResolver(
   *  provider,
   *  registrySettings,
   *  didStore );
   * const credential = credentialResolver.getEIP191JWT('did:ethr:1234', 'sampleRole');
   * ```
   *
   * @param did subject DID for which the credential to be fetched
   * @param namespace role for which the credential need to be fetched
   * @returns RoleEIP191JWT
   */
  async getEIP191JWT(
    did: string,
    namespace: string
  ): Promise<RoleEIP191JWT | undefined> {
    const eip191Jwts = await this.eip191JwtsOf(did);
    eip191Jwts.forEach((eip191Jwt) => {
      const claimType = eip191Jwt?.payload?.claimData?.claimType;
      if (claimType) {
        this._roleCredentialCache?.setRoleCredential(did, claimType, eip191Jwt);
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
   * @returns RoleEIP191JWT list
   */
  async eip191JwtsOf(did: string): Promise<RoleEIP191JWT[]> {
    const didDocument = await this._resolver.read(did);
    const services: IServiceEndpoint[] = didDocument.service || [];
    return (
      await Promise.all(
        services.map(async ({ serviceEndpoint }) => {
          if (!isCID(serviceEndpoint)) {
            return {};
          }
          const claimToken = await this._ipfsStore.get(serviceEndpoint);
          let rolePayload: RolePayload | undefined;
          // expect that JWT has 3 dot-separated parts
          if (claimToken.split('.').length === 3) {
            rolePayload = jwt.decode(claimToken) as RolePayload;
          }
          return {
            payload: rolePayload,
            eip191Jwt: claimToken,
          } as RoleEIP191JWT;
        })
      )
    )
      .filter(isEIP191Jwt)
      .map(transformClaim)
      .filter(filterOutMaliciousClaims);
  }

  /**
   * Fetches all the Verifiable Credential belonging to the subject DID
   * @param did subject DID
   * @returns VerifiableCredential<RoleCredentialSubject> list
   */
  async credentialsOf(
    did: string
  ): Promise<VerifiableCredential<RoleCredentialSubject>[]> {
    const didDocument = await this._resolver.read(did);
    const services: IServiceEndpoint[] = didDocument.service || [];
    return (
      await Promise.all(
        services.map(async ({ serviceEndpoint }) => {
          if (!isCID(serviceEndpoint)) {
            return {};
          }
          const credential = await this._ipfsStore.get(serviceEndpoint);
          let vc;
          // expect that JWT would have 3 dot-separated parts, VC is non-JWT credential
          if (!(credential.split('.').length === 3)) {
            vc = JSON.parse(credential);
          }
          return vc as VerifiableCredential<RoleCredentialSubject>;
        })
      )
    ).filter(isVerifiableCredential);
  }

  /**
   * Sets role credential cache
   * @param roleCredentialcache
   */
  setRoleCredentialCache(roleCredentialcache: IRoleCredentialCache): void {
    this._roleCredentialCache = roleCredentialcache;
  }
}
