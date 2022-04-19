import { utils, ContractFactory, Contract, Signer } from 'ethers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  abi as erc1056Abi,
  bytecode as erc1056Bytecode,
} from '@energyweb/onchain-claims/test/test_utils/ERC1056.json';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { IdentityManager__factory as IdentityManagerFactory } from '@energyweb/credential-governance/ethers/factories/IdentityManager__factory';
import { IdentityManager } from '@energyweb/credential-governance/ethers/IdentityManager';
import { OfferableIdentity__factory as OfferableIdentityFactory } from '@energyweb/credential-governance/ethers/factories/OfferableIdentity__factory';
import { RoleDefinitionResolverV2__factory } from '@energyweb/credential-governance/ethers/factories/RoleDefinitionResolverV2__factory';
import { DomainTransactionFactoryV2 } from '@energyweb/credential-governance/src';
import { ENSRegistry } from '@energyweb/credential-governance/ethers/ENSRegistry';
import { RoleDefinitionResolverV2 } from '@energyweb/credential-governance/ethers/RoleDefinitionResolverV2';
import { PreconditionType } from '@energyweb/credential-governance/src/types/domain-definitions';
import { defaultVersion } from '@energyweb/onchain-claims/test/test_utils/role-utils';
import { EwSigner, Operator } from '@ew-did-registry/did-ethr-resolver';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { Methods } from '@ew-did-registry/did';
import {
  CredentialResolver,
  IssuerVerification,
  IssuerDefinitionResolver,
  IpfsCredentialResolver,
  EthersProviderIssuerDefinitionResolver,
} from '../src';
import { IVerifiableCredential, OffChainClaim } from '../src/models';
import {
  DIDAttribute,
  PubKeyType,
  ProviderTypes,
  ProviderSettings,
  RegistrySettings,
  IUpdateData,
} from '@ew-did-registry/did-resolver-interface';
import { Keys } from '@ew-did-registry/keys';
import { JWT } from '@ew-did-registry/jwt';
import {
  spawnIpfsDaemon,
  shutDownIpfsDaemon,
} from '../../../test/utils/ipfs-daemon';

chai.use(chaiAsPromised);
const expect = chai.expect;

const root = `0x${'0'.repeat(64)}`;
const adminRole = 'admin';
const userRole = 'user';
const activeuserRole = 'active-user';
const managerRole = 'manager';

const hashLabel = (label: string): string =>
  utils.keccak256(utils.toUtf8Bytes(label));

let proxyIdentityManager: IdentityManager;
let roleFactory: DomainTransactionFactoryV2;
let roleResolver: RoleDefinitionResolverV2;
let registry: Contract;
let provider: JsonRpcProvider;
let issuerVerification: IssuerVerification;
let registrySettings: RegistrySettings;
let credentialResolver: CredentialResolver;
let issuerDefinitionResolver: IssuerDefinitionResolver;

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

let userKeys: Keys;
let userDid: string;
let adminKeys: Keys;
let adminDid: string;
let managerKeys: Keys;
let managerDid: string;
let verifierKeys: Keys;
let verifierDid: string;

let userOperator: Operator;
let adminOperator: Operator;
let managerOperator: Operator;
let providerSettings: ProviderSettings;
let ipfsUrl: string;
let didStore: DidStore;

const validity = 10 * 60 * 1000;

