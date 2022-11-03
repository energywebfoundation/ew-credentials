import { CredentialResolver, IssuerResolver } from '../resolver';
import {
  IRoleCredentialCache,
  IRoleDefinitionCache,
  VerificationResult,
  verificationResult,
} from '../models';
import { VerifiableCredential } from '@ew-did-registry/credentials-interface';
import type { RoleCredentialSubject } from '@energyweb/credential-governance';
import {
  ERRORS,
  InvalidCredentialProof,
  NoCredential,
  issuerDID,
} from '../utils';
import { addressOf } from '@ew-did-registry/did-ethr-resolver';

/**
 * A class to verify chain of trust for a Verifiable Credential
 * The hierachy must only consist of VC issuance
 */
export class VCIssuerVerification {
  constructor(
    private issuerResolver: IssuerResolver,
    private credentialResolver: CredentialResolver,
    private verifyProof: (vc: string, proof_options: string) => Promise<any>
  ) {}

  /**
   * Verifies that `issuer` is authorized to issue `role`
   *
   * ```typescript
   * const issuerVerification = new VCIssuerVerification(
   * issuerResolver,
   * credentialResolver,
   * verifyCredential
   * );
   * await issuerVerification.verifyIssuer('issuerDID', 'role', roleCredentialCache, roleDefCache);
   * ```
   * @param issuer DID of the issuer
   * @param role name of the role verifiable credential
   * @param roleCredentialCache Cache to store role credentials
   * @param roleDefCache Cache to store role definition
   * @returns VerificationResult
   */
  async verifyIssuer(
    issuer: string,
    role: string,
    roleCredentialCache?: IRoleCredentialCache,
    roleDefCache?: IRoleDefinitionCache
  ): Promise<VerificationResult> {
    const issuers = await this.issuerResolver.getIssuerDefinition(
      role,
      roleDefCache
    );
    if (!issuers) {
      return verificationResult(false, ERRORS.NoIssuers);
    }
    if (issuers.issuerType === 'DID' && issuers.did) {
      // issuers in role definition are addresses, but in credential are DID's
      return issuers?.did?.find(
        (d) => addressOf(d).toUpperCase() === addressOf(issuer).toUpperCase()
      )
        ? verificationResult(true, '')
        : verificationResult(false, ERRORS.IssuerNotAuthorized);
    } else if (issuers.issuerType === 'ROLE' && issuers.roleName) {
      try {
        await this.verifyIssuerCredential(
          issuer,
          issuers.roleName,
          roleCredentialCache,
          roleDefCache
        );
      } catch (e) {
        return verificationResult(false, ERRORS.IssuerNotAuthorized);
      }
    } else {
      return verificationResult(false, ERRORS.InvalidIssuerType);
    }
    return verificationResult(true, '');
  }

  /**
   * Verifies that `role` credential was issued to `subject`
   * @param subject DID of the subject
   * @param role name of the role credential
   * @param roleCredentialCache Cache to store role credentials
   * @returns verified role credential
   */
  async verifyIssuance(
    subject: string,
    role: string,
    roleCredentialCache?: IRoleCredentialCache
  ): Promise<VerifiableCredential<RoleCredentialSubject>> {
    const roleVC = await this.credentialResolver.getVerifiableCredential(
      subject,
      role,
      roleCredentialCache
    );
    if (!roleVC) {
      throw new NoCredential(role, subject);
    }
    const { errors } = JSON.parse(
      await this.verifyProof(JSON.stringify(roleVC), JSON.stringify({}))
    );
    if (errors.length) {
      throw new InvalidCredentialProof(
        roleVC.proof.proofValue as string,
        issuerDID(roleVC.issuer)
      );
    }
    return roleVC;
  }

  /**
   * Verifies that issuer has required `role` credential
   * @param issuer DID of revoker
   * @param role name of the role credential
   * @param roleCredentialCache Cache to store role credentials
   * @param roleDefCache Cache to store role definition
   */
  private async verifyIssuerCredential(
    issuer: string,
    role: string,
    roleCredentialCache?: IRoleCredentialCache,
    roleDefCache?: IRoleDefinitionCache
  ) {
    const vc = await this.verifyIssuance(issuer, role, roleCredentialCache);

    await this.verifyIssuer(
      issuerDID(vc.issuer),
      role,
      roleCredentialCache,
      roleDefCache
    );
  }
}
