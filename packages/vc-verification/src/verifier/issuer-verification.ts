import {
  CredentialResolver,
  IssuerResolver,
  VerificationResult,
  RevocationVerification,
  RoleDefinitionCache,
  RoleCredentialCache,
} from '..';
import { ClaimIssuerVerification } from './claim-issuer-verification';
import { VCIssuerVerification } from './vc-issuer-verification';
import { providers } from 'ethers';
import {
  isVerifiableCredential,
  VerifiableCredential,
} from '@ew-did-registry/credentials-interface';
import type { RoleCredentialSubject } from '@energyweb/credential-governance';
import { addressOf } from '@ew-did-registry/did-ethr-resolver';
import { RegistrySettings } from '@ew-did-registry/did-resolver-interface';
import { verificationResult, RoleEIP191JWT } from '../models';
import { ERRORS } from '../utils';
import { IRoleCredentialCache, IRoleDefinitionCache } from '../models';

/**
 * A class to provide verification of issuer authority for either VC or RoleEIP191JWT
 */
export class IssuerVerification {
  private vcIssuerVerification: VCIssuerVerification;
  private claimIssuerVerification: ClaimIssuerVerification;
  private revocationVerification: RevocationVerification;

  constructor(
    private issuerResolver: IssuerResolver,
    private credentialResolver: CredentialResolver,
    provider: providers.Provider,
    registrySetting: RegistrySettings,
    revocationVerification: RevocationVerification,
    private verifyProof: (vc: string, proof_options: string) => Promise<any>
  ) {
    this.vcIssuerVerification = new VCIssuerVerification(
      issuerResolver,
      credentialResolver,
      verifyProof
    );
    this.claimIssuerVerification = new ClaimIssuerVerification(
      provider,
      registrySetting,
      credentialResolver,
      issuerResolver
    );
    this.revocationVerification = revocationVerification;
  }

  /**
   * Verifies issuer authority with either Verifiable Credential or RoleEIP191JWT
   *
   * ```typescript
   * const issuerVerification = new IssuerVerification(
   * issuerResolver
   * credentialResolver,
   * provider,
   * registrySetting,
   * revocationVerification,
   * verifyProof
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
      | RoleEIP191JWT
      | undefined;
    const roleDefCache = new RoleDefinitionCache();
    const roleCredentialCache = new RoleCredentialCache();
    this.credentialResolver.setRoleCredentialCache(roleCredentialCache);
    this.issuerResolver.setRoleDefinitionCache(roleDefCache);
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
        return verificationResult(
          false,
          `${ERRORS.NoCredential} for role ${issuers?.roleName}`
        );
      }
      const revocationStatusResult =
        await this.revocationVerification.checkRevocationStatus(issuer, role);
      if (!revocationStatusResult.verified) {
        return revocationStatusResult;
      }
      if (isVerifiableCredential(issuerCredential)) {
        return await this.vcIssuerVerification.verifyIssuer(issuer, role);
      }
      return await this.claimIssuerVerification.verifyIssuer(issuer, role);
    } else {
      return issuers?.did?.find(
        (d) => addressOf(d).toUpperCase() === addressOf(issuer).toUpperCase()
      )
        ? verificationResult(true, '')
        : verificationResult(false, ERRORS.IssuerNotAuthorized);
    }
  }
}
