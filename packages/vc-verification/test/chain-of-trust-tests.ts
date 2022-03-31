import {
  utils,
  ContractFactory,
  Signer,
  Contract,
  Wallet,
  providers,
} from 'ethers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import jwt from 'jsonwebtoken';
import {
  abi as erc1056Abi,
  bytecode as erc1056Bytecode,
} from '@energyweb/onchain-claims/test/test_utils/ERC1056.json';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { ClaimManager__factory as ClaimManagerFactory } from '@energyweb/onchain-claims/ethers/factories/ClaimManager__factory';
import { ClaimManager } from '@energyweb/onchain-claims/ethers/ClaimManager';
import { IdentityManager__factory as IdentityManagerFactory } from '@energyweb/credential-governance/ethers/factories/IdentityManager__factory';
import { IdentityManager } from '@energyweb/credential-governance/ethers/IdentityManager';
import { OfferableIdentity__factory as OfferableIdentityFactory } from '@energyweb/credential-governance/ethers/factories/OfferableIdentity__factory';
import { RoleDefinitionResolverV2__factory } from '@energyweb/credential-governance/ethers/factories/RoleDefinitionResolverV2__factory';
import { DomainTransactionFactoryV2 } from '@energyweb/credential-governance/src';
import { ENSRegistry } from '@energyweb/credential-governance/ethers/ENSRegistry';
import { RoleDefinitionResolverV2 } from '@energyweb/credential-governance/ethers/RoleDefinitionResolverV2';
import { PreconditionType } from '@energyweb/credential-governance/src/types/domain-definitions';
import { defaultVersion } from '@energyweb/onchain-claims/test/test_utils/role-utils';
import { shutDownIpfsDaemon, spawnIpfsDaemon } from './utils/ipfs-daemon';
import { EwSigner, Operator } from '@ew-did-registry/did-ethr-resolver';
import DIDRegistry from '@ew-did-registry/did-registry';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { Methods } from '@ew-did-registry/did';
import { IssuanceVerification } from '../src';
import {
  DIDAttribute,
  PubKeyType,
  ProviderTypes,
  ProviderSettings,
  RegistrySettings,
} from '@ew-did-registry/did-resolver-interface';
import { Keys } from '@ew-did-registry/keys';

chai.use(chaiAsPromised);
const expect = chai.expect;

const root = `0x${'0'.repeat(64)}`;
const adminRole = 'admin';
const userRole = 'user';
const activeuserRole = 'active-user';
const managerRole = 'manager';

const hashLabel = (label: string): string =>
  utils.keccak256(utils.toUtf8Bytes(label));

let claimManager: ClaimManager;
let proxyIdentityManager: IdentityManager;
let roleFactory: DomainTransactionFactoryV2;
let roleResolver: RoleDefinitionResolverV2;
let registry: Contract;
let provider: JsonRpcProvider;
let issuanceVerification: IssuanceVerification;
let registrySettings: RegistrySettings;

let deployer: JsonRpcSigner;
let deployerAddr: string;
let user: EwSigner;
let userAddress: string;
let manager: EwSigner;
let managerAddress: string;
let admin: EwSigner;
let adminAddress: string;
let verifier: EwSigner;
let verifierAddress: string;
let store: DidStore;

let userKeys: Keys;
let userDid: string;
let adminKeys: Keys;
let adminDid: string;
let managerKeys: Keys;
let managerDid: string;
let verifierKeys: Keys;
let verifierDid: string;

let adminReg: DIDRegistry;
let managerReg: DIDRegistry;
let userReg: DIDRegistry;
let verifierReg: DIDRegistry;
let userOperator: Operator;
let adminOperator: Operator;
let managerOperator: Operator;
let verifierOperator: Operator;
let providerSettings: ProviderSettings;

export function IssuanceVerificationTest(): void {
  // takes very long time, but can be useful sometimes
  // describe.skip('Tests on Volta', testsOnVolta);
  describe('Tests on ganache', testsOnGanache);
}

export function testsOnGanache(): void {
  before(async function () {
    ({ provider } = this);
    deployer = provider.getSigner(1);
    deployerAddr = await deployer.getAddress();

    providerSettings = {
      type: ProviderTypes.HTTP,
    };
    userKeys = new Keys();
    userAddress = userKeys.getAddress();
    userDid = `did:${Methods.Erc1056}:${userAddress}`;
    user = EwSigner.fromPrivateKey(userKeys.privateKey, providerSettings);

    adminKeys = new Keys();
    adminAddress = adminKeys.getAddress();
    adminDid = `did:${Methods.Erc1056}:${adminAddress}`;
    admin = EwSigner.fromPrivateKey(adminKeys.privateKey, providerSettings);

    managerKeys = new Keys();
    managerAddress = managerKeys.getAddress();
    managerDid = `did:${Methods.Erc1056}:${managerAddress}`;
    manager = EwSigner.fromPrivateKey(managerKeys.privateKey, providerSettings);
  });

  verifierKeys = new Keys();
  verifierAddress = verifierKeys.getAddress();
  verifierDid = `did:${Methods.Erc1056}:${verifierAddress}`;
  verifier = EwSigner.fromPrivateKey(verifierKeys.privateKey, providerSettings);

  testSuite();
}

