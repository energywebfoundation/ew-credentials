import type { RoleCredentialSubject } from '@energyweb/credential-governance';
import {
  CredentialStatusPurpose,
  StatusListEntryType,
  VerifiableCredential,
} from '@ew-did-registry/credentials-interface';
import { CredentialType } from '@ew-did-registry/credentials-interface';

export const adminVC: VerifiableCredential<RoleCredentialSubject> = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/vc/status-list/2021/v1',
  ],
  id: 'urn:uuid:e463c294-17bd-42d1-817a-0248bfa149f3',
  type: [CredentialType.VerifiableCredential, CredentialType.EWFRole],
  credentialSubject: {
    id: 'did:ethr:0x0539:0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2',
    issuerFields: [],
    role: { namespace: 'admin', version: '1' },
  },
  issuer: 'did:ethr:0x539:0x0d1d4e623d10f9fba5db95830f7d3839406c6af2',
  issuanceDate: '2022-06-24T11:28:28.103Z',
  proof: {
    '@context': 'https://w3id.org/security/suites/eip712sig-2021/v1',
    type: 'EthereumEip712Signature2021',
    proofPurpose: 'assertionMethod',
    proofValue:
      '0xd4274533512a8715247fcfd854458bf427bcfb285672383730225b811c9428db015b8e98f46eb40c53e798c0914333ae1aa3b947ae60e6e60cc09bcb469f22e31c',
    verificationMethod:
      'did:ethr:0x539:0x0d1d4e623d10f9fba5db95830f7d3839406c6af2#controller',
    created: '2022-06-24T11:28:28.105Z',
    eip712Domain: {
      domain: {},
      messageSchema: {
        CredentialSubject: [
          { name: 'id', type: 'string' },
          { name: 'role', type: 'EWFRole' },
          { name: 'issuerFields', type: 'IssuerFields[]' },
        ],
        EIP712Domain: [],
        EWFRole: [
          { name: 'namespace', type: 'string' },
          { name: 'version', type: 'string' },
        ],
        IssuerFields: [
          { name: 'key', type: 'string' },
          { name: 'value', type: 'string' },
        ],
        Proof: [
          { name: '@context', type: 'string' },
          { name: 'verificationMethod', type: 'string' },
          { name: 'created', type: 'string' },
          { name: 'proofPurpose', type: 'string' },
          { name: 'type', type: 'string' },
        ],
        StatusList2021Entry: [
          { name: 'id', type: 'string' },
          { name: 'type', type: 'string' },
          { name: 'statusPurpose', type: 'string' },
          { name: 'statusListIndex', type: 'string' },
          { name: 'statusListCredential', type: 'string' },
        ],
        VerifiableCredential: [
          { name: '@context', type: 'string[]' },
          { name: 'id', type: 'string' },
          { name: 'type', type: 'string[]' },
          { name: 'issuer', type: 'string' },
          { name: 'issuanceDate', type: 'string' },
          { name: 'credentialSubject', type: 'CredentialSubject' },
          { name: 'proof', type: 'Proof' },
          { name: 'credentialStatus', type: 'StatusList2021Entry' },
        ],
      },
      primaryType: 'VerifiableCredential',
    },
  },
  credentialStatus: {
    id: 'https://credential-status/admin',
    type: StatusListEntryType.Entry2021,
    statusPurpose: CredentialStatusPurpose.REVOCATION,
    statusListCredential:
      'https://isc.energyweb.org/api/v1/status-list/700e7ad4-5309-421c-bcf9-43acfa89c0e4',
    statusListIndex: '0',
  },
};

