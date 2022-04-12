import * as jwt from 'jsonwebtoken';
import { providers } from 'ethers';
import { ProofVerifier } from '@ew-did-registry/claims';
import { Resolver } from '@ew-did-registry/did-ethr-resolver';
import { RegistrySettings } from '@ew-did-registry/did-resolver-interface';
import { CredentialResolver, IssuerDefinitionResolver } from '.';
import {
  IVerifiableCredential,
  VerificationResult,
  OffChainClaim,
} from './models';
import { upgradeChainId } from './upgrade-chainid';

export class IssuerVerification {
  private _provider: providers.Provider;
  private _resolver: Resolver;
  private _registrySetting: RegistrySettings;
  private _issuerDefResolver: IssuerDefinitionResolver;
  private _credentialResolver: CredentialResolver;

  /**
   *
   * @param provider
   * @param roleDefResolverAddr
   * @param registrySetting
   * @param credentialResolver
   */
  constructor(
    provider: providers.Provider,
    registrySetting: RegistrySettings,
    credentialResolver: CredentialResolver,
    issuerDefResolver: IssuerDefinitionResolver
  ) {
    this._provider = provider;
    this._registrySetting = registrySetting;
    this._issuerDefResolver = issuerDefResolver;
    this._resolver = new Resolver(this._provider, this._registrySetting);
    this._credentialResolver = credentialResolver;
  }

  /**
   * Verifies chain of trust for a holder's credential
   * @param credential
   * @param verifyCredentialProofCallback
   * @param subjectDID
   * @param role
   * @returns
   */
  async verifyChainOfTrust(
    credential: IVerifiableCredential,
    verifyCredentialProofCallback?: (
      credential: IVerifiableCredential
    ) => Promise<VerificationResult>
  ) {
    if (credential && verifyCredentialProofCallback) {
      this.verifyChainOfTrustCallback(
        credential,
        verifyCredentialProofCallback
      );
    } else if (credential) {
      this.verifyCredentialChainOfTrust(credential);
    } else {
      return 'Insufficient information';
    }
  }

  /**
   * Verifies chain of trust for a given holder's DID and role
   * @param {string} subjectDID
   * @param {string} role
   */
  async verifyCredentialChainOfTrust(credential: IVerifiableCredential) {
    let hasParent = true;
    let subjectDID = credential.credentialSubject.id;
    let role = await this.parseRoleFromCredential(credential);
    while (hasParent) {
      let offChainClaim = await this._credentialResolver.getCredential(
        subjectDID,
        role
      );
      if (typeof offChainClaim === 'string') {
        return 'No credential found';
      } else {
        let issuerDID;
        if (offChainClaim?.issuedToken) {
          issuerDID = await this.verifyIssuedToken(offChainClaim.issuedToken);
        }
        if (issuerDID) {
          if (await this.verifyIssuerAuthority(role, issuerDID)) {
            subjectDID = issuerDID;

            if (await this.isRoleIssuerDID(role)) {
              hasParent = false;
            } else {
              const issuers = await this._issuerDefResolver.getRoleIssuerDefinition(role);
              if (issuers.roleName) {
                role = issuers.roleName;
              }
            }
          } else {
            return 'Issuer is not allowed to issue role';
          }
        } else {
          return 'The credential is invalid';
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
      const issuers = await this._issuerDefResolver.getRoleIssuerDefinition(role);
      if (issuers.did && issuers.did.length > 0) {
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
          return 'Invalid credential';
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
    const issuers = await this._issuerDefResolver.getRoleIssuerDefinition(role);
    if (issuers.did && issuers.did.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Verify credential signature
   * @param {string} serviceEndpoint
   */
  async verifyIssuedToken(token: string) {
    const offChainClaim = jwt.decode(token) as OffChainClaim;
    const issuerDIDDoc = await this._resolver.read(offChainClaim.iss);
    const verifier = new ProofVerifier(issuerDIDDoc);
    if (await verifier.verifyAssertionProof(token)) {
      return offChainClaim.iss;
    } else {
      return 'Invalid Credential';
    }
  }

  /**
   * Verifies issuer's authority to issue credential
   * @param {string} role
   * @param {string} issuerDID
   * @returns boolean
   */
  async verifyIssuerAuthority(
    namespace: string,
    issuerDID: string
  ): Promise<boolean> {
    const issuers = await this._issuerDefResolver.getRoleIssuerDefinition(namespace);
    if (issuers.did && issuers.did.length > 0) {
      for (let i = 0; i < issuers.did.length; i++) {
        if (issuers.did[i] == issuerDID) {
          return true;
        }
      }
    }
    let offChainClaim;
    if (issuers.roleName) {
      offChainClaim = await this._credentialResolver.getCredential(
        issuerDID,
        issuers.roleName
      );
      offChainClaim = offChainClaim ? upgradeChainId(offChainClaim) : undefined;
    }
    if (!offChainClaim) {
      return false;
    } else {
      const isClaimVerified = await this.verifyIssuedToken(
        offChainClaim.issuedToken
      );
      if (typeof isClaimVerified == 'string') {
        return false;
      } else {
        return true;
      }
    }
  }
}
