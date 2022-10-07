import { ProofVerifier } from '@ew-did-registry/claims';
import { addressOf } from '@ew-did-registry/did-ethr-resolver';
import { CredentialResolver, IssuerResolver } from '..';
import {
  IDIDDocumentCache,
  IRoleCredentialCache,
  IRoleDefinitionCache,
  RolePayload,
  verificationResult,
  VerificationResult,
} from '../models';
import { ERRORS, InvalidIssuerType } from '../utils';

/**
 * A class to verify chain of trust for an issued RoleEIP191Jwt
 * The hierachy must only consist of RoleEIP191Jwt issuance
 */
export class ClaimIssuerVerification {
  private _issuerDefResolver: IssuerResolver;
  private _credentialResolver: CredentialResolver;

  /**
   *
   * @param credentialResolver
   * @param issuerDefResolver
   */
  constructor(
    credentialResolver: CredentialResolver,
    issuerDefResolver: IssuerResolver
  ) {
    this._issuerDefResolver = issuerDefResolver;
    this._credentialResolver = credentialResolver;
  }

  /**
   * Verifies that `issuer` is authorized to issue `role` claim
   *
   * ```typescript
   * const issuerVerification = new ClaimIssuerVerification(
   * credentialResolver,
   * issuerResolver
   * );
   * await issuerVerification.verifyIssuer('issuerDID', 'role', roleCredentialCache, roleDefCache, didDocumentCache);
   * ```
   * @param issuer DID of the issuer
   * @param role name of the role claim
   * @param roleCredentialCache Cache to store role credentials
   * @param roleDefCache Cache to store role definition
   * @param didDocumentCache Cache to store DIDDocument
   * @returns VerificationResult
   */
  async verifyIssuer(
    issuer: string,
    role: string,
    roleCredentialCache?: IRoleCredentialCache,
    roleDefCache?: IRoleDefinitionCache,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<VerificationResult> {
    let currentIssuerDID = issuer;
    while (true) {
      if (
        !(await this.verifyIssuerAuthority(
          role,
          currentIssuerDID,
          roleCredentialCache,
          roleDefCache,
          didDocumentCache
        ))
      ) {
        return verificationResult(false, ERRORS.IssuerNotAuthorized);
      }
      const roleIssuers = await this._issuerDefResolver.getIssuerDefinition(
        role,
        roleDefCache
      );
      if (roleIssuers && roleIssuers.did) {
        return verificationResult(true, '');
      } else if (roleIssuers && roleIssuers.roleName) {
        const currentIssuerClaim = await this.verifyIssuance(
          currentIssuerDID,
          roleIssuers.roleName,
          roleCredentialCache,
          didDocumentCache
        );
        if (currentIssuerClaim) {
          currentIssuerDID = currentIssuerClaim.iss as string;
          role = roleIssuers.roleName;
        } else {
          return verificationResult(false, ERRORS.InvalidCredentialProof);
        }
      }
    }
  }

  /**
   * Verifies that `role` claim was issued to `subject`
   * @param subject DID of the subject
   * @param role name of the role claim
   * @param roleCredentialCache Cache to store role credentials
   * @param didDocumentCache Cache to store DIDDocument
   * @returns valid RolePayload
   */
  async verifyIssuance(
    subject: string,
    role: string,
    roleCredentialCache?: IRoleCredentialCache,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<RolePayload | undefined> {
    const roleJWT = await this._credentialResolver.getEIP191JWT(
      subject,
      role,
      roleCredentialCache,
      didDocumentCache
    );
    if (!roleJWT) {
      throw new Error(
        'Unable to resolve the issuer credential to verify their authority'
      );
    }
    const issuerDIDDoc = await this._credentialResolver.getDIDDocument(
      roleJWT.payload.iss as string,
      didDocumentCache
    );
    const verifier = new ProofVerifier(issuerDIDDoc);
    if (await verifier.verifyAssertionProof(roleJWT.eip191Jwt)) {
      return roleJWT.payload;
    } else {
      return undefined;
    }
  }

  /**
   * Verifies issuer's authority to issue credential for a namespace
   * @param {string} namespace
   * @param {string} issuerDID
   * @param roleCredentialCache
   * @param roleDefCache
   * @param didDocumentCache
   * @returns boolean
   *
   * @todo remove as duplicate of this.verifyIssuer
   */
  private async verifyIssuerAuthority(
    namespace: string,
    issuerDID: string,
    roleCredentialCache?: IRoleCredentialCache,
    roleDefCache?: IRoleDefinitionCache,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<boolean> {
    const issuers = await this._issuerDefResolver.getIssuerDefinition(
      namespace,
      roleDefCache
    );
    if (issuers && issuers.did && issuers.issuerType === 'DID') {
      return issuers?.did?.find(
        (d) => addressOf(d).toUpperCase() === addressOf(issuerDID).toUpperCase()
      )
        ? true
        : false;
    }
    let claim;
    if (issuers && issuers.roleName) {
      claim = await this.verifyIssuance(
        issuerDID,
        issuers.roleName,
        roleCredentialCache,
        didDocumentCache
      );
    } else {
      throw new InvalidIssuerType(namespace, issuers?.issuerType);
    }
    return claim instanceof Object;
  }
}
