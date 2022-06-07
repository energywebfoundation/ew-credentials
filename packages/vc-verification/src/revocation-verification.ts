import { addressOf } from '@ew-did-registry/did-ethr-resolver';
import { verifyCredential } from 'didkit-wasm-node';
import { AuthorityResolver, CredentialResolver } from '.';
import { StatusPurpose, StatusListCredential } from './models';
import { VCIssuerVerification } from './issuer-verification-vc';

/**
 * A class to validate if the revocation is valid or not
 */
export class RevocationVerification {
  private _authorityResolver: AuthorityResolver;
  private _credentialResolver: CredentialResolver;
  private _issuerVerification: VCIssuerVerification;

  /**
   *
   * @param revokerDefResolver
   * @param credentialResolver
   */
  constructor(
    authorityResolver: AuthorityResolver,
    credentialResolver: CredentialResolver
  ) {
    this._authorityResolver = authorityResolver;
    this._credentialResolver = credentialResolver;
    this._issuerVerification = new VCIssuerVerification(
      credentialResolver,
      authorityResolver
    );
  }

  /**
   * Verify revocation for the provided credential or namespace and revoker
   * @param credential
   * @param namespace
   * @param revokerDID
   * @returns
   */
  async verifyRevocation(namespace: string, credential: StatusListCredential) {
    const revokerDID = credential.issuer;
    if (
      !this.isStatusPurposeRevocation(
        credential.credentialSubject.statusPurpose
      )
    ) {
      return false;
    }
    return await this.verifyRevokerAuthority(namespace, revokerDID);
  }

  /**
   *
   * @param namespace for which the revoker's authority is to be verified
   * @param revokerDID whose authority needs to be verified
   * @returns
   */
  async verifyRevokerAuthority(
    namespace: string,
    revokerDID: string
  ): Promise<boolean> {
    const revokers = await this._authorityResolver.getRevokerDefinition(
      namespace
    );
    if (revokers && revokers.did) {
      for (let i = 0; i < revokers.did.length; i++) {
        const revokerAddr = addressOf(revokerDID);
        const roleRevokerAddr = addressOf(revokers.did[i]);
        if (roleRevokerAddr.toUpperCase() === revokerAddr.toUpperCase()) {
          return true;
        }
      }
    }
    let isCredentialVerified = false;
    let isCredentialIssuerVerified = false;
    if (revokers && revokers.roleName) {
      const vc = await this._credentialResolver.getCredential(
        revokerDID,
        revokers.roleName
      );
      if (vc) {
        isCredentialVerified = await verifyCredential(
          JSON.stringify(vc),
          JSON.stringify({})
        );
        isCredentialIssuerVerified =
          await this._issuerVerification.verifyIssuerAuthority(
            revokers.roleName,
            vc.issuer
          );
      } else {
        throw new Error('No authoritative credential found for revoker');
      }
    }
    return (
      isCredentialIssuerVerified && typeof isCredentialVerified === 'string'
    );
  }

  /**
   * Checks if the purpose of the issued credential is revocation
   * @param purpose
   * @returns
   */
  private isStatusPurposeRevocation(purpose: string) {
    return purpose === StatusPurpose.revocation;
  }
}
