import { CredentialResolver, IssuerResolver } from '.';
import { issuerDID } from './models';
import { VerifiableCredential } from '@ew-did-registry/credentials-interface';
import type { RoleCredentialSubject } from '@energyweb/credential-governance';
import {
  InvalidCredentialProof,
  InvalidIssuerType,
  IssuerNotAuthorized,
  NoCredential,
  NoIssuers,
} from './errors';
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
   * @param issuer DID of the issuer
   * @param role name of the role verifiable credential
   */
  async verifyIssuer(issuer: string, role: string) {
    const issuers = await this.issuerResolver.getIssuerDefinition(role);
    if (!issuers) {
      throw new NoIssuers(role);
    }
    if (issuers.issuerType === 'DID' && issuers.did) {
      // issuers in role definition are addresses, but in credential are DID's
      if (
        !issuers.did?.some(
          (i) => addressOf(i).toUpperCase() === addressOf(issuer).toUpperCase()
        )
      ) {
        throw new IssuerNotAuthorized(
          issuer,
          role,
          'issuer is not in DID list'
        );
      }
    } else if (issuers.issuerType === 'ROLE' && issuers.roleName) {
      try {
        await this.verifyIssuerCredential(issuer, issuers.roleName);
      } catch (e) {
        throw new IssuerNotAuthorized(issuer, role, (<Error>e).message);
      }
    } else {
      throw new InvalidIssuerType(role, issuers.issuerType);
    }
  }

  /**
   * Verifies that `role` credential was issued to `subject`
   * @param subject DID of the subject
   * @param role name of the role credential
   * @returns verified role credential
   */
  async verifyIssuance(
    subject: string,
    role: string
  ): Promise<VerifiableCredential<RoleCredentialSubject>> {
    const roleVC = await this.credentialResolver.getVerifiableCredential(
      subject,
      role
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
   */
  private async verifyIssuerCredential(issuer: string, role: string) {
    const vc = await this.verifyIssuance(issuer, role);
    await this.verifyIssuer(issuerDID(vc.issuer), role);
  }
}
