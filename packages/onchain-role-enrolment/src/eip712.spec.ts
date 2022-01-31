import { Wallet, utils } from 'ethers';
import { Methods, Chain } from '@ew-did-registry/did';
import { addressOf } from '@ew-did-registry/did-ethr-resolver';
import { recoverOnChainProofSigner, typedClaimRequestHash } from './eip712';
import { canonizeSig } from './utils';

const { arrayify } = utils;

describe('EIP712 tests', () => {
  const role = 'test.roles.iam.ewc';
  const version = 1;
  const expiry = 47;
  const subject = Wallet.createRandom();
  const subjectDID = `did:${Methods.Erc1056}:${Chain.VOLTA}:${subject.address}`;
  const issuer = Wallet.createRandom();
  const issuerDID = `did:${Methods.Erc1056}:${Chain.VOLTA}:${issuer.address}`;
  const chainId = 1;
  const claimManager = Wallet.createRandom().address;
  let onChainProof: string;

  beforeEach(async () => {
    const proofHash = typedClaimRequestHash(
      {
        role,
        version,
        expiry,
        subject: subjectDID,
        issuer: issuerDID,
        claimManager,
      },
      chainId
    );
    onChainProof = canonizeSig(await issuer.signMessage(arrayify(proofHash)));
  });

  test('onchain issuer can be recovered', () => {
    expect(
      recoverOnChainProofSigner(
        onChainProof,
        {
          role,
          version,
          expiry,
          subject: subjectDID,
          issuer: issuerDID,
          claimManager,
        },
        chainId
      )
    ).toEqual(addressOf(issuerDID));
  });
});
