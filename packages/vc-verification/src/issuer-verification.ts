import {
  VCIssuerVerification,
  ClaimIssuerVerification,
  CredentialResolver,
  IssuerResolver,
  OffChainClaim,
  VerificationResult,
} from '.';
import { VerifiableCredential } from '@ew-did-registry/credentials-interface';
import type { RoleCredentialSubject } from '@energyweb/credential-governance';
import { addressOf } from '@ew-did-registry/did-ethr-resolver';
import { verificationResult } from './models';
import { ERRORS } from './errors';

/**
 * A class to provide verification of issuer authority for either VC or OffChainClaim
 */
export class IssuerVerification {
  private vcIssuerVerification: VCIssuerVerification;
  private claimIssuerverification: ClaimIssuerVerification;

  constructor(
    private issuerResolver: IssuerResolver,
    private credentialResolver: CredentialResolver,
    vcIssuerVerification: VCIssuerVerification,
    claimIssuerverification: ClaimIssuerVerification
  ) {
    this.vcIssuerVerification = vcIssuerVerification;
    this.claimIssuerverification = claimIssuerverification;
  }

  /**
   * Verifies issuer authority with either Verifiable Credential or OffChainClaim
   *
   * ```typescript
   * const issuerVerification = new IssuerVerification(
   * issuerResolver
   * credentialResolver,
   * vcIssuerVerification,
   * claimIssuerVerification,
   * );
   *
   * let issuer : 'did:ethr:volta:0x...';
   * const role = 'role';
   * await issuerVerification.verifyIssuer(issuer, role);
   * ```
   *
   * @param issuer issuer DID to verify authority
   * @param role authoritative role to be issuer
   * @returns VerificationResult
   */
  async verifyIssuer(
    issuer: string,
    role: string
  ): Promise<VerificationResult> {
    let issuerCredential:
      | VerifiableCredential<RoleCredentialSubject>
      | OffChainClaim
      | undefined;

    const issuers = await this.issuerResolver.getIssuerDefinition(role);
    if (!issuers) {
      return verificationResult(false, ERRORS.NoIssuers);
    }
    if (issuers?.roleName) {
      issuerCredential = await this.credentialResolver.getCredential(
        issuer,
        issuers?.roleName
      );

      if (!issuerCredential) {
        return verificationResult(false, ERRORS.NoCredential);
      }
      if (issuerCredential?.issuer) {
        return await this.vcIssuerVerification.verifyIssuer(issuer, role);
      }
      return await this.claimIssuerverification.verifyIssuer(issuer, role);
    } else {
      return issuers?.did?.find(
        (d) => addressOf(d).toUpperCase() === addressOf(issuer).toUpperCase()
      )
        ? verificationResult(true, '')
        : verificationResult(false, ERRORS.IssuerNotAuthorized);
    }
  }
}
