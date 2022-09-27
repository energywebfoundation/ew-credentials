import { CachedDIDDocument } from '../models';
import { IDIDDocument } from '@ew-did-registry/did-resolver-interface';
import { IDIDDocumentCache } from '../models';

/**
 * A class to cache DID Documents from EVMs / Blockchain
 */
export class DIDDocumentCache implements IDIDDocumentCache {
  private cachedDIDDocument: CachedDIDDocument = {};

  /**
   * Stores DID Document
   * @param did user DID
   * @param data DIDDocument of the user (DID)
   */
  setDIDDocument(did: string, data: IDIDDocument) {
    this.cachedDIDDocument[did] = data;
  }

  /**
   * Returns cached DID Document (services)
   * @param did user DID
   */
  getDIDDocument(did: string): IDIDDocument | undefined {
    return this.cachedDIDDocument[did];
  }
}
