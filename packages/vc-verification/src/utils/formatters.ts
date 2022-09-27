import { isValidErc1056, getDIDChain, Chain } from '@ew-did-registry/did';
import { RoleEIP191JWT, RolePayload } from '../models';
import { CID } from 'multiformats/cid';
import { chainIdToChainName } from '@energyweb/credential-governance';
import type { RoleCredentialSubject } from '@energyweb/credential-governance';
import type { VerifiableCredential } from '@ew-did-registry/credentials-interface';
import { utils } from 'ethers';
import { hasIn } from 'lodash';

const didFormatFields = ['iss', 'sub', 'subject', 'did', 'signer'];
const { isHexString } = utils;

/**
 * Upgrades the DID fields of a RolePayload with the chain identifier
 * @param RoleEIP191JWT claim to upgrade
 * @returns RoleEIP191JWT with did fields upgraded with chain id. undefined if upgrade not possible
 */
export function upgradeChainId(roleJwt: RoleEIP191JWT) {
  let invalidDIDProperty = false;
  let key: keyof RolePayload;
  for (key in roleJwt.payload) {
    if (didFormatFields.includes(key)) {
      const expectedEthrDID = roleJwt.payload[key] as string;
      if (isValidErc1056(expectedEthrDID)) {
        roleJwt.payload[key] = upgradeDidWithChainId(expectedEthrDID);
      } else {
        invalidDIDProperty = true;
      }
    }
  }
  return invalidDIDProperty ? undefined : roleJwt;
}

/**
 * Adds chain ID to DID
 * @param {string} did
 * @returns {string} DID address in format "did:" method-name ":" method-specific-id ":" address
 */
function upgradeDidWithChainId(did: string): string {
  const { foundChainInfo } = getDIDChain(did);
  if (foundChainInfo) return did;

  const didParts = did.split(':');

  const chainName = Chain.VOLTA;
  return `${didParts[0]}:${didParts[1]}:${chainName}:${didParts[2]}`;
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
export function isEIP191Jwt(claim: unknown): claim is RoleEIP191JWT {
  return (
    hasIn(claim, 'eip191Jwt') && hasIn(claim, 'payload.claimData.claimType')
  );
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

/**
 * Check if given value is a valid IPFS CID.
 *
 * ```typescript
 * isCID('Qm...');
 * ```
 *
 * @param {Any} hash value to check
 *
 */
export function isCID(hash: unknown): boolean {
  try {
    if (typeof hash === 'string') {
      return Boolean(CID.parse(hash));
    }

    if (hash instanceof Uint8Array) {
      return Boolean(CID.decode(hash));
    }

    return Boolean(CID.asCID(hash));
  } catch (e) {
    return false;
  }
}
