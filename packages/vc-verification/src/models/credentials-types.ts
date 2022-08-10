import type { StatusList2021Entry } from '@ew-did-registry/credentials-interface';
import * as jwt from 'jsonwebtoken/index';

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
  fields: {
    [key: string]: string | number;
  };
  claimType: string;
  claimTypeVersion: number;
}

export interface RolePayload extends jwt.JwtPayload {
  credentialStatus?: StatusList2021Entry;
  claimData: ClaimData;
  signer: string;
}

export interface RoleEIP191JWT {
  payload: RolePayload;
  eip191Jwt: string;
}
