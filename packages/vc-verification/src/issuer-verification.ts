import {
  VCIssuerVerification,
  ClaimIssuerVerification,
  CredentialResolver,
  IssuerResolver,
  OffChainClaim,
} from '.';
import { VerifiableCredential } from '@ew-did-registry/credentials-interface';
import type { RoleCredentialSubject } from '@energyweb/credential-governance';
import { NoCredential } from './errors';
import { addressOf } from '@ew-did-registry/did-ethr-resolver';

/**
 * A class to provide verification of issuer authority for either VC or OffChainClaim
 */
export class IssuerVerification {
  private credentialResolver: CredentialResolver;
  private vcIssuerVerification: VCIssuerVerification;
  private claimIssuerverification: ClaimIssuerVerification;

  constructor(
    private issuerResolver: IssuerResolver,
    credentialResolver: CredentialResolver,
    vcIssuerVerification: VCIssuerVerification,
    claimIssuerverification: ClaimIssuerVerification
  ) {
    this.credentialResolver = credentialResolver;
    this.vcIssuerVerification = vcIssuerVerification;
    this.claimIssuerverification = claimIssuerverification;
  }

  /**
   * Verifies issuer authority with either Verifiable Credential or OffChainClaim
   *
   * ```typescript
   * const issuerVerification = new IssuerVerification(
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
   * @returns
   */
  async verifyIssuer(issuer: string, role: string) {
    let issuerCredential:
      | VerifiableCredential<RoleCredentialSubject>
      | OffChainClaim
      | undefined;
    const issuers = await this.issuerResolver.getIssuerDefinition(role);
    if (issuers?.roleName) {
      issuerCredential = await this.credentialResolver.getCredential(
        issuer,
        issuers?.roleName
      );

      if (!issuerCredential) {
        throw new NoCredential(role, issuer);
      }
      if (issuerCredential?.issuer) {
        return await this.vcIssuerVerification.verifyIssuer(issuer, role);
      }
      return await this.claimIssuerverification.verifyIssuer(issuer, role);
    } else {
      return issuers?.did?.find(
        (d) => addressOf(d).toUpperCase() === addressOf(issuer).toUpperCase()
      )
        ? true
        : false;
    }
  }
}