export function IssuanceVerificationTest(): void {
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

    verifierKeys = new Keys({
      privateKey:
        '8d5366123cb560bb606379f90a0bfd4769eecc0557f1b362dcae9012b548b1e5',
    });
    verifierAddress = verifierKeys.getAddress();
    verifierDid = `did:${Methods.Erc1056}:${verifierAddress}`;
    verifier = EwSigner.fromPrivateKey(
      verifierKeys.privateKey,
      providerSettings
    );
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

    issuerDefinitionResolver = new EthersProviderIssuerDefinitionResolver(
      provider,
      roleResolver.address
    );
    issuerVerification = new IssuerVerification(
      provider,
      registrySettings,
      credentialResolver,
      issuerDefinitionResolver
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
    it('verifies issuer, where the role is issued by did', async () => {
      let adminJWT = new JWT(adminKeys);
      const roleClaim = {
        iss: adminDid,
        subject: adminDid,
        role: adminRole,
      };
      const roleToken = await adminJWT.sign(roleClaim);
      const claim = {
        claimTypeVersion: 1,
        issuedToken: roleToken,
        iss: adminDid,
        claimType: adminRole,
      };
      let token: string = '';
      let ipfsCID: string = 'ipfsUrl';
      if (admin.privateKey) {
        token = await adminJWT.sign(claim);

        if (token) {
          ipfsCID = await didStore.save(token);
        }
      }
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
      const vc: IVerifiableCredential = {
        '@context': [],
        id: adminDid,
        type: ['Claims'],
        issuer: adminDid,
        issaunceDate: '02/02/2022',
        credentialSubject: {
          id: adminDid,
          role: {
            namespace: adminRole,
            version: '1',
          },
          issuerFields: [],
        },
        proof: {
          '@context': 'string',
          verificationMethod: 'string',
          created: 'string',
          proofPurpose: 'string',
          type: 'string',
        },
      };

      expect(await issuerVerification.verifyChainOfTrust(vc)).true;
    });

    it('verifies issuer, where the role is issued by role', async () => {
      let adminJWT = new JWT(adminKeys);
      const roleClaimAdmin = {
        iss: adminDid,
        subject: adminDid,
        role: adminRole,
      };
      const roleTokenAdmin = await adminJWT.sign(roleClaimAdmin);
      const claimAdmin = {
        claimTypeVersion: 1,
        issuedToken: roleTokenAdmin,
        iss: adminDid,
        claimType: adminRole,
      };
      let tokenAdmin: string = '';
      let ipfsCIDAdmin: string = 'ipfsUrl';
      if (admin.privateKey) {
        tokenAdmin = await adminJWT.sign(claimAdmin);

        if (tokenAdmin) {
          ipfsCIDAdmin = await didStore.save(tokenAdmin);
        }
      }
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

      const roleClaimManager = {
        iss: adminDid,
        subject: managerDid,
        role: managerRole,
      };
      const roleTokenManager = await adminJWT.sign(roleClaimManager);
      const claimManager = {
        claimTypeVersion: 1,
        issuedToken: roleTokenManager,
        iss: adminDid,
        claimType: managerRole,
      };
      let tokenManager: string = '';
      let ipfsCIDManager: string = 'ipfsUrlManager';
      if (admin.privateKey) {
        tokenManager = await adminJWT.sign(claimManager);

        if (tokenManager) {
          ipfsCIDManager = await didStore.save(tokenManager);
        }
      }
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
      const managerVC: IVerifiableCredential = {
        '@context': [],
        id: managerDid,
        type: ['Claims'],
        issuer: adminDid,
        issaunceDate: '02/02/2022',
        credentialSubject: {
          id: managerDid,
          role: {
            namespace: managerRole,
            version: '1',
          },
          issuerFields: [],
        },
        proof: {
          '@context': 'string',
          verificationMethod: 'string',
          created: 'string',
          proofPurpose: 'string',
          type: 'string',
        },
      };

      expect(await issuerVerification.verifyChainOfTrust(managerVC)).true;
    });

    it('rejects credential for any unauthorised issuer in the chain', async () => {
      let adminJWT = new JWT(adminKeys);
      const roleClaimAdmin = {
        iss: adminDid,
        subject: adminDid,
        role: adminRole,
      };
      const roleTokenAdmin = await adminJWT.sign(roleClaimAdmin);
      const claimAdmin = {
        claimTypeVersion: 1,
        issuedToken: roleTokenAdmin,
        iss: adminDid,
        claimType: adminRole,
      };
      let tokenAdmin: string = '';
      let ipfsCIDAdmin: string = 'ipfsUrl';
      if (admin.privateKey) {
        tokenAdmin = await adminJWT.sign(claimAdmin);

        if (tokenAdmin) {
          ipfsCIDAdmin = await didStore.save(tokenAdmin);
        }
      }
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

      const roleClaimUser = {
        iss: adminDid,
        subject: userDid,
        role: userRole,
      };
      const roleTokenUser = await adminJWT.sign(roleClaimUser);
      const claimsUser = {
        claimTypeVersion: 1,
        issuedToken: roleTokenUser,
        iss: adminDid,
        claimType: userRole,
      };
      let tokenUser: string = '';
      let ipfsCIDUser: string = 'ipfsUrUser';
      if (admin.privateKey) {
        tokenUser = await adminJWT.sign(claimsUser);

        if (tokenUser) {
          ipfsCIDUser = await didStore.save(tokenUser);
        }
      }
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
      const userVC: IVerifiableCredential = {
        '@context': [],
        id: userDid,
        type: ['Claims'],
        issuer: adminDid,
        issaunceDate: '02/02/2022',
        credentialSubject: {
          id: userDid,
          role: {
            namespace: userRole,
            version: '1',
          },
          issuerFields: [],
        },
        proof: {
          '@context': 'string',
          verificationMethod: 'string',
          created: 'string',
          proofPurpose: 'string',
          type: 'string',
        },
      };
      const res = issuerVerification.verifyChainOfTrust(userVC);
      await expect(res).to.be.rejectedWith(
        'Issuer is not allowed to issue credential'
      );
    });
  });
}
