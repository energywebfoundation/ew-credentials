import { isValidErc1056, getDIDChain } from '@ew-did-registry/did';
import { OffChainClaim } from './models';

const didFormatFields = ['iss', 'sub', 'subject', 'did', 'signer'];

/**
 * Upgrades the DID fields of an offchain claim with the chain identifier
 * @param offChainClaim claim to upgrade
 * @returns offChainClaim with did fields upgraded with chain id. undefined if upgrade not possible
 */
export function upgradeChainId(offChainClaim: OffChainClaim) {
  let invalidDIDProperty = false;
  let key: keyof OffChainClaim;
  for (key in offChainClaim) {
    if (didFormatFields.includes(key)) {
      const expectedEthrDID = offChainClaim[key] as string;
      if (isValidErc1056(expectedEthrDID)) {
        offChainClaim[key] = upgradeDidWithChainId(expectedEthrDID);
      } else {
        invalidDIDProperty = true;
      }
    }
  }
  return invalidDIDProperty ? undefined : offChainClaim;
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
