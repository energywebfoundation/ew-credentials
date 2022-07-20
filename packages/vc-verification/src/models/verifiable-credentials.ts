import { chainIdToChainName } from '@energyweb/credential-governance';
import type { RoleCredentialSubject } from '@energyweb/credential-governance';
import type {
  VerifiableCredential,
  StatusList2021Entry,
} from '@ew-did-registry/credentials-interface';
import { utils } from 'ethers';
import * as jwt from 'jsonwebtoken/index';

const { isHexString } = utils;

export interface VerificationResult {
  status: boolean;
  error: string;
}

export const verificationResult = function (
  status: boolean,
  error: string
): VerificationResult {
  return { status, error };
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

/**
 * Maps verifiable credential issuer to his DID
 * @param issuer issuer of verifiable credential
 * @returns DID of issuer
 */
export const issuerDID = (
  issuer: VerifiableCredential<RoleCredentialSubject>['issuer']
) => {
  const issuerId = typeof issuer === 'string' ? issuer : issuer.id;
  const chain = issuerId.split(':')[2];
  if (!isHexString(chain)) {
    return issuerId;
  }
  return issuerId.replace(
    chain,
    chainIdToChainName(Number.parseInt(chain, 16))
  );
};
