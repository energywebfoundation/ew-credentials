import * as jwt from 'jsonwebtoken';
import { providers } from 'ethers';
import { Resolver, addressOf } from '@ew-did-registry/did-ethr-resolver';
import { RegistrySettings } from '@ew-did-registry/did-resolver-interface';
import { CredentialResolver, IssuerDefinitionResolver } from '.';
import { IVerifiableCredential, VerificationResult } from './models';
import { verifyCredential } from 'didkit-wasm-node';

export class VCIssuerVerification {
  private _resolver: Resolver;
  private _issuerDefResolver: IssuerDefinitionResolver;
  private _credentialResolver: CredentialResolver;

  /**
   *
   * @param provider
   * @param registrySetting
   * @param credentialResolver
   * @param issuerDefResolver
   */
  constructor(
    provider: providers.Provider,
    registrySetting: RegistrySettings,
    credentialResolver: CredentialResolver,
    issuerDefResolver: IssuerDefinitionResolver
  ) {
    this._issuerDefResolver = issuerDefResolver;
    this._resolver = new Resolver(provider, registrySetting);
    this._credentialResolver = credentialResolver;
  }

  /**
   * Verifies chain of trust for a holder's credential
   * @param credential
   * @param verifyCredentialProofCallback verification callback approach to verify all issuers in hierarchy. By default the chain is verified against RoleDefinition
   * @returns
   */
  async verifyChainOfTrust(
    credential: IVerifiableCredential,
    verifyCredentialProofCallback?: (
      credential: IVerifiableCredential
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
   * Verifies chain of trust for a given holder's DID and role
   * @param {string} credential
   */
  async verifyChainOfTrustByRoleDefinition(credential: IVerifiableCredential) {
    let subjectDID = credential.credentialSubject.id;
    let role = await this.parseRoleFromCredential(credential);
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
          if (await this.verifyIssuerAuthority(role, issuerDID)) {
            subjectDID = issuerDID;
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
    credential: IVerifiableCredential,
    verifyCredentialProofCallback: (
      credential: IVerifiableCredential
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
          credential.issuer,
          role
        );
        // @ts-ignore
        const result = await verifyCredentialProofCallback(issuerCredential);
        if (result) {
          // @ts-ignore
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
  private async parseRoleFromCredential(credential: IVerifiableCredential) {
    return credential.credentialSubject.role.namespace;
  }

  /**
   * Returns true if the role issuer type is DID
   * @param role
   * @returns
   */
  private async isRoleIssuerDID(role: string) {
    const issuers = await this._issuerDefResolver.getIssuerDefinition(role);
    return issuers && issuers.did && issuers.did.length > 0;
  }

  /**
   * Verifies issuer's authority to issue credential
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
        if (issuers.did[i].toUpperCase() === issuerAddr.toUpperCase()) {
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
    const isClaimVerified = await verifyCredential(
      JSON.stringify(vc),
      JSON.stringify({})
    );
    return typeof isClaimVerified === 'string';
  }
}
