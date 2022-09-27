import { IRoleDefinitionV2 } from '@energyweb/credential-governance';
import { IDIDDocument } from '@ew-did-registry/did-resolver-interface';
import {
  CredentialStatusPurpose,
  StatusListEntryType,
} from '@ew-did-registry/credentials-interface';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  RoleCredentialCache,
  RoleDefinitionCache,
  DIDDocumentCache,
  RoleEIP191JWT,
} from '../src';
import { adminVC } from './Fixtures/sample-vc';
chai.use(chaiAsPromised);
const expect = chai.expect;

let roleDefCache: RoleDefinitionCache;
let roleCredentialCache: RoleCredentialCache;
let didDocumentCache: DIDDocumentCache;

const sampleDID = 'did:ethr:volta:0x3784bfdfhjh28y48w9219283';
const adminRole = 'adminRole';

const sampleClaim: RoleEIP191JWT = {
  payload: {
    claimData: { claimType: adminRole, claimTypeVersion: 1 },
    iss: sampleDID,
    credentialStatus: {
      id: 'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
      type: StatusListEntryType.Entry2021,
      statusPurpose: CredentialStatusPurpose.REVOCATION,
      statusListIndex: '0',
      statusListCredential:
        'https://identitycache-dev.energyweb.org/v1/status-list/urn:uuid:4fb4e120-a566-499c-85fb-47bb5abd3d6b',
    },
    signer: sampleDID,
  },
  eip191Jwt: 'sjhvdjhasdjhas.skjdhgjsdhf.sdjhfvsdjhfvsd',
};

const sampleRoleDef: IRoleDefinitionV2 = {
  roleName: adminRole,
  enrolmentPreconditions: [],
  requestorFields: [],
  issuerFields: [],
  issuer: {
    issuerType: 'DID',
    did: [sampleDID],
  },
  revoker: {
    revokerType: 'DID',
    did: [sampleDID],
  },
  metadata: [],
  roleType: '',
  version: 1,
};

const sampleDIDDocument: IDIDDocument = {
  '@context': 'string',
  id: 'string',
  publicKey: [],
  authentication: [],
  service: [],
  created: 'string',
};

export function cacheTests(): void {
  describe('Tests for cahced data', () => {
    beforeEach(async () => {
      roleDefCache = new RoleDefinitionCache();
      roleCredentialCache = new RoleCredentialCache();
      didDocumentCache = new DIDDocumentCache();
    });

    describe('Role credential can be cached', () => {
      it('Should be possible to cache an EIP191Jwt claim', async () => {
        roleCredentialCache.setRoleCredential(
          sampleDID,
          adminRole,
          sampleClaim
        );
        expect(
          roleCredentialCache.getRoleCredential(sampleDID, adminRole)
        ).to.equal(sampleClaim);
      });

      it('Should be possible to cache an EIP191Jwt claim and fetch multiple times', async () => {
        roleCredentialCache.setRoleCredential(
          sampleDID,
          adminRole,
          sampleClaim
        );
        expect(
          roleCredentialCache.getRoleCredential(sampleDID, adminRole)
        ).to.equal(sampleClaim);
        expect(
          roleCredentialCache.getRoleCredential(sampleDID, adminRole)
        ).to.equal(sampleClaim);
      });

      it('Should be possible to cache a VC', async () => {
        roleCredentialCache.setRoleCredential(sampleDID, adminRole, adminVC);
        expect(
          roleCredentialCache.getRoleCredential(sampleDID, adminRole)
        ).to.equal(adminVC);
      });

      it('Should be possible to cache a VC and fetch it multple times', async () => {
        roleCredentialCache.setRoleCredential(sampleDID, adminRole, adminVC);
        expect(
          roleCredentialCache.getRoleCredential(sampleDID, adminRole)
        ).to.equal(adminVC);
        expect(
          roleCredentialCache.getRoleCredential(sampleDID, adminRole)
        ).to.equal(adminVC);
      });
    });

    describe('RoleDefinition can be cached', () => {
      it('Should be possible to cache a RoleDefintion', async () => {
        roleDefCache.setRoleDefinition(adminRole, sampleRoleDef);
        expect(roleDefCache.getRoleDefinition(adminRole)).to.equal(
          sampleRoleDef
        );
      });

      it('Should be possible to cache a RoleDefintion and fetch multiple times', async () => {
        roleDefCache.setRoleDefinition(adminRole, sampleRoleDef);
        expect(roleDefCache.getRoleDefinition(adminRole)).to.equal(
          sampleRoleDef
        );
        expect(roleDefCache.getRoleDefinition(adminRole)).to.equal(
          sampleRoleDef
        );
      });
    });

    describe('DIDDocument can be cached', () => {
      it('Should be possible to cache a DIDDocument', async () => {
        didDocumentCache.setDIDDocument(sampleDID, sampleDIDDocument);
        expect(didDocumentCache.getDIDDocument(sampleDID)).to.equal(
          sampleDIDDocument
        );
      });

      it('Should be possible to cache a DIDDocument and fetch multiple times', async () => {
        didDocumentCache.setDIDDocument(sampleDID, sampleDIDDocument);
        expect(didDocumentCache.getDIDDocument(sampleDID)).to.equal(
          sampleDIDDocument
        );
        expect(didDocumentCache.getDIDDocument(sampleDID)).to.equal(
          sampleDIDDocument
        );
      });
    });
  });
}