function testSuite() {
  beforeEach(async function () {
    const erc1056Factory = new ContractFactory(
      erc1056Abi,
      erc1056Bytecode,
      deployer
    );
    registry = await (await erc1056Factory.deploy()).deployed();

    const { ensFactory, domainNotifierFactory } = this;
    const ensRegistry: ENSRegistry = await (
      await ensFactory.connect(deployer).deploy()
    ).deployed();

    const notifier = await (
      await domainNotifierFactory.connect(deployer).deploy(ensRegistry.address)
    ).deployed();
    roleResolver = await (
      await new RoleDefinitionResolverV2__factory(deployer).deploy(
        ensRegistry.address,
        notifier.address
      )
    ).deployed();

    const offerableIdentity = await (
      await new OfferableIdentityFactory(deployer).deploy()
    ).deployed();
    proxyIdentityManager = await (
      await new IdentityManagerFactory(deployer).deploy(
        offerableIdentity.address
      )
    ).deployed();
    roleFactory = new DomainTransactionFactoryV2({
      domainResolverAddress: roleResolver.address,
    });

    registrySettings = {
      method: Methods.Erc1056,
      abi: erc1056Abi,
      address: registry.address,
    };

    const ipfsApi = await spawnIpfsDaemon();
    store = new DidStore(ipfsApi);

    userOperator = new Operator(user, { address: registry.address });
    adminOperator = new Operator(admin, { address: registry.address });
    managerOperator = new Operator(manager, { address: registry.address });

    userReg = new DIDRegistry(
      userKeys,
      userDid,
      userOperator,
      store,
      providerSettings
    );

    adminReg = new DIDRegistry(
      adminKeys,
      adminDid,
      adminOperator,
      store,
      providerSettings
    );

    managerReg = new DIDRegistry(
      managerKeys,
      managerDid,
      managerOperator,
      store,
      providerSettings
    );

    verifierReg = new DIDRegistry(
      verifierKeys,
      verifierDid,
      verifierOperator,
      store,
      providerSettings
    );

    await userReg.document.create();
    await adminReg.document.create();
    await managerReg.document.create();
    await verifierReg.document.create();

    issuanceVerification = new IssuanceVerification(
      verifier,
      roleResolver.address,
      registrySettings,
      ipfsApi
    );

    await (
      await ensRegistry.setSubnodeOwner(
        root,
        hashLabel(adminRole),
        deployerAddr
      )
    ).wait();
    await (
      await ensRegistry.setSubnodeOwner(root, hashLabel(userRole), deployerAddr)
    ).wait();
    await (
      await ensRegistry.setSubnodeOwner(
        root,
        hashLabel(activeuserRole),
        deployerAddr
      )
    ).wait();
    await (
      await ensRegistry.setSubnodeOwner(
        root,
        hashLabel(managerRole),
        deployerAddr
      )
    ).wait();

    await (
      await ensRegistry.setResolver(
        utils.namehash(adminRole),
        roleResolver.address
      )
    ).wait();
    await (
      await ensRegistry.setResolver(
        utils.namehash(userRole),
        roleResolver.address
      )
    ).wait();
    await (
      await ensRegistry.setResolver(
        utils.namehash(activeuserRole),
        roleResolver.address
      )
    ).wait();
    await (
      await ensRegistry.setResolver(
        utils.namehash(managerRole),
        roleResolver.address
      )
    ).wait();

    await (
      await deployer.sendTransaction({
        ...roleFactory.newRole({
          domain: adminRole,
          roleDefinition: {
            roleName: adminRole,
            enrolmentPreconditions: [],
            requestorFields: [],
            issuerFields: [],
            issuer: {
              issuerType: 'DID',
              did: [`did:ethr:volta:${await admin.getAddress()}`],
            },
            revoker: {
              revokerType: 'DID',
              did: [`did:ethr:volta:${await admin.getAddress()}`],
            },
            metadata: [],
            roleType: '',
            version: defaultVersion,
          },
        }),
      })
    ).wait();

    await (
      await deployer.sendTransaction({
        ...roleFactory.newRole({
          domain: userRole,
          roleDefinition: {
            roleName: userRole,
            enrolmentPreconditions: [],
            requestorFields: [],
            issuerFields: [],
            issuer: { issuerType: 'ROLE', roleName: managerRole },
            revoker: { revokerType: 'ROLE', roleName: managerRole },
            metadata: [],
            roleType: '',
            version: defaultVersion,
          },
        }),
      })
    ).wait();

    await (
      await deployer.sendTransaction({
        ...roleFactory.newRole({
          domain: activeuserRole,
          roleDefinition: {
            roleName: activeuserRole,
            enrolmentPreconditions: [
              { type: PreconditionType.Role, conditions: [userRole] },
            ],
            requestorFields: [],
            issuerFields: [],
            issuer: { issuerType: 'ROLE', roleName: managerRole },
            revoker: { revokerType: 'ROLE', roleName: managerRole },
            metadata: [],
            roleType: '',
            version: defaultVersion,
          },
        }),
      })
    ).wait();

    await (
      await deployer.sendTransaction({
        ...roleFactory.newRole({
          domain: managerRole,
          roleDefinition: {
            roleName: managerRole,
            enrolmentPreconditions: [],
            requestorFields: [],
            issuerFields: [],
            issuer: { issuerType: 'ROLE', roleName: adminRole },
            revoker: { revokerType: 'ROLE', roleName: adminRole },
            metadata: [],
            roleType: '',
            version: defaultVersion,
          },
        }),
      })
    ).wait();
  });

  describe('chainOfTrustTests', () => {
    it('verifies hierarchy of issuers', async () => {
      const credential = {
        id: adminDid,
        requestor: adminDid,
        issuer: adminDid,
        claimType: 'adminRole',
      };

      const token = jwt.sign(credential, {
        subject: credential.requestor,
        issuer: credential.issuer,
      });

      const credentialUrl = await store.save(token);
      await adminOperator.update(adminDid, DIDAttribute.ServicePoint, {
        type: DIDAttribute.ServicePoint,
        value: {
          id: adminDid,
          type: adminRole,
          serviceEndpoint: credentialUrl,
        },
      });
    });
    issuanceVerification.verifyChainOfTrust(adminDid, adminRole);
  });
}
