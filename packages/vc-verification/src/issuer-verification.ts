// @ts-ignore
import * as jwt from 'jsonwebtoken';
import { utils, providers } from 'ethers';
import { ProofVerifier } from '@ew-did-registry/claims';
import { Resolver } from '@ew-did-registry/did-ethr-resolver';
import { RegistrySettings } from '@ew-did-registry/did-resolver-interface';
import { RoleDefinitionResolverV2__factory } from '@energyweb/credential-governance/ethers/factories/RoleDefinitionResolverV2__factory';
import { RoleDefinitionResolverV2 } from '@energyweb/credential-governance/ethers/RoleDefinitionResolverV2';
import { CredentialResolver } from '.';
import { IVerifiableCredential, VerificationResult } from './models';

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
      let serviceEndpoint = await this.getCredentialUrl(subjectDID, role);
      const issuerDID = await this.verifyCredential(serviceEndpoint);
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

  /**
   * Verifies credential and chain of trust with callback function
   * @param credential
   * @param verifyCredentialProofCallback
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
        const issuerCredentialUrl = await this.getCredentialUrl(
          credential.issuer,
          role
        );
        if (issuerCredentialUrl) {
          const issuerCredential = await this._credentialResolver.getCredential(
            issuerCredentialUrl
          );
          const decodedCredendial = (await jwt.decode(
            issuerCredential
          )) as IVerifiableCredential;
          const result = await verifyCredentialProofCallback(decodedCredendial);
          if (result) {
            credential = decodedCredendial;
          } else {
            return 'Invalid credential';
          }
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
   *
   * @param did fetches serviceEndpoint from the subject's DIDDoc
   * @param role
   * @returns
   */
  async getCredentialUrl(did: string, role: string) {
    const subjectDIDDoc = await this._resolver.read(did);
    const service = subjectDIDDoc.service;
    let serviceEndpoint = '';
    for (const sv of service) {
      let token = await this._credentialResolver.getCredential(
        sv.serviceEndpoint
      );
      let { claimType } = (await jwt.decode(token)) as {
        claimType: string;
      };
      if (claimType === role) {
        serviceEndpoint = sv.serviceEndpoint;
        return serviceEndpoint;
      }
    }
    return 'No Credential Found';
  }

  /**
   * Verify credential signature
   * @param {string} serviceEndpoint
   */
  async verifyCredential(serviceEndpoint: string) {
    const token = await this._credentialResolver.getCredential(serviceEndpoint);
    const { iss } = jwt.decode(token) as { iss: string };
    const issuerDIDDoc = await this._resolver.read(iss);
    const verifier = new ProofVerifier(issuerDIDDoc);
    if (await verifier.verifyAssertionProof(token)) {
      return iss;
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
    role: string,
    issuerDID: string
  ): Promise<boolean> {
    const { dids, role: string } = await this.resolveIsuers(role);
    let didMatched = false;
    if (dids.length > 0) {
      for (let i = 0; i < dids.length; i++) {
        if (dids[i] == issuerDID) {
          didMatched = true;
          break;
        }
      }
    }
    const serviceEndpoint = await this.getCredentialUrl(issuerDID, role);
    const token = await this._credentialResolver.getCredential(serviceEndpoint);
    const payload = jwt.decode(token) as { iss: string };
    const issuerDIDDoc = await this._resolver.read(payload.iss);
    const verifier = new ProofVerifier(issuerDIDDoc);
    if ((await verifier.verifyAssertionProof(token)) || didMatched) {
      return true;
    } else {
      return false;
    }
  }
}
