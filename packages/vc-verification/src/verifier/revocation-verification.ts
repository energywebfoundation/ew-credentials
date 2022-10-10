import {
  StatusList2021Credential,
  validateStatusList,
  isVerifiableCredential,
  StatusList2021Entry,
  VerifiableCredential,
} from '@ew-did-registry/credentials-interface';
import { CredentialResolver, IssuerResolver, RevokerResolver } from '..';
import { ClaimIssuerVerification } from './claim-issuer-verification';
import { VCIssuerVerification } from './vc-issuer-verification';
import {
  ERRORS,
  InvalidRevokerType,
  NoRevokers,
  RevokerNotAuthorized,
  issuerDID,
} from '../utils';
import {
  IDIDDocumentCache,
  IRoleCredentialCache,
  IRoleDefinitionCache,
  RoleEIP191JWT,
  verificationResult,
  VerificationResult,
} from '../models';
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
    private verifyProof: (vc: string, proof_options: string) => Promise<any>
  ) {
    this.credentialResolver = credentialResolver;
    this.vcIssuerVerification = new VCIssuerVerification(
      issuerResolver,
      credentialResolver,
      verifyProof
    );
    this.claimIssuerVerification = new ClaimIssuerVerification(
      credentialResolver,
      issuerResolver
    );
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
   * issuerResolver,
   * credentialResolver,
   * verifyProof
   * );
   * let statusList : StatusList2021Credential;
   * const role = 'role';
   * await revocationVerification.verifyStatusList(statusList, role, roleCredentialCache, roleDefCache, didDocumentCache);
   * ```
   * @param statusList credential which contains revocation status of `role` credential
   * @param role role name
   * @param roleCredentialCache Cache to store role credentials
   * @param roleDefCache Cache to store role definition
   * @param didDocumentCache Cache to store DID Documents
   */
  async verifyStatusList(
    statusList: StatusList2021Credential,
    role: string,
    roleCredentialCache?: IRoleCredentialCache,
    roleDefCache?: IRoleDefinitionCache,
    didDocumentCache?: IDIDDocumentCache
  ) {
    validateStatusList(statusList);

    const revoker = issuerDID(statusList.issuer);
    await this.verifyRevoker(
      revoker,
      role,
      roleCredentialCache,
      roleDefCache,
      didDocumentCache
    );
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
   * await revocationVerification.verifyRevoker(revoker, role, roleCredentialCache, roleDefCache, didDocumentCache);
   * ```
   * @param revoker DID of revoker
   * @param role name of the role verifiable credential
   * @param roleCredentialCache Cache to store role credentials
   * @param roleDefCache Cache to store role definition
   * @param didDocumentCache Cache to store DID Documents
   */
  async verifyRevoker(
    revoker: string,
    role: string,
    roleCredentialCache?: IRoleCredentialCache,
    roleDefCache?: IRoleDefinitionCache,
    didDocumentCache?: IDIDDocumentCache
  ) {
    const revokers = await this.revokerResolver.getRevokerDefinition(
      role,
      roleDefCache
    );
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
          revokerRole,
          roleCredentialCache,
          didDocumentCache
        );
        if (isVerifiableCredential(revokerCredential)) {
          await this.vcIssuerVerification.verifyIssuance(
            revoker,
            revokerRole,
            roleCredentialCache
          );
          await this.vcIssuerVerification.verifyIssuer(
            issuerDID(revokerCredential.issuer as string),
            revokerRole,
            roleCredentialCache,
            roleDefCache
          );
        } else {
          const rolePayload = await this.claimIssuerVerification.verifyIssuance(
            revoker,
            revokerRole,
            roleCredentialCache,
            didDocumentCache
          );
          await this.claimIssuerVerification.verifyIssuer(
            rolePayload?.iss as string,
            revokerRole,
            roleCredentialCache,
            roleDefCache,
            didDocumentCache
          );
        }
      } catch (e) {
        throw new RevokerNotAuthorized(
          revoker,
          role,
          (<Error>e).message,
          (<Error>e).stack
        );
      }
    } else {
      throw new InvalidRevokerType(role, revokers?.revokerType);
    }
  }

  /**
   * Verifies revocation status of `issuer` credential required to issue `role`
   * @param issuer issuer DID
   * @param role namespace
   * @param roleCredentialCache Cache to store role credentials
   * @param roleDefCache Cache to store role definition
   * @param didDocumentCache Cache to store DID Documents
   * @returns
   */
  async checkRevocationStatus(
    issuer: string,
    role: string,
    roleCredentialCache?: IRoleCredentialCache,
    roleDefCache?: IRoleDefinitionCache,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<VerificationResult> {
    let issuerCredential:
      | VerifiableCredential<RoleCredentialSubject>
      | RoleEIP191JWT
      | undefined;
    let credentialStatus: StatusList2021Entry | undefined;
    while (true) {
      const issuers = await this.issuerResolver.getIssuerDefinition(
        role,
        roleDefCache
      );
      if (issuers?.did) {
        return verificationResult(true, '');
      } else if (issuers?.roleName) {
        issuerCredential = await this.credentialResolver.getCredential(
          issuer,
          issuers?.roleName,
          roleCredentialCache,
          didDocumentCache
        );
        try {
          if (
            isVerifiableCredential(issuerCredential) &&
            issuerCredential.credentialStatus
          ) {
            issuer = issuerCredential.issuer as string;
            role = issuers.roleName;
            credentialStatus = issuerCredential.credentialStatus;

            const expirationDate = new Date(
              issuerCredential?.expirationDate as string
            ).getTime();

            if (expirationDate && expirationDate < Date.now()) {
              return verificationResult(false, ERRORS.IssuerCredentialExpired);
            }
            await this._statusListEntryVerificaiton.verifyCredentialStatus(
              issuerCredential.credentialStatus
            );
          } else {
            const rolePayload =
              await this.claimIssuerVerification.verifyIssuance(
                issuer,
                issuers?.roleName,
                roleCredentialCache
              );
            issuer = rolePayload?.iss as string;
            role = issuers.roleName;
            credentialStatus = rolePayload?.credentialStatus;
            if (rolePayload?.exp && rolePayload?.exp * 1000 < Date.now()) {
              return verificationResult(false, ERRORS.IssuerCredentialExpired);
            }
            await this._statusListEntryVerificaiton.verifyCredentialStatus(
              rolePayload?.credentialStatus as StatusList2021Entry
            );
          }
        } catch (error) {
          const credential =
            await this._statusListEntryVerificaiton.fetchStatusListCredential(
              credentialStatus?.statusListCredential as string
            );
          await this.verifyRevoker(
            credential?.issuer as string,
            role,
            roleCredentialCache,
            roleDefCache,
            didDocumentCache
          );
          return verificationResult(false, ERRORS.IssuerCredentialRevoked);
        }
      }
    }
  }
}
