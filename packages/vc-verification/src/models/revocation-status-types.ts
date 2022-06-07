import { Proof } from './verifiable-credentials';
export interface StatusListCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  credentialSubject: StatusCredentialSubject;
  proof: Proof;
}

export const StatusPurpose = {
  revocation: 'revocation',
};

export interface StatusCredentialSubject {
  id: string;
  type: string;
  statusPurpose: string;
  encodedList: string;
}
