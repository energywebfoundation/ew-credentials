import {
  StatusList2021Credential,
  validateStatusList,
} from '@ew-did-registry/credentials-interface';
import { RevokerResolver } from './revoker-resolver';
import {
  VCIssuerVerification,
  ClaimIssuerVerification,
  CredentialResolver,
} from '.';
import { InvalidRevokerType, NoRevokers, RevokerNotAuthorized } from './errors';
import { issuerDID } from './models';
import { addressOf } from '@ew-did-registry/did-ethr-resolver';

/**
 * Provides verification of revocation of EnergyWeb role verifiable credential
 */
export class RevocationVerification {
  private credentialResolver: CredentialResolver;
  private vcIssuerVerification: VCIssuerVerification;
  private claimIssuerVerification: ClaimIssuerVerification;

  constructor(
    private revokerResolver: RevokerResolver,
    credentialResolver: CredentialResolver,
    vcIssuerVerification: VCIssuerVerification,
    claimIssuerVerification: ClaimIssuerVerification
  ) {
    this.credentialResolver = credentialResolver;
    this.vcIssuerVerification = vcIssuerVerification;
    this.claimIssuerVerification = claimIssuerVerification;
  }

  /**
   * Verifies that status list is issued by revoker specified in role definition
   * Revoker authorization must be verified by verifiable credential
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
   * @param revoker DID of revoker
   * @param role name of the role verifiable credential
   */
  private async verifyRevoker(revoker: string, role: string) {
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
        if (revokerCredential?.issuer) {
          await this.vcIssuerVerification.verifyIssuance(revoker, revokerRole);
          await this.vcIssuerVerification.verifyIssuer(
            issuerDID(revokerCredential.issuer as string),
            revokerRole
          );
        } else {
          await this.claimIssuerVerification.verifyIssuance(
            revoker,
            revokerRole
          );
          await this.claimIssuerVerification.verifyIssuer(
            revokerCredential?.iss as string,
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
}
