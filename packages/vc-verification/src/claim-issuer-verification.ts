import * as jwt from 'jsonwebtoken';
import { providers } from 'ethers';
import { ProofVerifier } from '@ew-did-registry/claims';
import { addressOf, Resolver } from '@ew-did-registry/did-ethr-resolver';
import { RegistrySettings } from '@ew-did-registry/did-resolver-interface';
import { CredentialResolver, IssuerResolver } from '.';
import { RolePayload, verificationResult, VerificationResult } from './models';
import { ERRORS, InvalidIssuerType } from './errors';

/**
 * A class to verify chain of trust for an issued OffChainClaim
 * The hierachy must only consist of OffchainClaim issuance
 */
export class ClaimIssuerVerification {
  private _resolver: Resolver;
  private _issuerDefResolver: IssuerResolver;
  private _credentialResolver: CredentialResolver;

  /**
   *
   * @param provider
   * @param registrySetting
   * @param credentialResolver
   * @param issuerDefResolver
   */
  constructor(
    provider: providers.Provider,
    registrySetting: RegistrySettings,
    credentialResolver: CredentialResolver,
    issuerDefResolver: IssuerResolver
  ) {
    this._issuerDefResolver = issuerDefResolver;
    this._resolver = new Resolver(provider, registrySetting);
    this._credentialResolver = credentialResolver;
  }

  /**
   * Verifies that `issuer` is authorized to issue `role` claim
   *
   * ```typescript
   * const issuerVerification = new ClaimIssuerVerification(
   * provider,
   * RegistrySettings,
   * credentialResolver,
   * issuerResolver
   * );
   * await issuerVerification.verifyIssuer('issuerDID', 'role');
   * ```
   * @param issuer DID of the issuer
   * @param role name of the role claim
   * @returns VerificationResult
   */
  async verifyIssuer(
    issuer: string,
    role: string
  ): Promise<VerificationResult> {
    let currentIssuerDID = issuer;
    while (true) {
      if (!(await this.verifyIssuerAuthority(role, currentIssuerDID))) {
        return verificationResult(false, ERRORS.IssuerNotAuthorized);
      }
      const roleIssuers = await this._issuerDefResolver.getIssuerDefinition(
        role
      );
      if (roleIssuers && roleIssuers.did) {
        return verificationResult(true, '');
      } else if (roleIssuers && roleIssuers.roleName) {
        const currentIssuerClaim = await this.verifyIssuance(
          currentIssuerDID,
          roleIssuers.roleName
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
   * @returns valid RolePayload
   */
  async verifyIssuance(
    subject: string,
    role: string
  ): Promise<RolePayload | undefined> {
    const roleJWT = await this._credentialResolver.getEIP191JWT(subject, role);
    if (!roleJWT) {
      throw new Error(
        'Unable to resolve the issuer credential to verify their authority'
      );
    }
    const issuerDIDDoc = await this._resolver.read(
      roleJWT.payload.iss as string
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
   * @returns boolean
   *
   * @todo remove as duplicate of this.verifyIssuer
   */
  private async verifyIssuerAuthority(
    namespace: string,
    issuerDID: string
  ): Promise<boolean> {
    const issuers = await this._issuerDefResolver.getIssuerDefinition(
      namespace
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
      claim = await this.verifyIssuance(issuerDID, issuers.roleName);
    } else {
      throw new InvalidIssuerType(namespace, issuers?.issuerType);
    }
    return claim instanceof Object;
  }
}
