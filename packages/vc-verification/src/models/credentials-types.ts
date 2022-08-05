import { chainIdToChainName } from '@energyweb/credential-governance';
import type { RoleCredentialSubject } from '@energyweb/credential-governance';
import type {
  VerifiableCredential,
  StatusList2021Entry,
} from '@ew-did-registry/credentials-interface';
import { utils } from 'ethers';
import * as jwt from 'jsonwebtoken/index';
import { upgradeChainId } from '../upgrade-chainid';

const { isHexString } = utils;

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

/**
 * Upgrades the DID fields of a RolePayload with the chain identifier
 * @param roleJwt claim
 * @returns
 */
export const transformClaim = (
  roleJwt: RoleEIP191JWT
): RoleEIP191JWT | undefined => {
  const transformedClaim: RoleEIP191JWT = { ...roleJwt };
  return upgradeChainId(transformedClaim);
};

/**
 * Filters valid RoleEIP191Jwt
 * @param claim credentials
 * @returns
 */
export const filterOutMaliciousClaims = (
  claim: RoleEIP191JWT | undefined
): claim is RoleEIP191JWT => {
  return !!claim;
};

/**
 * Check if a claim is EIP191Jwt or not
 * @param claim claim to validated
 * @returns
 */
export function isEIP191Jwt(claim: RoleEIP191JWT | unknown): claim is RoleEIP191JWT {
  if (!claim) return false;
  if (typeof claim !== 'object') return false;
  const eip191JwtProps = ['payload', 'eip191Jwt'];
  const claimProps = Object.keys(claim);
  return eip191JwtProps.every((p) => claimProps.includes(p));
}

/**
 * Validates if a credential is valid Verifiable Credential
 * @param vc
 * @returns
 */
export function isVerifiableCredential(
  vc: VerifiableCredential<RoleCredentialSubject> | unknown
): vc is VerifiableCredential<RoleCredentialSubject> {
  if (!vc) return false;
  if (typeof vc !== 'object') return false;
  const credentialProps = [
    '@context',
    'id',
    'type',
    'issuer',
    'issuanceDate',
    'credentialSubject',
    'proof',
  ];
  const credProps = Object.keys(vc);
  return credentialProps.every((p) => credProps.includes(p));
}
