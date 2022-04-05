export interface IVerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string;
  issaunceDate: string;
  credentialSubject: CredentialSubject;
  proof: Proof;
}

export interface CredentialSubject {
  id: string;
  role: Role;
  issuerFields: IssuerFields[];
}

export interface Role {
  namespace: string;
  version: string;
}

export interface IssuerFields {
  key: string;
  value: string;
}

export interface Proof {
  '@context': string;
  verificationMethod: string;
  created: string;
  proofPurpose: string;
  type: string;
}

export interface VerificationResult {
  status: boolean;
}
