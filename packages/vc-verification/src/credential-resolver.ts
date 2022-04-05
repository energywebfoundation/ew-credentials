import { CredentialResolverSettings } from './models';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { IDidStore } from '@ew-did-registry/did-store-interface';

export class CredentialResolver {
  private _ipfsStore: IDidStore;
  private _ipfsUrl: string;

  constructor(credentialResolverSettings: CredentialResolverSettings) {
    this._ipfsUrl = credentialResolverSettings.ipfsUrl;
    this._ipfsStore = new DidStore(this._ipfsUrl);
  }

  /**
   *
   * @param serviceEndpoint
   * @returns {string}
   */
  async getCredential(serviceEndpoint: string): Promise<string> {
    const token = await this._ipfsStore.get(serviceEndpoint);
    return token;
  }
}
