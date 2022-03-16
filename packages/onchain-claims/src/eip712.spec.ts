import { Wallet, utils } from 'ethers';
import { Methods, Chain } from '@ew-did-registry/did';
import { addressOf } from '@ew-did-registry/did-ethr-resolver';
import {
  recoverOnChainProofSigner,
  typedClaimRequestHash,
  typedApprovalHash,
} from './eip712';
import { canonizeSig } from './utils';
import { expect } from 'chai';
import { recoverAgreementSigner } from '.';

const { arrayify } = utils;

export function eip712test(): void {
  describe('EIP712 tests', () => {
    const role = 'test.roles.iam.ewc';
    const version = 1;
    const expiry = Number.MAX_SAFE_INTEGER - 1;
    const subject = Wallet.createRandom();
    const subjectDID = `did:${Methods.Erc1056}:${Chain.VOLTA}:${subject.address}`;
    const issuer = Wallet.createRandom();
    const issuerDID = `did:${Methods.Erc1056}:${Chain.VOLTA}:${issuer.address}`;
    const chainId = 73799;
    const claimManager = Wallet.createRandom().address;
    let proof: string;
    let approval: string;

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
      proof = canonizeSig(await issuer.signMessage(arrayify(proofHash)));

      const approvalHash = typedApprovalHash(
        {
          claimManager,
          expiry,
          issuer: issuerDID,
          subject: subjectDID,
          role,
          version,
        },
        chainId
      );
      approval = canonizeSig(await subject.signMessage(arrayify(approvalHash)));
    });

    it('issuer can be recovered', () => {
      expect(
        recoverOnChainProofSigner(
          proof,
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
      ).equal(addressOf(issuerDID));
    });

    it('subject can be recovered', () => {
      const request = {
        subject: subjectDID,
        role,
        version,
        claimManager,
      };

      expect(recoverAgreementSigner(approval, request, chainId)).equal(
        addressOf(request.subject)
      );
    });
  });
}
