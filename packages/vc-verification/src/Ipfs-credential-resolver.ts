import { providers } from 'ethers';
import { CredentialResolverIpfsSettings } from './models';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { IDidStore } from '@ew-did-registry/did-store-interface';
import { OffChainClaim } from './models';
import { isValidErc1056, getDIDChain } from '@ew-did-registry/did';
import { Resolver } from '@ew-did-registry/did-ethr-resolver';
import { RegistrySettings } from '@ew-did-registry/did-resolver-interface';
import * as jwt from 'jsonwebtoken';

export class IpfsCredentialResolver {
  private _ipfsStore: IDidStore;
  private _ipfsUrl: string;
  private _resolver: Resolver;

  constructor(
    provider: providers.Provider,
    registrySetting: RegistrySettings,
    credentialResolverSettings: CredentialResolverIpfsSettings
  ) {
    this._ipfsUrl = credentialResolverSettings.ipfsUrl;
    this._ipfsStore = new DidStore(this._ipfsUrl);
    this._resolver = new Resolver(provider, registrySetting);
  }

  /**
   *
   * @param serviceEndpoint
   * @returns {string}
   */
  async getCredential(did: string, role: string) {
    const offChainClaims = await this.offchainClaimsOf(did);
    for (let claim of offChainClaims) {
      if (claim.claimType === role) {
        return claim;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async isOffchainClaim(claim: any): Promise<boolean> {
    const offChainClaimProps = [
      'claimType',
      'claimTypeVersion',
      'issuedToken',
      'iss',
    ];
    const claimProps = Object.keys(claim);
    return offChainClaimProps.every((p) => claimProps.includes(p));
  }

  async offchainClaimsOf(did: string): Promise<OffChainClaim[]> {
    const transformClaim = (
      claim: OffChainClaim
    ): OffChainClaim | undefined => {
      const transformedClaim: OffChainClaim = { ...claim };
      const didFormatFields = ['iss', 'sub', 'subject', 'did', 'signer'];

      let invalidDIDProperty = false;

      let key: keyof OffChainClaim;
      for (key in transformedClaim) {
        if (didFormatFields.includes(key)) {
          const expectedEthrDID = transformedClaim[key] as string;
          if (isValidErc1056(expectedEthrDID)) {
            // @ts-ignore
            transformedClaim[key] = this.didUnification(expectedEthrDID);
          } else {
            invalidDIDProperty = true;
          }
        }
      }

      return invalidDIDProperty ? undefined : transformedClaim;
    };

    const filterOutMaliciousClaims = (
      item: OffChainClaim | undefined
    ): item is OffChainClaim => {
      return !!item;
    };

    const didDocument = await this._resolver.read(did);
    const services = didDocument.service || [];
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

  /**
   * @param {string} did
   * @returns {string} DID address in format "did:" method-name ":" method-specific-id ":" address
   */
  protected didUnification(did: string): string {
    const { foundChainInfo } = getDIDChain(did);
    if (foundChainInfo) return did;

    const didParts = did.split(':');

    let chainName = 'volta';
    return `${didParts[0]}:${didParts[1]}:${chainName}:${didParts[2]}`;
  }
}
