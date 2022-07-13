import { providers, utils } from 'ethers';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { IDidStore } from '@ew-did-registry/did-store-interface';
import { Resolver } from '@ew-did-registry/did-ethr-resolver';
import {
  RegistrySettings,
  IServiceEndpoint,
} from '@ew-did-registry/did-resolver-interface';
import * as jwt from 'jsonwebtoken';
import { RoleEIP191JWT, RolePayload } from './models';
import { upgradeChainId } from './upgrade-chainid';
import { CredentialResolver } from './credential-resolver';
import { VerifiableCredential } from '@ew-did-registry/credentials-interface';
import type { RoleCredentialSubject } from '@energyweb/credential-governance';

export class IpfsCredentialResolver implements CredentialResolver {
  private _ipfsStore: IDidStore;
  private _resolver: Resolver;

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
    return credentials.find(
      (claim) =>
        claim.credentialSubject.role.namespace === namespace ||
        utils.namehash(claim.credentialSubject.role.namespace) === namespace
    );
  }

  /**
   * Fetches RoleEIP191JWT for the given did and role for an OffChainClaim issuance hierarchy
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
   * @param role role for which the credential need to be fetched
   * @returns RoleEIP191JWT
   */
  async getEIP191JWT(
    did: string,
    namespace: string
  ): Promise<RoleEIP191JWT | undefined> {
    const eip191Jwts = await this.eip191JwtOf(did);
    return eip191Jwts.find(
      (jwt) =>
        jwt?.payload?.claimData.claimType === namespace ||
        utils.namehash(jwt?.payload?.claimData.claimType) === namespace
    );
  }

  async isEIP191Jwt(claim: unknown): Promise<boolean> {
    if (!claim) return false;
    if (typeof claim !== 'object') return false;
    const eip191JwtProps = ['claimData', 'signer', 'iss'];
    const claimProps = Object.keys(claim);
    return eip191JwtProps.every((p) => claimProps.includes(p));
  }

  private async eip191JwtOf(did: string): Promise<RoleEIP191JWT[]> {
    const transformClaim = (
      roleJwt: RoleEIP191JWT
    ): RoleEIP191JWT | undefined => {
      const transformedClaim: RoleEIP191JWT = { ...roleJwt };
      return upgradeChainId(transformedClaim);
    };

    const filterOutMaliciousClaims = (
      item: RoleEIP191JWT | undefined
    ): item is RoleEIP191JWT => {
      return !!item;
    };

    const didDocument = await this._resolver.read(did);
    const services: IServiceEndpoint[] = didDocument.service || [];
    return (
      await Promise.all(
        services.map(async ({ serviceEndpoint }) => {
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
      .filter(this.isEIP191Jwt)
      .map(transformClaim)
      .filter(filterOutMaliciousClaims);
  }

  isVerifiableCredential(
    vc: VerifiableCredential<RoleCredentialSubject> | unknown
  ): vc is VerifiableCredential<RoleCredentialSubject> {
    if (!vc) return false;
    if (typeof vc !== 'object') return false;
    const credentialProps = [
      '@context',
      'id',
      'type',
      'issuer',
      'issuanceDate',
      'credentialSubject',
      'proof',
    ];
    const credProps = Object.keys(vc);
    return credentialProps.every((p) => credProps.includes(p));
  }

  private async credentialsOf(
    did: string
  ): Promise<VerifiableCredential<RoleCredentialSubject>[]> {
    const didDocument = await this._resolver.read(did);
    const services: IServiceEndpoint[] = didDocument.service || [];
    return (
      await Promise.all(
        services.map(async ({ serviceEndpoint }) => {
          const credential = await this._ipfsStore.get(serviceEndpoint);
          let vc;
          // expect that JWT would have 3 dot-separated parts, VC is non-JWT credential
          if (!(credential.split('.').length === 3)) {
            vc = JSON.parse(credential);
          }
          return vc as VerifiableCredential<RoleCredentialSubject>;
        })
      )
    ).filter(this.isVerifiableCredential);
  }
}
