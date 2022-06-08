import * as jwt from 'jsonwebtoken';
import { providers } from 'ethers';
import { ProofVerifier } from '@ew-did-registry/claims';
import { Resolver } from '@ew-did-registry/did-ethr-resolver';
import { RegistrySettings } from '@ew-did-registry/did-resolver-interface';
import { CredentialResolver, IssuerResolver } from '.';
import { OffChainClaim } from './models';

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
   * Verifies chain of trust for a given holder's DID and role
   * @param {string} issuerDID
   * @param {string} role
   */
  async verifyChainOfTrustClaims(issuerDID: string, role: string) {
    let currentIssuerDID = issuerDID;
    while (true) {
      if (!(await this.verifyIssuerAuthority(role, currentIssuerDID))) {
        throw new Error('Issuer is not allowed to issue credential');
      }
      const roleIssuers = await this._issuerDefResolver.getIssuerDefinition(
        role
      );
      if (await this.isRoleIssuerDID(role)) {
        return true;
      } else if (roleIssuers && roleIssuers.roleName) {
        const issuedToken = await this._credentialResolver.getClaimIssuedToken(
          currentIssuerDID,
          roleIssuers.roleName
        );
        if (!issuedToken) {
          throw new Error(
            'Unable to resolve the issuer credential to verify their authority'
          );
        }
        const nextIssuerDID = await this.verifyIssuedToken(issuedToken);
        if (nextIssuerDID) {
          currentIssuerDID = nextIssuerDID;
          role = roleIssuers.roleName;
        } else {
          throw new Error('The credential is invalid');
        }
      }
    }
  }

  /**
   * Returns true if the role issuer type is DID
   * @param role
   * @returns
   */
  private async isRoleIssuerDID(role: string) {
    const issuers = await this._issuerDefResolver.getIssuerDefinition(role);
    return issuers && issuers.issuerType === 'DID';
  }

  /**
   * Verify issued token signature
   * @param {string} token
   */
  async verifyIssuedToken(token: string) {
    const offChainClaim = jwt.decode(token) as OffChainClaim;
    const issuerDIDDoc = await this._resolver.read(offChainClaim.iss);
    const verifier = new ProofVerifier(issuerDIDDoc);
    if (await verifier.verifyAssertionProof(token)) {
      return offChainClaim.iss;
    } else {
      throw new Error('Invalid Credential');
    }
  }

  /**
   * Verifies issuer's authority to issue credential for a namespace
   * @param {string} namespace
   * @param {string} issuerDID
   * @returns boolean
   */
  async verifyIssuerAuthority(
    namespace: string,
    issuerDID: string
  ): Promise<boolean> {
    const issuers = await this._issuerDefResolver.getIssuerDefinition(
      namespace
    );
    if (issuers && issuers.did && issuers.issuerType === 'DID') {
      for (let i = 0; i < issuers.did.length; i++) {
        if (issuers.did[i] === issuerDID) {
          return true;
        }
      }
    }
    let issuedToken;
    if (issuers && issuers.roleName) {
      issuedToken = await this._credentialResolver.getClaimIssuedToken(
        issuerDID,
        issuers.roleName
      );
    }
    if (!issuedToken) {
      return false;
    }
    const isClaimVerified = await this.verifyIssuedToken(issuedToken);
    return typeof isClaimVerified === 'string';
  }
}
