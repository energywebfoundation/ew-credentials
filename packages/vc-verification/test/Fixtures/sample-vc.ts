export const adminVC = {
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  id: 'urn:uuid:db72c30a-404c-4104-b787-a4c244035c61',
  type: ['VerifiableCredential', 'EWFRole'],
  credentialSubject: {
    id: 'did:ethr:0x0539:0x0d1d4e623d10f9fba5db95830f7d3839406c6af2',
    role: { namespace: 'admin', version: '1' },
    issuerFields: [],
  },
  issuer: 'did:ethr:0x0539:0x0d1d4e623d10f9fba5db95830f7d3839406c6af2',
  issuanceDate: '2022-05-26T12:23:43.729Z',
  proof: {
    '@context': 'https://w3id.org/security/suites/eip712sig-2021/v1',
    type: 'EthereumEip712Signature2021',
    proofPurpose: 'assertionMethod',
    proofValue:
      '0xf6ae70b86249dbfeba1926abd1730815fb512090201c6920b18ee3fa784a68be09598b8f1dcb1671ad28d4f3fdb025bbd053a6ace975c88e993581b6f86bf1f31b',
    verificationMethod:
      'did:ethr:0x0539:0x0d1d4e623d10f9fba5db95830f7d3839406c6af2#controller',
    created: '2022-05-26T12:23:43.736Z',
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
        VerifiableCredential: [
          { name: '@context', type: 'string[]' },
          { name: 'id', type: 'string' },
          { name: 'type', type: 'string[]' },
          { name: 'issuer', type: 'string' },
          { name: 'issuanceDate', type: 'string' },
          { name: 'credentialSubject', type: 'CredentialSubject' },
          { name: 'proof', type: 'Proof' },
        ],
      },
      primaryType: 'VerifiableCredential',
    },
  },
};

export const managerVC = {
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  id: 'urn:uuid:77b7dbbb-bd1a-42cb-8766-2e19ada15c5c',
  type: ['VerifiableCredential', 'EWFRole'],
  credentialSubject: {
    id: 'did:ethr:0x0539:0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5',
    role: { namespace: 'manager', version: '1' },
    issuerFields: [],
  },
  issuer: 'did:ethr:0x0539:0x0d1d4e623d10f9fba5db95830f7d3839406c6af2',
  issuanceDate: '2022-05-30T05:46:50.560Z',
  proof: {
    '@context': 'https://w3id.org/security/suites/eip712sig-2021/v1',
    type: 'EthereumEip712Signature2021',
    proofPurpose: 'assertionMethod',
    proofValue:
      '0x2795f51f66c63384090d5221ac29576ad36c4c32545c2187d01293fe59f529994393c28143b0eec87951af7a4852fad1c715724e046d74d86c421139dc4c5b401b',
    verificationMethod:
      'did:ethr:0x0539:0x0d1d4e623d10f9fba5db95830f7d3839406c6af2#controller',
    created: '2022-05-30T05:46:50.563Z',
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
        VerifiableCredential: [
          { name: '@context', type: 'string[]' },
          { name: 'id', type: 'string' },
          { name: 'type', type: 'string[]' },
          { name: 'issuer', type: 'string' },
          { name: 'issuanceDate', type: 'string' },
          { name: 'credentialSubject', type: 'CredentialSubject' },
          { name: 'proof', type: 'Proof' },
        ],
      },
      primaryType: 'VerifiableCredential',
    },
  },
};

export const userVC = {
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  id: 'urn:uuid:77324448-2c48-4611-a402-884febc82a57',
  type: ['VerifiableCredential', 'EWFRole'],
  credentialSubject: {
    id: 'did:ethr:0x0539:0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef',
    role: { namespace: 'user', version: '1' },
    issuerFields: [],
  },
  issuer: 'did:ethr:0x0539:0x0d1d4e623d10f9fba5db95830f7d3839406c6af2',
  issuanceDate: '2022-05-30T06:08:42.118Z',
  proof: {
    '@context': 'https://w3id.org/security/suites/eip712sig-2021/v1',
    type: 'EthereumEip712Signature2021',
    proofPurpose: 'assertionMethod',
    proofValue:
      '0x97028734b398fcab55258635f263da98610a405eccb90041cdae70289e8a710c3c9acde4ed7373aa3d8b267363e61bf2967d6a7b37df25dd5160e4ee09f38d601b',
    verificationMethod:
      'did:ethr:0x0539:0x0d1d4e623d10f9fba5db95830f7d3839406c6af2#controller',
    created: '2022-05-30T06:08:42.121Z',
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
        VerifiableCredential: [
          { name: '@context', type: 'string[]' },
          { name: 'id', type: 'string' },
          { name: 'type', type: 'string[]' },
          { name: 'issuer', type: 'string' },
          { name: 'issuanceDate', type: 'string' },
          { name: 'credentialSubject', type: 'CredentialSubject' },
          { name: 'proof', type: 'Proof' },
        ],
      },
      primaryType: 'VerifiableCredential',
    },
  },
};
