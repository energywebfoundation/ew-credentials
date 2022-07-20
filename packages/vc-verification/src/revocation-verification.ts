import {
  StatusList2021Credential,
  validateStatusList,
  isVerifiableCredential,
  StatusList2021Entry,
  VerifiableCredential,
} from '@ew-did-registry/credentials-interface';
import {
  VCIssuerVerification,
  ClaimIssuerVerification,
  CredentialResolver,
  IssuerResolver,
  RevokerResolver,
} from '.';
import { InvalidRevokerType, NoRevokers, RevokerNotAuthorized } from './errors';
import { issuerDID, RoleEIP191JWT } from './models';
import { addressOf } from '@ew-did-registry/did-ethr-resolver';
import { StatusListEntryVerification } from '@ew-did-registry/revocation';
import { RoleCredentialSubject } from '@energyweb/credential-governance';

/**
 * Provides verification of revocation of EnergyWeb role verifiable credential
 */
export class RevocationVerification {
  private credentialResolver: CredentialResolver;
  private vcIssuerVerification: VCIssuerVerification;
  private claimIssuerVerification: ClaimIssuerVerification;
  private _statusListEntryVerificaiton: StatusListEntryVerification;

  constructor(
    private revokerResolver: RevokerResolver,
    private issuerResolver: IssuerResolver,
    credentialResolver: CredentialResolver,
    vcIssuerVerification: VCIssuerVerification,
    claimIssuerVerification: ClaimIssuerVerification,
    private verifyProof: (vc: string, proof_options: string) => Promise<any>
  ) {
    this.credentialResolver = credentialResolver;
    this.vcIssuerVerification = vcIssuerVerification;
    this.claimIssuerVerification = claimIssuerVerification;
    this._statusListEntryVerificaiton = new StatusListEntryVerification(
      verifyProof
    );
  }

  /**
   * Verifies that status list is issued by revoker specified in role definition
   * Revoker authorization must be verified by verifiable credential
   *
   * ```typescript
   * const revocationVerification = new RevocationVerification(
   * revokerResolver,
   * credentialResolver,
   * vcIssuerVerification,
   * claimIssuerVerification,
   * );
   * let credential : StatusList2021Credential;
   * const role = 'role';
   * await revocationVerification.verifyStatusList(credential, role);
   * ```
   * @param role role name
   * @param statusList credential which contains revocation status of `role` credential
   */
  async verifyStatusList(statusList: StatusList2021Credential, role: string) {
    validateStatusList(statusList);

    const revoker = issuerDID(statusList.issuer);
    await this.verifyRevoker(revoker, role);
  }

  /**
   * Verifies that `revoker` is authorized to revoke `role` credential
   *
   * ```typescript
   * const revocationVerification = new RevocationVerification(
   * revokerResolver,
   * credentialResolver,
   * vcIssuerVerification,
   * claimIssuerVerification,
   * );
   * const revoker = 'did:ethr:ewc:0x...';
   * const role = 'role';
   * await revocationVerification.verifyRevoker(revoker, role);
   * ```
   * @param revoker DID of revoker
   * @param role name of the role verifiable credential
   */
  async verifyRevoker(revoker: string, role: string) {
    const revokers = await this.revokerResolver.getRevokerDefinition(role);
    if (!revokers) {
      throw new NoRevokers(role);
    }
    const { did, revokerType, roleName: revokerRole } = revokers;
    if (revokerType === 'DID' && did) {
      // revokers in role definition and credential's have different DID format
      if (
        !did.some(
          (r) => addressOf(r).toUpperCase() === addressOf(revoker).toUpperCase()
        )
      ) {
        throw new RevokerNotAuthorized(
          revoker,
          role,
          'revoker is not in DID list'
        );
      }
    } else if (revokerRole) {
      try {
        const revokerCredential = await this.credentialResolver.getCredential(
          revoker,
          revokerRole
        );
        if (isVerifiableCredential(revokerCredential)) {
          await this.vcIssuerVerification.verifyIssuance(revoker, revokerRole);
          await this.vcIssuerVerification.verifyIssuer(
            issuerDID(revokerCredential.issuer as string),
            revokerRole
          );
        } else {
          const rolePayload = await this.claimIssuerVerification.verifyIssuance(
            revoker,
            revokerRole
          );
          await this.claimIssuerVerification.verifyIssuer(
            rolePayload?.iss as string,
            revokerRole
          );
        }
      } catch (e) {
        throw new RevokerNotAuthorized(revoker, role, (<Error>e).message);
      }
    } else {
      throw new InvalidRevokerType(role, revokers?.revokerType);
    }
  }

  /**
   * Checks the revocation status for the given issuer and role
   * @param issuer issuer DID
   * @param role namespace
   * @returns
   */
  async checkRevocationStatus(issuer: string, role: string) {
    let issuerCredential:
      | VerifiableCredential<RoleCredentialSubject>
      | RoleEIP191JWT
      | undefined;
    let credentialStatus: StatusList2021Entry | undefined;
    while (true) {
      const issuers = await this.issuerResolver.getIssuerDefinition(role);
      if (issuers?.did) {
        return true;
      } else if (issuers?.roleName) {
        issuerCredential = await this.credentialResolver.getCredential(
          issuer,
          issuers?.roleName
        );
        try {
          if (
            isVerifiableCredential(issuerCredential) &&
            issuerCredential.credentialStatus
          ) {
            issuer = issuerCredential.issuer as string;
            role = issuers.roleName;
            credentialStatus = issuerCredential.credentialStatus;
            await this._statusListEntryVerificaiton.verifyCredentialStatus(
              issuerCredential.credentialStatus
            );
          } else {
            const rolePayload =
              await this.claimIssuerVerification.verifyIssuance(
                issuer,
                issuers?.roleName
              );
            issuer = rolePayload?.iss as string;
            role = issuers.roleName;
            credentialStatus = rolePayload?.credentialStatus;
            await this._statusListEntryVerificaiton.verifyCredentialStatus(
              rolePayload?.credentialStatus as StatusList2021Entry
            );
          }
        } catch (error) {
          const credential =
            await this._statusListEntryVerificaiton.fetchStatusListCredential(
              credentialStatus?.statusListCredential as string
            );
          await this.verifyRevoker(credential?.issuer as string, role);
          return false;
        }
      }
    }
  }
}
