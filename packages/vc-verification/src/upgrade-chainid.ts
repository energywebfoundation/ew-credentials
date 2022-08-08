import { isValidErc1056, getDIDChain } from '@ew-did-registry/did';
import { RoleEIP191JWT, RolePayload } from './models';

const didFormatFields = ['iss', 'sub', 'subject', 'did', 'signer'];

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
 * @param {string} did
 * @returns {string} DID address in format "did:" method-name ":" method-specific-id ":" address
 */
function upgradeDidWithChainId(did: string): string {
  const { foundChainInfo } = getDIDChain(did);
  if (foundChainInfo) return did;

  const didParts = did.split(':');

  const chainName = 'volta';
  return `${didParts[0]}:${didParts[1]}:${chainName}:${didParts[2]}`;
}
