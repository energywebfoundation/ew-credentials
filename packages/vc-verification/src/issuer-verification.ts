import * as jwt from 'jsonwebtoken';
import { providers } from 'ethers';
import { ProofVerifier } from '@ew-did-registry/claims';
import { Resolver, addressOf } from '@ew-did-registry/did-ethr-resolver';
import { RegistrySettings } from '@ew-did-registry/did-resolver-interface';
import { CredentialResolver, IssuerDefinitionResolver } from '.';
import {
  IVerifiableCredential,
  VerificationResult,
  OffChainClaim,
} from './models';

export class IssuerVerification {
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
      let offChainClaim = await this._credentialResolver.getCredential(
        subjectDID,
        role
      );
      if (!offChainClaim) {
        throw new Error('No credential found');
      } else {
        let issuerDID;
        if (offChainClaim.issuedToken) {
          issuerDID = await this.verifyIssuedToken(offChainClaim.issuedToken);
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
   * Verify issued token signature
   * @param {string} token
   */
  async verifyIssuedToken(token: string) {
    const offChainClaim = jwt.decode(token) as OffChainClaim;
    const issuerDIDDoc = await this._resolver.read(offChainClaim.iss);
    const verifier = new ProofVerifier(issuerDIDDoc);
    if (await verifier.verifyAssertionProof(token)) {
      return offChainClaim.iss;
    } else {
      throw new Error('Invalid Credential');
    }
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
        if (issuers.did[i] == addressOf(issuerDID)) {
          return true;
        }
      }
    }
    let offChainClaim;
    if (issuers && issuers.roleName) {
      offChainClaim = await this._credentialResolver.getCredential(
        issuerDID,
        issuers.roleName
      );
    }
    if (!offChainClaim) {
      return false;
    }
    const isClaimVerified = await this.verifyIssuedToken(
      offChainClaim.issuedToken
    );
    return typeof isClaimVerified === 'string';
  }
}
