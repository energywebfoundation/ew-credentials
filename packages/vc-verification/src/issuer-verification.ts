import jwt from 'jsonwebtoken';
import { utils } from 'ethers';
import { ProofVerifier } from '@ew-did-registry/claims';
import { EthereumDIDRegistry, EthereumDIDRegistry__factory } from '../ethers';
import { Resolver, EwSigner } from '@ew-did-registry/did-ethr-resolver';
import { RegistrySettings } from '@ew-did-registry/did-resolver-interface';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { IDidStore } from '@ew-did-registry/did-store-interface';
import { RoleDefinitionResolverV2__factory } from '@energyweb/credential-governance/ethers/factories/RoleDefinitionResolverV2__factory';
import { RoleDefinitionResolverV2 } from '@energyweb/credential-governance/ethers/RoleDefinitionResolverV2';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

export class IssuanceVerification {
  private _signer: JsonRpcSigner;
  private _ipfsStore: IDidStore;
  private _ipfsUrl: string;
  private _resolver: Resolver;
  private _registrySetting: RegistrySettings;
  private _didRegistry: EthereumDIDRegistry;
  private _roleDefResolver: RoleDefinitionResolverV2;
  private ASSERTION_DELEGATE_TYPE =
    '0x766572694b657900000000000000000000000000000000000000000000000000';

  /**
   *
   * @param signer
   * @param claimManagerAddr
   */
  constructor(
    signer: JsonRpcSigner,
    roleDefResolverAddr: string,
    registrySetting: RegistrySettings,
    ipfsUrl: string
  ) {
    this._signer = signer;
    this._ipfsUrl = ipfsUrl;
    this._ipfsStore = new DidStore(this._ipfsUrl);
    this._registrySetting = registrySetting;
    this._roleDefResolver = RoleDefinitionResolverV2__factory.connect(
      roleDefResolverAddr,
      signer
    );
    this._didRegistry = EthereumDIDRegistry__factory.connect(
      registrySetting.address,
      signer
    );
    this._resolver = new Resolver(this._signer.provider, this._registrySetting);
  }

  /**
   * Verifies chain of trust for a given holder's credential 
   * @param {string} subjectDID
   * @param {string} role
   */
  async verifyChainOfTrust(subjectDID: string, role: string) {
    let hasParent = true;
    while (hasParent) {
      const subjectDIDDoc = await this._resolver.read(subjectDID);
      const service = subjectDIDDoc.service;
      let serviceEndpoint = '';
      for (let sv of service) {
        if (utils.namehash(sv.type) === role) {
          serviceEndpoint = sv.serviceEndpoint;
          hasParent = false;
          break;
        }
      }
      const issuerDID = await this.verifyCredential(serviceEndpoint);
      if (issuerDID) {
        if (await this.verifyIssuer(role, issuerDID)) {
          subjectDID = issuerDID;
        } else {
          return 'Issuer is not allowed to issue role';
        }
      } else {
        return 'the credential is invalid';
      }
    }
  }

  /**
   * Verify credential against issuer
   * @param {string} serviceEndpoint
   */
  async verifyCredential(serviceEndpoint: string) {
    const token = await this._ipfsStore.get(serviceEndpoint);
    const payload = jwt.decode(token) as { iss: string };
    const issuerDIDDoc = await this._resolver.read(payload.iss);
    const verifier = new ProofVerifier(issuerDIDDoc);
    if (await verifier.verifyAssertionProof(token)) {
      return payload.iss;
    } else {
      return 'Invalid Credential';
    }
  }

  /**
   * Verifies issuer's authority to issue credential
   * @param {string} role
   * @param {string} issuerDID
   * @returns {boolean}
   */
  async verifyIssuer(role: string, issuerDID: string): Promise<Boolean> {
    const { dids, role: string } = await this._roleDefResolver.issuers(
      utils.namehash(role)
    );
    let didMatched = false;
    if (dids.length > 0) {
      for (let i = 0; i < dids.length; i++) {
        if (
          dids[i] == issuerDID ||
          (await this._didRegistry.validDelegate(
            dids[i],
            this.ASSERTION_DELEGATE_TYPE,
            issuerDID
          ))
        ) {
          didMatched = true;
          break;
        }
      }
    }
    const issuerDIDDocument = await this._resolver.read(issuerDID);
    const service = issuerDIDDocument.service;
    const hasRole = false;
    let serviceEndpoint = '';
    for (let sv of service) {
      if (utils.namehash(sv.type) === role) {
        serviceEndpoint = sv.serviceEndpoint;
        break;
      }
    }
    const token = await this._ipfsStore.get(serviceEndpoint);
    const payload = jwt.decode(token) as { iss: string };
    const issuerDIDDoc = await this._resolver.read(payload.iss);
    const verifier = new ProofVerifier(issuerDIDDoc);
    if (
      (await verifier.verifyAssertionProof(token)) &&
      (hasRole || didMatched)
    ) {
      return true;
    } else {
      return false;
    }
  }
}
