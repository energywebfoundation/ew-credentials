import { utils, ContractFactory, Contract } from 'ethers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  abi as erc1056Abi,
  bytecode as erc1056Bytecode,
} from '@energyweb/onchain-claims/test/test_utils/ERC1056.json';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { OfferableIdentity__factory as OfferableIdentityFactory } from '@energyweb/credential-governance/ethers/factories/OfferableIdentity__factory';
import { RoleDefinitionResolverV2__factory } from '@energyweb/credential-governance/ethers/factories/RoleDefinitionResolverV2__factory';
import {
  DomainReader,
  DomainTransactionFactoryV2,
  ResolverContractType,
  VOLTA_CHAIN_ID,
} from '@energyweb/credential-governance';
import { ENSRegistry } from '@energyweb/credential-governance/ethers/ENSRegistry';
import { RoleDefinitionResolverV2 } from '@energyweb/credential-governance/ethers/RoleDefinitionResolverV2';
import { PreconditionType } from '@energyweb/credential-governance/src/types/domain-definitions';
import { defaultVersion } from '@energyweb/onchain-claims/test/test_utils/role-utils';
import { EwSigner, Operator } from '@ew-did-registry/did-ethr-resolver';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { Methods } from '@ew-did-registry/did';
import {
  CredentialResolver,
  IpfsCredentialResolver,
  EthersProviderIssuerResolver,
  IssuerResolver,
} from '../src';
import { VCIssuerVerification } from '../src/verifier/vc-issuer-verification';
import {
  DIDAttribute,
  ProviderTypes,
  ProviderSettings,
  RegistrySettings,
  IUpdateData,
} from '@ew-did-registry/did-resolver-interface';
import { Keys } from '@ew-did-registry/keys';
import {
  spawnIpfsDaemon,
  shutDownIpfsDaemon,
} from '../../../test/utils/ipfs-daemon';
import { adminVC, managerVC, userVC } from './Fixtures/sample-vc';
import { ERRORS } from '../src';
import { verifyCredential } from 'didkit-wasm-node';

chai.use(chaiAsPromised);
const expect = chai.expect;

const root = `0x${'0'.repeat(64)}`;
const adminRole = 'admin';
const userRole = 'user';
const activeuserRole = 'active-user';
const managerRole = 'manager';

const hashLabel = (label: string): string =>
  utils.keccak256(utils.toUtf8Bytes(label));

let roleFactory: DomainTransactionFactoryV2;
let roleResolver: RoleDefinitionResolverV2;
let registry: Contract;
let provider: JsonRpcProvider;
let issuerVerification: VCIssuerVerification;
let registrySettings: RegistrySettings;
let credentialResolver: CredentialResolver;
let issuerResolver: IssuerResolver;

let deployer: JsonRpcSigner;
let deployerAddr: string;
let user: EwSigner;
let userAddress: string;
let manager: EwSigner;
let managerAddress: string;
let admin: EwSigner;
let adminAddress: string;

let userKeys: Keys;
let userDid: string;
let adminKeys: Keys;
let adminDid: string;
let managerKeys: Keys;
let managerDid: string;

let userOperator: Operator;
let adminOperator: Operator;
let managerOperator: Operator;
let providerSettings: ProviderSettings;
let ipfsUrl: string;
let didStore: DidStore;

const validity = 10 * 60 * 1000;

