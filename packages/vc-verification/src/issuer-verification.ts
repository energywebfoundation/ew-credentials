// @ts-ignore
import * as jwt from 'jsonwebtoken';
import { utils, providers } from 'ethers';
import { ProofVerifier } from '@ew-did-registry/claims';
import { Resolver } from '@ew-did-registry/did-ethr-resolver';
import { RegistrySettings } from '@ew-did-registry/did-resolver-interface';
import { RoleDefinitionResolverV2__factory } from '@energyweb/credential-governance/ethers/factories/RoleDefinitionResolverV2__factory';
import { RoleDefinitionResolverV2 } from '@energyweb/credential-governance/ethers/RoleDefinitionResolverV2';
import { CredentialResolver } from '.';
import {
  IVerifiableCredential,
  VerificationResult,
  OffChainClaim,
} from './models';

export class IssuerVerification {
  private _provider: providers.Provider;
  private _resolver: Resolver;
  private _registrySetting: RegistrySettings;
  private _roleDefResolver: RoleDefinitionResolverV2;
  private _credentialResolver: CredentialResolver;

  /**
   *
   * @param provider
   * @param roleDefResolverAddr
   * @param registrySetting
   * @param credentialResolver
   */
  constructor({
    provider,
    roleDefResolverAddr,
    registrySetting,
    credentialResolver,
  }: {
    provider: providers.Provider;
    roleDefResolverAddr: string;
    registrySetting: RegistrySettings;
    credentialResolver: CredentialResolver;
  }) {
    this._provider = provider;
    this._registrySetting = registrySetting;
    this._roleDefResolver = RoleDefinitionResolverV2__factory.connect(
      roleDefResolverAddr,
      this._provider
    );
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
    while (hasParent) {
      let subjectDID = credential.credentialSubject.id;
      let role = await this.parseRoleFromCredential(credential);
      let offChainClaim = await this._credentialResolver.getCredential(
        subjectDID,
        role
      );
      if (typeof offChainClaim === 'string') {
        return 'No credential found';
      } else {
        const issuerDID = await this.verifyIssuedToken(
          offChainClaim.issuedToken
        );
        if (issuerDID) {
          if (await this.verifyIssuerAuthority(role, issuerDID)) {
            subjectDID = issuerDID;
            if (await this.isRoleIssuerDID(role)) {
              hasParent = false;
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
      const issuers = await this.resolveIsuers(role);
      if (issuers.dids.length > 0) {
        for (let i = 0; i < issuers.dids.length; i++) {
          if (issuers.dids[i] == credential.issuer) {
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
        const result = await verifyCredentialProofCallback(issuerCredential);
        if (result) {
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
    const issuers = await this._roleDefResolver.issuers(utils.namehash(role));
    if (issuers.dids.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Fetches list of issuers for the given role
   * @param role
   * @returns
   */
  async resolveIsuers(role: string) {
    return this._roleDefResolver.issuers(utils.namehash(role));
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
    const issuers = await this.resolveIsuers(namespace);
    if (issuers.dids.length > 0) {
      for (let i = 0; i < issuers.dids.length; i++) {
        if (issuers.dids[i] == issuerDID) {
          return true;
        }
      }
    }
    const offChainClaim = await this._credentialResolver.getCredential(
      issuerDID,
      issuers.role
    );
    if (typeof offChainClaim === 'string') {
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
