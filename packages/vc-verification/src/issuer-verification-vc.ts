import { CredentialResolver, IssuerResolver } from '.';
import { issuerDID, VerificationResult } from './models';
import { verifyCredential } from 'didkit-wasm-node';
import { VerifiableCredential } from '@ew-did-registry/credentials-interface';
import type { RoleCredentialSubject } from '@energyweb/credential-governance';
import {
  InvalidCredentialProof,
  InvalidIssuerType,
  IssuerNotAuthorized,
  NoCredential,
  NoIssuers,
} from './errors';
/**
 * A class to verify chain of trust for a Verifiable Credential
 * The hierachy must only consist of VC issuance
 */
export class VCIssuerVerification {
  constructor(
    private issuerResolver: IssuerResolver,
    private credentialResolver: CredentialResolver
  ) {}

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
      const vc = await this.credentialResolver.getCredential(subjectDID, role);
      if (!vc) {
        throw new NoCredential(role, subjectDID);
      } else {
        if (vc.proof) {
          await verifyCredential(JSON.stringify(vc), JSON.stringify({}));
        }
        const issuer = issuerDID(vc.issuer);
        await this.verifyIssuer(issuer, role);
        subjectDID = issuer;
        if (await this.isRoleIssuerDID(role)) {
          return true;
        }
        const issuers = await this.issuerResolver.getIssuerDefinition(role);
        if (issuers && issuers.roleName) {
          role = issuers.roleName;
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
    while (hasParent) {
      const role = await this.parseRoleFromCredential(credential);
      const issuers = await this.issuerResolver.getIssuerDefinition(role);
      if (issuers && issuers.did && issuers.did.length > 0) {
        for (let i = 0; i < issuers.did.length; i++) {
          if (issuers.did[i] == credential.issuer) {
            hasParent = false;
            break;
          }
        }
      } else {
        const issuerCredential = await this.credentialResolver.getCredential(
          credential.issuer as string,
          role
        );
        if (!issuerCredential) {
          throw new NoCredential(role, issuerDID(credential.issuer));
        }
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
    const issuers = await this.issuerResolver.getIssuerDefinition(role);
    return issuers && issuers.issuerType === 'DID';
  }

  /**
   * Verifies issuer's authority to issue credential for a namespace
   * @param {string} role role credential name
   * @param {string} issuer DID of issuer
   */
  async verifyIssuer(issuer: string, role: string) {
    const issuers = await this.issuerResolver.getIssuerDefinition(role);
    if (!issuers) {
      throw new NoIssuers(role);
    }
    if (issuers.issuerType === 'DID' && issuers.did) {
      if (!issuers.did?.some((i) => i.toUpperCase() === issuer.toUpperCase())) {
        throw new IssuerNotAuthorized(
          issuer,
          role,
          'issuer is not in DID list'
        );
      }
    } else if (issuers.issuerType === 'ROLE' && issuers.roleName) {
      try {
        await this.verifyCredential(issuer, issuers.roleName);
      } catch (e) {
        throw new IssuerNotAuthorized(issuer, role, (<Error>e).message);
      }
    } else {
      throw new InvalidIssuerType(role, issuers.issuerType);
    }
  }

  /**
   * Verifies that role credential was issued to subject by authorized issuer
   * @param subject DID of revoker
   * @param role fully qualified role credential name
   *
   * @returns verified role credential
   */
  async verifyCredential(
    subject: string,
    role: string
  ): Promise<VerifiableCredential<RoleCredentialSubject>> {
    const roleVC = await this.credentialResolver.getCredential(subject, role);
    if (!roleVC) {
      throw new NoCredential(role, subject);
    }
    const { errors } = JSON.parse(
      await verifyCredential(JSON.stringify(roleVC), JSON.stringify({}))
    );
    if (errors.length) {
      throw new InvalidCredentialProof(
        roleVC.proof.proofValue as string,
        issuerDID(roleVC.issuer)
      );
    }
    await this.verifyIssuer(issuerDID(roleVC.issuer), role);

    return roleVC;
  }
}