export function vcIssuerVerificationTests(): void {
  before(async function () {
    ({ provider } = this);
    deployer = provider.getSigner(1);
    deployerAddr = await deployer.getAddress();

    providerSettings = {
      type: ProviderTypes.HTTP,
    };
    userKeys = new Keys({
      privateKey:
        '0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1',
    });
    userAddress = userKeys.getAddress();
    userDid = `did:${Methods.Erc1056}:${userAddress}`;
    user = EwSigner.fromPrivateKey(userKeys.privateKey, providerSettings);

    adminKeys = new Keys({
      privateKey:
        '388c684f0ba1ef5017716adb5d21a053ea8e90277d0868337519f97bede61418',
    });
    adminAddress = adminKeys.getAddress();
    adminDid = `did:${Methods.Erc1056}:${adminAddress}`;
    admin = EwSigner.fromPrivateKey(adminKeys.privateKey, providerSettings);

    managerKeys = new Keys({
      privateKey:
        'aa3680d5d48a8283413f7a108367c7299ca73f553735860a87b08f39395618b7',
    });
    managerAddress = managerKeys.getAddress();
    managerDid = `did:${Methods.Erc1056}:${managerAddress}`;
    manager = EwSigner.fromPrivateKey(managerKeys.privateKey, providerSettings);

    ipfsUrl = await spawnIpfsDaemon();
  });

  after(async () => {
    await shutDownIpfsDaemon();
  });

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
    roleFactory = new DomainTransactionFactoryV2({
      domainResolverAddress: roleResolver.address,
    });

    registrySettings = {
      method: Methods.Erc1056,
      abi: erc1056Abi,
      address: registry.address,
    };

    providerSettings = {
      type: ProviderTypes.HTTP,
    };
    
    didStore = new DidStore(ipfsUrl);
    credentialResolver = new IpfsCredentialResolver(
      provider,
      registrySettings,
      didStore
    );
    userOperator = new Operator(user, { address: registry.address });
    adminOperator = new Operator(admin, { address: registry.address });
    managerOperator = new Operator(manager, { address: registry.address });

    await userOperator.create();
    await adminOperator.create();
    await managerOperator.create();
    let domainReader = new DomainReader({
      ensRegistryAddress: ensRegistry.address,
      provider: provider,
    });
    domainReader.addKnownResolver({
      chainId: VOLTA_CHAIN_ID,
      address: roleResolver.address,
      type: ResolverContractType.RoleDefinitionResolver_v2,
    });

    issuerResolver = new EthersProviderIssuerResolver(domainReader);
    issuerVerification = new VCIssuerVerification(
      issuerResolver,
      credentialResolver,
      verifyCredential
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

  describe('Issuer verification', () => {
    it('verifies issuer, where the role is issued by did', async () => {
      let ipfsCID = await didStore.save(JSON.stringify(adminVC));
      const serviceId = adminRole;
      const updateData: IUpdateData = {
        type: DIDAttribute.ServicePoint,
        value: {
          id: `${adminDid}#service-${serviceId}`,
          type: 'ClaimStore',
          serviceEndpoint: ipfsCID,
        },
      };
      await adminOperator.update(
        adminDid,
        DIDAttribute.ServicePoint,
        updateData,
        validity
      );

      return expect(
        (await issuerVerification.verifyIssuer(adminDid, adminRole)).verified
      ).to.be.true;
    });

    it('verifies issuer, where the role is issued by role', async () => {
      let ipfsCID = await didStore.save(JSON.stringify(adminVC));
      const serviceId = adminRole;
      const updateData: IUpdateData = {
        type: DIDAttribute.ServicePoint,
        value: {
          id: `${adminDid}#service-${serviceId}`,
          type: 'ClaimStore',
          serviceEndpoint: ipfsCID,
        },
      };
      await adminOperator.update(
        adminDid,
        DIDAttribute.ServicePoint,
        updateData,
        validity
      );

      let ipfsCIDManager = await didStore.save(JSON.stringify(managerVC));
      const serviceIdManager = managerRole;
      const updateDataManager: IUpdateData = {
        type: DIDAttribute.ServicePoint,
        value: {
          id: `${managerDid}#service-${serviceIdManager}`,
          type: 'ClaimStore',
          serviceEndpoint: ipfsCIDManager,
        },
      };
      await managerOperator.update(
        managerDid,
        DIDAttribute.ServicePoint,
        updateDataManager,
        validity
      );

      return expect(
        (await issuerVerification.verifyIssuer(adminDid, managerRole)).verified
      ).to.be.true;
    });

    it('rejects credential for any unauthorised issuer in the chain', async () => {
      let ipfsCIDAdmin = await didStore.save(JSON.stringify(adminVC));
      const serviceIdAdmin = adminRole;
      const updateDataAdmin: IUpdateData = {
        type: DIDAttribute.ServicePoint,
        value: {
          id: `${adminDid}#service-${serviceIdAdmin}`,
          type: 'ClaimStore',
          serviceEndpoint: ipfsCIDAdmin,
        },
      };
      await adminOperator.update(
        adminDid,
        DIDAttribute.ServicePoint,
        updateDataAdmin,
        validity
      );

      let ipfsCIDUser = await didStore.save(JSON.stringify(userVC));
      const serviceIdUser = userRole;
      const updateDataUser: IUpdateData = {
        type: DIDAttribute.ServicePoint,
        value: {
          id: `${userDid}#service-${serviceIdUser}`,
          type: 'ClaimStore',
          serviceEndpoint: ipfsCIDUser,
        },
      };
      await userOperator.update(
        userDid,
        DIDAttribute.ServicePoint,
        updateDataUser,
        validity
      );
      // only manager is authorized to issue user
      return expect(
        (await issuerVerification.verifyIssuer(adminDid, userRole)).error
      ).equal(ERRORS.IssuerNotAuthorized);
    });
  });
}
