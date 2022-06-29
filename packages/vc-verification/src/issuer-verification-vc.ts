import { CredentialResolver, IssuerResolver } from '.';
import { issuerDID } from './models';
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
   * Fetches role form a credential
   * @param credential
   * @returns
   */
  private async parseRoleFromCredential(
    credential: VerifiableCredential<RoleCredentialSubject>
  ) {
    return credential.credentialSubject.role.namespace;
  }

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
