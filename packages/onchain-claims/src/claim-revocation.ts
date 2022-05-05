import { Event, utils } from 'ethers';
import { addressOf, EwSigner } from '@ew-did-registry/did-ethr-resolver';
import {
  ClaimsRevocationRegistry,
  ClaimsRevocationRegistry__factory,
} from '../ethers';

export class ClaimRevocation {
  private _revocationRegistry: ClaimsRevocationRegistry;

  /**
   * @param provider
   * @param revocationRegistryOnChainAddr - Address of the claim's RevocationRegistry
   */
  constructor(revoker: EwSigner, revocationRegistryOnChainAddr: string) {
    this._revocationRegistry = ClaimsRevocationRegistry__factory.connect(
      revocationRegistryOnChainAddr,
      revoker
    );
  }

  /**
   * Revokes the on chain claim
   * Returns true on success
   *
   * @param { string } namespace - namespace(role) to be revoked
   * @param { string } subject - DID of user whose the claim is being revoked
   * @param { string } revoker - DID of the revoker
   * @returns Promise<boolean>
   */
  async revokeClaim(
    namespace: string,
    subject: string,
    revoker: string
  ): Promise<boolean> {
    const namespaceHash = utils.namehash(namespace);
    const subjectAddress = addressOf(subject);
    const revokerAddress = addressOf(revoker);
    try {
      const tx = await this._revocationRegistry.revokeClaim(
        namespaceHash,
        subjectAddress,
        revokerAddress
      );
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: Event) => e.event === 'Revoked');
      if (!event) return false;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
    return true;
  }

  /**
   * Revokes the claim for list of DIDs
   * Returns true on success
   *
   * @param { string } namespace - namespace(role) to be revoked for the DIDs
   * @param { string[] } subjects - DIDs for which the claim is being revoked
   * @param { string } revoker - DID of the revoker
   * @returns Promise<boolean>
   */
  async revokeClaimforDIDs(
    namespace: string,
    subjects: string[],
    revoker: string
  ): Promise<boolean> {
    const namespaceHash = utils.namehash(namespace);
    const revokerAddress = addressOf(revoker);
    const revocationSubjects = subjects.map(subject => addressOf(subject));
    try {
      const tx = await this._revocationRegistry.revokeClaimsInList(
        namespaceHash,
        revocationSubjects,
        revokerAddress
      );
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: Event) => e.event === 'Revoked');
      if (!event) return false;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
    return true;
  }

  /**
   * Checks the revocation status of a claim
   * Returns the status of the claim
   *
   * @param { string } namespace - namespace(role) for which the status is to be checked
   * @param { string } subject - DID for which the status is to be checked
   * @returns Promise<boolean>
   */
  async isClaimRevoked(namespace: string, subject: string): Promise<boolean> {
    const subjectAddress = addressOf(subject);
    const revokedStatus = await this._revocationRegistry.isRevoked(
      utils.namehash(namespace),
      subjectAddress
    );
    return revokedStatus;
  }

  /**
   * Checks the revocation details for a subject's claim
   * Returns the revoker and revocationTimeStamp for the revocation
   *
   * @param { string } namespace - namescpace(role) for which the status is to be checked
   * @param { string } subject - DID for which the status is to be checked
   * @returns Promise<string[]>
   */
  async getRevocationDetail(
    namespace: string,
    subject: string
  ): Promise<string[]> {
    const subjectAddress = addressOf(subject);
    const result = await this._revocationRegistry.getRevocationDetail(
      utils.namehash(namespace),
      subjectAddress
    );
    const { 0: revoker, 1: revokedTimeStamp } = result;
    return [revoker, revokedTimeStamp.toString()];
  }
}
