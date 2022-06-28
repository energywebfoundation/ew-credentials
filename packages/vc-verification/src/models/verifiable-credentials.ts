import { chainIdToChainName } from '@energyweb/credential-governance';
import type { RoleCredentialSubject } from '@energyweb/credential-governance';
import type { VerifiableCredential } from '@ew-did-registry/credentials-interface';
import { utils } from 'ethers';

const { isHexString } = utils;

export interface VerificationResult {
  status: boolean;
}

export interface OffChainClaim {
  claimType: string;
  claimTypeVersion: number;
  issuedToken: string;
  iss: string;
  [x: string]: string | number;
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
