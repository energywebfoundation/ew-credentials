// import { Wallet, utils } from 'ethers';
// import { Methods, Chain } from '@ew-did-registry/did';
import { addressOf } from '@ew-did-registry/did-ethr-resolver';
import {
  recoverOnChainProofSigner /* typedClaimRequestHash */,
} from './eip712';
// import { canonizeSig } from './utils';
import { recoverAgreementSigner } from '.';

// const { arrayify } = utils;

describe('EIP712 tests', () => {
  const version = 1;
  // const expiry = 47;
  const expiry = Number.MAX_SAFE_INTEGER - 1;
  // const subject = Wallet.createRandom();
  // const subjectDID = `did:${Methods.Erc1056}:${Chain.VOLTA}:${subject.address}`;
  const subject = 'did:ethr:volta:0x96C0c6A7b40faA2BF13069B0857498e664AfC6aB';
  // const issuer = Wallet.createRandom();
  // const issuerDID = `did:${Methods.Erc1056}:${Chain.VOLTA}:${issuer.address}`;
  const issuer = 'did:ethr:volta:0xe59edc3DDB9B2b9D4625dB60a9B7568C194B817b';
  const chainId = 73799;
  // const claimManager = Wallet.createRandom().address;
  const claimManager = '0xC3dD7ED75779b33F5Cfb709E0aB02b71fbFA3210';
  // let onChainProof: string;
  const role = 'email.roles.eea.apps.florin.engietestvolta.iam.ewc';
  const agreement =
    '0xbabcaf04aa55a59a57f1ff7166b591490177ac9ff748bbe1e2620df1793964c10aabb6a8919ecd8bc2b2b5b776519348a8844dc4c3f88a8cfd64e1cc07f283fd1c';
  const proof =
    '0x09f22de921fe915786ae2b751e14534e3288dc459890e2179d17dde02b96740313bf4886e09f4fe7ecdf06d695465be49173d8b60a301a64eb084189f20127fd1b';

  beforeEach(async () => {
    // const proofHash = typedClaimRequestHash(
    //   {
    //     role,
    //     version,
    //     expiry,
    //     subject: subjectDID,
    //     issuer: issuerDID,
    //     claimManager,
    //   },
    //   chainId
    // );
    // onChainProof = canonizeSig(await issuer.signMessage(arrayify(proofHash)));
  });

  test('onchain issuer can be recovered', () => {
    expect(
      recoverOnChainProofSigner(
        proof,
        {
          role,
          version,
          expiry,
          subject,
          issuer,
          claimManager,
        },
        chainId
      )
    ).toEqual(addressOf(issuer));
  });

  test('subject can be verified', () => {
    const request = {
      subject,
      role,
      version: 1,
      claimManager,
    };
    expect(recoverAgreementSigner(agreement, request, chainId)).toEqual(
      addressOf(request.subject)
    );
  });
});
