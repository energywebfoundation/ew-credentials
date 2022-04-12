import { CredentialResolverIpfsSettings } from './models';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { IDidStore } from '@ew-did-registry/did-store-interface';
import {
  IDIDDocument,
  IServiceEndpoint,
} from '@ew-did-registry/did-resolver-interface';
import { OffChainClaim } from './models';
import * as jwt from 'jsonwebtoken';

export class CachedDidDocCredentialResolver {
  private _cahcedDidDocument: IDIDDocument[];
  private _ipfsStore: IDidStore;

  constructor(
    credentialResolverSettings: CredentialResolverIpfsSettings,
    cachedDidDocuments: IDIDDocument[]
  ) {
    this._ipfsStore = new DidStore(credentialResolverSettings.ipfsUrl);
    this._cahcedDidDocument = cachedDidDocuments;
  }

  /**
   *
   * @param did
   * @param namespace
   * @returns credential for the given namespace
   */
  async getCredential(did: string, namespace: string) {
    const userDIDDoc = await this.getDidDocument(did);
    const services = userDIDDoc?.service;
    if (services) {
      for (let sv of services) {
        const offChainClaim = await this.fetchCredentialFromIpfs(sv);
        if (offChainClaim.claimType === namespace) {
          return offChainClaim;
        }
      }
    }
  }

  /**
   *
   * @param did
   * @returns DIDDoc from the cached documents
   */
  protected async getDidDocument(did: string) {
    for (let diddoc of this._cahcedDidDocument) {
      if (diddoc.id === did) {
        return diddoc;
      }
    }
  }

  /**
   *
   * @param sv
   * @returns fetches credential from Ipfs for the mentioned service endpoint
   */
  protected async fetchCredentialFromIpfs(
    sv: IServiceEndpoint
  ): Promise<OffChainClaim> {
    const issuedToken = await this._ipfsStore.get(sv.serviceEndpoint);
    const offChainClaim = jwt.decode(issuedToken) as OffChainClaim;
    return offChainClaim;
  }
}
