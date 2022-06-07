export const statusListCredentialAdmin = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/vc/status-list/2021/v1',
  ],
  id: 'urn:uuid:b40311fa-cf70-4fec-b268-52c3055b2a68',
  type: ['VerifiableCredential', 'StatusList2021Credential'],
  credentialSubject: {
    id: 'urn:uuid:b40311fa-cf70-4fec-b268-52c3055b2a68',
    type: 'StatusList2021',
    statusPurpose: 'revocation',
    encodedList: 'H4sIAAAAAAAAA2MEABvfBaUBAAAA',
  },
  issuer: 'did:ethr:0x0539:0x0d1d4e623d10f9fba5db95830f7d3839406c6af2',
  issuanceDate: '2022-05-30T14:32:24.069Z',
  proof: {
    '@context': 'https://w3id.org/security/suites/eip712sig-2021/v1',
    type: 'EthereumEip712Signature2021',
    proofPurpose: 'assertionMethod',
    proofValue:
      '0xf6ae70b86249dbfeba1926abd1730815fb512090201c6920b18ee3fa784a68be09598b8f1dcb1671ad28d4f3fdb025bbd053a6ace975c88e993581b6f86bf1f31b',
    verificationMethod:
      'did:ethr:0x0539:0x0d1d4e623d10f9fba5db95830f7d3839406c6af2#controller',
    created: '2022-05-30T10:00:17.196Z',
    eip712Domain: {
      domain: {},
      messageSchema: {
        CredentialSubject: [
          { name: 'id', type: 'string' },
          { name: 'type', type: 'string' },
          { name: 'statusPurpose', type: 'string' },
          { name: 'encodedList', type: 'string' },
        ],
        EIP712Domain: [],
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

export const statusListCredentialManager = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/vc/status-list/2021/v1',
  ],
  id: 'urn:uuid:b40311fa-cf70-4fec-b268-52c3055b2a68',
  type: ['VerifiableCredential', 'StatusList2021Credential'],
  credentialSubject: {
    id: 'urn:uuid:b40311fa-cf70-4fec-b268-52c3055b2a68',
    type: 'StatusList2021',
    statusPurpose: 'revocation',
    encodedList: 'H4sIAAAAAAAAA2MEABvfBaUBAAAA',
  },
  issuer: 'did:ethr:0x0539:0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5',
  issuanceDate: '2022-05-30T14:32:24.069Z',
  proof: {
    '@context': 'https://w3id.org/security/suites/eip712sig-2021/v1',
    type: 'EthereumEip712Signature2021',
    proofPurpose: 'assertionMethod',
    proofValue:
      '0xf6ae70b86249dbfeba1926abd1730815fb512090201c6920b18ee3fa784a68be09598b8f1dcb1671ad28d4f3fdb025bbd053a6ace975c88e993581b6f86bf1f31b',
    verificationMethod:
      'did:ethr:0x0539:0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5#controller',
    created: '2022-05-30T10:00:17.196Z',
    eip712Domain: {
      domain: {},
      messageSchema: {
        CredentialSubject: [
          { name: 'id', type: 'string' },
          { name: 'type', type: 'string' },
          { name: 'statusPurpose', type: 'string' },
          { name: 'encodedList', type: 'string' },
        ],
        EIP712Domain: [],
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

export const statusListCredentialInValid = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/vc/status-list/2021/v1',
  ],
  id: 'urn:uuid:b40311fa-cf70-4fec-b268-52c3055b2a68',
  type: ['VerifiableCredential', 'StatusList2021Credential'],
  credentialSubject: {
    id: 'urn:uuid:b40311fa-cf70-4fec-b268-52c3055b2a68',
    type: 'StatusList2021',
    statusPurpose: 'notRevocation',
    encodedList: 'H4sIAAAAAAAAA2MEABvfBaUBAAAA',
  },
  issuer: 'did:ethr:0x0539:0x0d1d4e623d10f9fba5db95830f7d3839406c6af2',
  issuanceDate: '2022-05-30T14:32:24.069Z',
  proof: {
    '@context': 'https://w3id.org/security/suites/eip712sig-2021/v1',
    type: 'EthereumEip712Signature2021',
    proofPurpose: 'assertionMethod',
    proofValue:
      '0xf6ae70b86249dbfeba1926abd1730815fb512090201c6920b18ee3fa784a68be09598b8f1dcb1671ad28d4f3fdb025bbd053a6ace975c88e993581b6f86bf1f31b',
    verificationMethod:
      'did:ethr:0x0539:0x0d1d4e623d10f9fba5db95830f7d3839406c6af2#controller',
    created: '2022-05-30T10:00:17.196Z',
    eip712Domain: {
      domain: {},
      messageSchema: {
        CredentialSubject: [
          { name: 'id', type: 'string' },
          { name: 'type', type: 'string' },
          { name: 'statusPurpose', type: 'string' },
          { name: 'encodedList', type: 'string' },
        ],
        EIP712Domain: [],
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
