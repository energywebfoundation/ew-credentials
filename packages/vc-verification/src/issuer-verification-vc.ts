import { addressOf } from '@ew-did-registry/did-ethr-resolver';
import { CredentialResolver, IssuerResolver } from '.';
import { VerificationResult } from './models';
import { verifyCredential } from 'didkit-wasm-node';
import { VerifiableCredential } from '@ew-did-registry/credentials-interface';
import { RoleCredentialSubject } from '@energyweb/credential-governance';
/**
 * A class to verify chain of trust for a Verifiable Credential
 * The hierachy must only consist of VC issuance
 */
export class VCIssuerVerification {
  private _issuerDefResolver: IssuerResolver;
  private _credentialResolver: CredentialResolver;

  constructor(
    credentialResolver: CredentialResolver,
    issuerDefResolver: IssuerResolver
  ) {
    this._issuerDefResolver = issuerDefResolver;
    this._credentialResolver = credentialResolver;
  }

  /**
   * Verifies chain of trust for the provided verifiable credential
   * @param credential
   * @param verifyCredentialProofCallback verification callback approach to verify all issuers in hierarchy. By default the chain is verified against RoleDefinition
   * @returns
   */
  async verifyChainOfTrust(
    credential: VerifiableCredential<RoleCredentialSubject>,
    verifyCredentialProofCallback?: (
      credential: VerifiableCredential<RoleCredentialSubject>
    ) => Promise<VerificationResult>
  ) {
    if (credential && verifyCredentialProofCallback) {
      return this.verifyChainOfTrustCallback(
        credential,
        verifyCredentialProofCallback
      );
    } else if (credential) {
      return this.verifyChainOfTrustByRoleDefinition(credential);
    } else {
      throw new Error('Not sufficient information');
    }
  }

  /**
   * Verifies chain of trust for a given credential
   * @param {string} credential
   */
  async verifyChainOfTrustByRoleDefinition(
    credential: VerifiableCredential<RoleCredentialSubject>
  ) {
    let subjectDID = credential.credentialSubject.id;
    let role = await this.parseRoleFromCredential(credential);
    /**@todo eslint no-constant-condition */
    while (true) {
      const vc = await this._credentialResolver.getCredential(subjectDID, role);
      if (!vc) {
        throw new Error('No credential found');
      } else {
        let issuerDID;
        if (vc.proof) {
          await verifyCredential(JSON.stringify(vc), JSON.stringify({}));
          issuerDID = vc.issuer;
        }
        if (issuerDID) {
          if (await this.verifyIssuerAuthority(role, issuerDID as string)) {
            subjectDID = issuerDID as string;
            if (await this.isRoleIssuerDID(role)) {
              return true;
            }
            const issuers = await this._issuerDefResolver.getIssuerDefinition(
              role
            );
            if (issuers && issuers.roleName) {
              role = issuers.roleName;
            }
          } else {
            throw new Error('Issuer is not allowed to issue credential');
          }
        } else {
          throw new Error('The credential is invalid');
        }
      }
    }
  }

  /**
   * Verifies credential and chain of trust with callback function
   *
   * TO BE COMPLETED
   */
  async verifyChainOfTrustCallback(
    credential: VerifiableCredential<RoleCredentialSubject>,
    verifyCredentialProofCallback: (
      credential: VerifiableCredential<RoleCredentialSubject>
    ) => Promise<VerificationResult>
  ) {
    let hasParent = true;
    let didMatched = false;
    while (hasParent) {
      const role = await this.parseRoleFromCredential(credential);
      const issuers = await this._issuerDefResolver.getIssuerDefinition(role);
      if (issuers && issuers.did && issuers.did.length > 0) {
        for (let i = 0; i < issuers.did.length; i++) {
          if (issuers.did[i] == credential.issuer) {
            didMatched = true;
            hasParent = false;
            break;
          }
        }
      } else {
        const issuerCredential = await this._credentialResolver.getCredential(
          credential.issuer as string,
          role
        );

        if (
          issuerCredential &&
          (await verifyCredentialProofCallback(issuerCredential))
        ) {
          credential = issuerCredential;
        } else {
          throw new Error('Invalid credential');
        }
      }
    }
  }

  /**
   * Fetches role form a credential
   * @param credential
   * @returns
   */
  private async parseRoleFromCredential(
    credential: VerifiableCredential<RoleCredentialSubject>
  ) {
    return credential.credentialSubject.role.namespace;
  }

  /**
   * Returns true if the role issuer type is DID
   * @param role
   * @returns
   */
  private async isRoleIssuerDID(role: string) {
    const issuers = await this._issuerDefResolver.getIssuerDefinition(role);
    return issuers && issuers.issuerType === 'DID';
  }

  /**
   * Verifies issuer's authority to issue credential for a namespace
   * @param {string} namespace
   * @param {string} issuerDID
   * @returns boolean
   */
  async verifyIssuerAuthority(
    namespace: string,
    issuerDID: string
  ): Promise<boolean> {
    const issuers = await this._issuerDefResolver.getIssuerDefinition(
      namespace
    );
    if (issuers && issuers.did && issuers.did.length > 0) {
      for (let i = 0; i < issuers.did.length; i++) {
        const issuerAddr = addressOf(issuerDID);
        const roleIssuerAddr = addressOf(issuers.did[i]);
        if (roleIssuerAddr.toUpperCase() === issuerAddr.toUpperCase()) {
          return true;
        }
      }
    }
    let vc;
    if (issuers && issuers.roleName) {
      vc = await this._credentialResolver.getCredential(
        issuerDID,
        issuers.roleName
      );
    }
    if (!vc) {
      return false;
    }
    const isCredentialVerified = await verifyCredential(
      JSON.stringify(vc),
      JSON.stringify({})
    );
    return typeof isCredentialVerified === 'string';
  }
}
