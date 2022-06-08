import { addressOf } from '@ew-did-registry/did-ethr-resolver';
import { verifyCredential } from 'didkit-wasm-node';
import { StatusPurpose, StatusListCredential } from './models';
import { VCIssuerVerification } from './issuer-verification-vc';
import { IssuerResolver, RevokerResolver, CredentialResolver } from '.';

/**
 * A class to validate if the revocation is valid or not
 */
export class RevocationVerification {
  private _revokerResolver: RevokerResolver;
  private _credentialResolver: CredentialResolver;
  private _issuerVerification: VCIssuerVerification;

  constructor(
    issuerResolver: IssuerResolver,
    revokerResolver: RevokerResolver,
    credentialResolver: CredentialResolver
  ) {
    this._revokerResolver = revokerResolver;
    this._credentialResolver = credentialResolver;
    this._issuerVerification = new VCIssuerVerification(
      credentialResolver,
      issuerResolver
    );
  }

  /**
   * Verifies VC revocation for the given namespace and StatusListCredential
   * @param namespace for which the revocation was executed
   * @param credential StatusListCredential to verify
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
   * Verifies revoker's authority
   * @param namespace for which the revoker's authority is to be verified
   * @param revokerDID whose authority needs to be verified
   * @returns
   */
  async verifyRevokerAuthority(
    namespace: string,
    revokerDID: string
  ): Promise<boolean> {
    const revokers = await this._revokerResolver.getRevokerDefinition(
      namespace
    );
    if (revokers?.did) {
      const revokerAddr = addressOf(revokerDID);
      for (let i = 0; i < revokers.did.length; i++) {
        const roleRevokerAddr = addressOf(revokers.did[i]);
        if (roleRevokerAddr.toUpperCase() === revokerAddr.toUpperCase()) {
          return true;
        }
      }
    }
    let isCredentialVerified = false;
    let isCredentialIssuerVerified = false;
    if (revokers?.roleName) {
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
   * @param purpose statusPurpose from StatusListCredential
   * @returns
   */
  private isStatusPurposeRevocation(purpose: string) {
    return purpose === StatusPurpose.revocation;
  }
}