export const managerVC: VerifiableCredential<RoleCredentialSubject> = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/vc/status-list/2021/v1',
  ],
  id: 'urn:uuid:3d1142c8-9320-4b41-8ee4-f13fe8ddb329',
  type: [CredentialType.VerifiableCredential, CredentialType.EWFRole],
  credentialSubject: {
    id: 'did:ethr:0x0539:0x0F4F2Ac550A1b4e2280d04c21cEa7EBD822934b5',
    role: { namespace: 'manager', version: '1' },
    issuerFields: [],
  },
  issuer: 'did:ethr:0x539:0x0d1d4e623d10f9fba5db95830f7d3839406c6af2',
  issuanceDate: '2022-06-24T11:28:28.270Z',
  proof: {
    '@context': 'https://w3id.org/security/suites/eip712sig-2021/v1',
    type: 'EthereumEip712Signature2021',
    proofPurpose: 'assertionMethod',
    proofValue:
      '0x07ed96c9abed4d9619ffe7df2eb59addb4217b10cad83fd068ce7172086c7bd96c565ed054af311a076de20f99711a788053690557bbbf12bdb9d521100a58f81c',
    verificationMethod:
      'did:ethr:0x539:0x0d1d4e623d10f9fba5db95830f7d3839406c6af2#controller',
    created: '2022-06-24T11:28:28.270Z',
    eip712Domain: {
      domain: {},
      messageSchema: {
        CredentialSubject: [
          { name: 'id', type: 'string' },
          { name: 'role', type: 'EWFRole' },
          { name: 'issuerFields', type: 'IssuerFields[]' },
        ],
        EIP712Domain: [],
        EWFRole: [
          { name: 'namespace', type: 'string' },
          { name: 'version', type: 'string' },
        ],
        IssuerFields: [
          { name: 'key', type: 'string' },
          { name: 'value', type: 'string' },
        ],
        Proof: [
          { name: '@context', type: 'string' },
          { name: 'verificationMethod', type: 'string' },
          { name: 'created', type: 'string' },
          { name: 'proofPurpose', type: 'string' },
          { name: 'type', type: 'string' },
        ],
        StatusList2021Entry: [
          { name: 'id', type: 'string' },
          { name: 'type', type: 'string' },
          { name: 'statusPurpose', type: 'string' },
          { name: 'statusListIndex', type: 'string' },
          { name: 'statusListCredential', type: 'string' },
        ],
        VerifiableCredential: [
          { name: '@context', type: 'string[]' },
          { name: 'id', type: 'string' },
          { name: 'type', type: 'string[]' },
          { name: 'issuer', type: 'string' },
          { name: 'issuanceDate', type: 'string' },
          { name: 'credentialSubject', type: 'CredentialSubject' },
          { name: 'proof', type: 'Proof' },
          { name: 'credentialStatus', type: 'StatusList2021Entry' },
        ],
      },
      primaryType: 'VerifiableCredential',
    },
  },
  credentialStatus: {
    id: 'https://credential-status/manager',
    type: StatusListEntryType.Entry2021,
    statusListCredential:
      'https://isc.energyweb.org/api/v1/status-list/700e7ad4-5309-421c-bcf9-43acfa89c0e4',
    statusListIndex: '0',
    statusPurpose: CredentialStatusPurpose.REVOCATION,
  },
};

export const userVC: VerifiableCredential<RoleCredentialSubject> = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/vc/status-list/2021/v1',
  ],
  id: 'urn:uuid:418d0a2e-ffc7-4a71-af85-772f3690570e',
  type: [CredentialType.VerifiableCredential, CredentialType.EWFRole],
  credentialSubject: {
    id: 'did:ethr:0x0539:0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
    issuerFields: [],
    role: { namespace: 'user', version: '1' },
  },
  issuer: 'did:ethr:0x539:0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5',
  issuanceDate: '2022-06-24T11:28:29.833Z',
  proof: {
    '@context': 'https://w3id.org/security/suites/eip712sig-2021/v1',
    type: 'EthereumEip712Signature2021',
    proofPurpose: 'assertionMethod',
    proofValue:
      '0x1a08ee890c1f7a4bca99ff3cfcc7451eed50f4d7433e240610d2882214dd20392088c7975609a4b41278f1ae4cd76480fd587318fde045531997f47829dbe5be1c',
    verificationMethod:
      'did:ethr:0x539:0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5#controller',
    created: '2022-06-24T11:28:29.834Z',
    eip712Domain: {
      domain: {},
      messageSchema: {
        CredentialSubject: [
          { name: 'id', type: 'string' },
          { name: 'role', type: 'EWFRole' },
          { name: 'issuerFields', type: 'IssuerFields[]' },
        ],
        EIP712Domain: [],
        EWFRole: [
          { name: 'namespace', type: 'string' },
          { name: 'version', type: 'string' },
        ],
        IssuerFields: [
          { name: 'key', type: 'string' },
          { name: 'value', type: 'string' },
        ],
        Proof: [
          { name: '@context', type: 'string' },
          { name: 'verificationMethod', type: 'string' },
          { name: 'created', type: 'string' },
          { name: 'proofPurpose', type: 'string' },
          { name: 'type', type: 'string' },
        ],
        StatusList2021Entry: [
          { name: 'id', type: 'string' },
          { name: 'type', type: 'string' },
          { name: 'statusPurpose', type: 'string' },
          { name: 'statusListIndex', type: 'string' },
          { name: 'statusListCredential', type: 'string' },
        ],
        VerifiableCredential: [
          { name: '@context', type: 'string[]' },
          { name: 'id', type: 'string' },
          { name: 'type', type: 'string[]' },
          { name: 'issuer', type: 'string' },
          { name: 'issuanceDate', type: 'string' },
          { name: 'credentialSubject', type: 'CredentialSubject' },
          { name: 'proof', type: 'Proof' },
          { name: 'credentialStatus', type: 'StatusList2021Entry' },
        ],
      },
      primaryType: 'VerifiableCredential',
    },
  },
  credentialStatus: {
    id: 'https://credential-status/user',
    type: StatusListEntryType.Entry2021,
    statusListIndex: '0',
    statusPurpose: CredentialStatusPurpose.REVOCATION,
    statusListCredential:
      'https://isc.energyweb.org/api/v1/status-list/700e7ad4-5309-421c-bcf9-43acfa89c0e4',
  },
};
