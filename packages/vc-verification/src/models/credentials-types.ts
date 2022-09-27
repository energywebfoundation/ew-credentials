import { IRoleDefinitionV2 } from '@energyweb/credential-governance';
import type { StatusList2021Entry } from '@ew-did-registry/credentials-interface';
import { JwtPayload } from 'jsonwebtoken';
import { IDIDDocument } from '@ew-did-registry/did-resolver-interface';
import { VerifiableCredential } from '@ew-did-registry/credentials-interface';
import type { RoleCredentialSubject } from '@energyweb/credential-governance';

export interface VerificationResult {
  verified: boolean;
  error: string;
}

export const verificationResult = function (
  verified: boolean,
  error: string
): VerificationResult {
  return { verified, error };
};

export interface ClaimData {
  requestorFields?: { key: string; value: string | number }[];
  claimType: string;
  claimTypeVersion: number;
}

export interface RolePayload extends JwtPayload {
  credentialStatus?: StatusList2021Entry;
  claimData: ClaimData;
  signer: string;
}

export interface RoleEIP191JWT {
  payload: RolePayload;
  eip191Jwt: string;
}
