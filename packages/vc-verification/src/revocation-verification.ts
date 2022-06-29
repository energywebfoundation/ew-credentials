import {
  StatusList2021Credential,
  validateStatusList,
} from '@ew-did-registry/credentials-interface';
import { CredentialResolver } from './credential-resolver';
import { IssuerResolver } from './issuer-resolver';
import { RevokerResolver } from './revoker-resolver';
import { VCIssuerVerification } from './issuer-verification-vc';
import { InvalidRevokerType, NoRevokers, RevokerNotAuthorized } from './errors';
import { issuerDID } from './models';

/**
 * Provides verification of revocation of EnergyWeb role verifiable credential
 */
export class RevocationVerification {
  private issuerVerification: VCIssuerVerification;

  constructor(
    private revokerResolver: RevokerResolver,
    issuerResolver: IssuerResolver,
    credentialResolver: CredentialResolver
  ) {
    this.issuerVerification = new VCIssuerVerification(
      issuerResolver,
      credentialResolver
    );
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
   * Verifies that revoker is authorized to revoke role credential
   * @param revoker DID of revoker
   * @param role role name
   */
  private async verifyRevoker(revoker: string, role: string) {
    const revokers = await this.revokerResolver.getRevokerDefinition(role);
    if (!revokers) {
      throw new NoRevokers(role);
    }
    if (revokers.revokerType === 'DID' && revokers.did) {
      if (
        !revokers.did.some((r) => r.toUpperCase() === revoker.toUpperCase())
      ) {
        throw new RevokerNotAuthorized(
          revoker,
          role,
          'revoker is not in DID list'
        );
      }
    } else if (revokers.roleName) {
      try {
        await this.issuerVerification.verifyCredential(
          revoker,
          revokers.roleName
        );
      } catch (e) {
        throw new RevokerNotAuthorized(revoker, role, (<Error>e).message);
      }
    } else {
      throw new InvalidRevokerType(role, revokers?.revokerType);
    }
  }
}
