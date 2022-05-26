import { providers, utils } from 'ethers';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { IDidStore } from '@ew-did-registry/did-store-interface';
import { IVerifiableCredential, OffChainClaim } from './models';
import { Resolver } from '@ew-did-registry/did-ethr-resolver';
import {
  RegistrySettings,
  IServiceEndpoint,
} from '@ew-did-registry/did-resolver-interface';
import * as jwt from 'jsonwebtoken';
import { upgradeChainId } from './upgrade-chainid';
import { CredentialResolver } from './credential-resolver';

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
   * Fethces credential for the given did and role
   * @param did
   * @param role
   * @returns
   */
  async getCredential(did: string, role: string) {
    const credentials = await this.credentialsOf(did);
    return credentials.find(
      (claim) =>
        claim.credentialSubject.role.namespace === role ||
        utils.namehash(claim.credentialSubject.role.namespace) === role
    );
  }

  /**
   * Fethces credential for the given did and role
   * @param did
   * @param role
   * @returns
   */
  async getClaimIssuedToken(
    did: string,
    namespace: string
  ): Promise<string | undefined> {
    const offChainClaims = await this.offchainClaimsOf(did);
    return offChainClaims.find(
      (claim) =>
        claim.claimType === namespace ||
        utils.namehash(claim.claimType) === namespace
    )?.issuedToken;
  }

  async isOffchainClaim(claim: unknown): Promise<boolean> {
    if (!claim) return false;
    if (typeof claim !== 'object') return false;
    const offChainClaimProps = [
      'claimType',
      'claimTypeVersion',
      'issuedToken',
      'iss',
    ];
    const claimProps = Object.keys(claim);
    return offChainClaimProps.every((p) => claimProps.includes(p));
  }

  private async offchainClaimsOf(did: string): Promise<OffChainClaim[]> {
    const transformClaim = (
      claim: OffChainClaim
    ): OffChainClaim | undefined => {
      const transformedClaim: OffChainClaim = { ...claim };
      return upgradeChainId(transformedClaim);
    };

    const filterOutMaliciousClaims = (
      item: OffChainClaim | undefined
    ): item is OffChainClaim => {
      return !!item;
    };

    const didDocument = await this._resolver.read(did);
    const services: IServiceEndpoint[] = didDocument.service || [];
    return (
      await Promise.all(
        services.map(async ({ serviceEndpoint }) => {
          const claimToken = await this._ipfsStore.get(serviceEndpoint);
          return jwt.decode(claimToken) as OffChainClaim;
        })
      )
    )
      .filter(this.isOffchainClaim)
      .map(transformClaim)
      .filter(filterOutMaliciousClaims);
  }

  async isCredential(credential: unknown): Promise<boolean> {
    if (!credential) return false;
    if (typeof credential !== 'object') return false;
    const credentialProps = [
      '@context',
      'id',
      'type',
      'issuer',
      'issuanceDate',
      'credentialSubject',
      'proof',
    ];
    const credProps = Object.keys(credential);
    return credentialProps.every((p) => credProps.includes(p));
  }

  private async credentialsOf(did: string): Promise<IVerifiableCredential[]> {
    const filterOutMaliciousCredentials = (
      item: IVerifiableCredential | undefined
    ): item is IVerifiableCredential => {
      return !!item;
    };

    const didDocument = await this._resolver.read(did);
    const services: IServiceEndpoint[] = didDocument.service || [];
    return (
      await Promise.all(
        services.map(async ({ serviceEndpoint }) => {
          const credential = await this._ipfsStore.get(serviceEndpoint);
          const vc = JSON.parse(credential);
          delete vc.iat;
          return vc as IVerifiableCredential;
        })
      )
    )
      .filter(this.isCredential)
      .filter(filterOutMaliciousCredentials);
  }
}
