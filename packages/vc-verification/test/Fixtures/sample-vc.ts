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
