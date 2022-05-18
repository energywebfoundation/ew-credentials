import * as jwt from 'jsonwebtoken';
import { providers } from 'ethers';
import { ProofVerifier } from '@ew-did-registry/claims';
import { Resolver, addressOf } from '@ew-did-registry/did-ethr-resolver';
import { RegistrySettings } from '@ew-did-registry/did-resolver-interface';
import { CredentialResolver, IssuerDefinitionResolver } from '.';
import { OffChainClaim } from './models';

export class ClaimIssuerVerification {
  private _resolver: Resolver;
  private _issuerDefResolver: IssuerDefinitionResolver;
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
    issuerDefResolver: IssuerDefinitionResolver
  ) {
    this._issuerDefResolver = issuerDefResolver;
    this._resolver = new Resolver(provider, registrySetting);
    this._credentialResolver = credentialResolver;
  }

  /**
   * Verifies chain of trust for a given holder's DID and role
   * @param {string} credential
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
        const offChainClaim = await this._credentialResolver.getOffChainClaim(
          currentIssuerDID,
          roleIssuers.roleName
        );
        if (!offChainClaim) {
          throw new Error('No credential found');
        } else {
          let nextIssuerDID;
          if (offChainClaim.issuedToken) {
            nextIssuerDID = await this.verifyIssuedToken(
              offChainClaim.issuedToken
            );
          }
          if (nextIssuerDID) {
            currentIssuerDID = nextIssuerDID;
            if (roleIssuers && roleIssuers.roleName) {
              role = roleIssuers.roleName;
            }
          } else {
            throw new Error('The credential is invalid');
          }
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
    return issuers && issuers.did && issuers.did.length > 0;
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
   * Verifies issuer's authority to issue credential
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
    if (issuers && issuers.did && issuers.did.length > 0) {
      for (let i = 0; i < issuers.did.length; i++) {
        if (issuers.did[i] == addressOf(issuerDID)) {
          return true;
        }
      }
    }
    let offChainClaim;
    if (issuers && issuers.roleName) {
      offChainClaim = await this._credentialResolver.getOffChainClaim(
        issuerDID,
        issuers.roleName
      );
    }
    if (!offChainClaim) {
      return false;
    }
    const isClaimVerified = await this.verifyIssuedToken(
      offChainClaim.issuedToken
    );
    return typeof isClaimVerified === 'string';
  }
}
