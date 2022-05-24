import { utils, ContractFactory, Contract } from 'ethers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  abi as erc1056Abi,
  bytecode as erc1056Bytecode,
} from './test_utils/ERC1056.json';
import {
  ProviderSettings,
  ProviderTypes,
} from '@ew-did-registry/did-resolver-interface';
import { Keys } from '@ew-did-registry/keys';
import { EwSigner } from '@ew-did-registry/did-ethr-resolver';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { ClaimManager__factory as ClaimManagerFactory } from '../ethers/factories/ClaimManager__factory';
import { ClaimManager } from '../ethers/ClaimManager';
import { ClaimsRevocationRegistry__factory as ClaimsRevocationRegistryFactory } from '../ethers/factories/ClaimsRevocationRegistry__factory';
import { ClaimsRevocationRegistry } from '../ethers/ClaimsRevocationRegistry';
import { DomainTransactionFactoryV2 } from '@energyweb/credential-governance/src/domain-transaction-factory-v2';
import { ENSRegistry } from '@energyweb/credential-governance/ethers/ENSRegistry';
import { RoleDefinitionResolverV2 } from '@energyweb/credential-governance/ethers/RoleDefinitionResolverV2';
import { RoleDefinitionResolverV2__factory } from '@energyweb/credential-governance/ethers/factories/RoleDefinitionResolverV2__factory';
import { ClaimRevocation } from '../src';
import { defaultVersion, requestRole } from './test_utils/role-utils';

chai.use(chaiAsPromised);
const expect = chai.expect;

const root = `0x${'0'.repeat(64)}`;
const authorityRole = 'authority';
const deviceRole = 'device';
const adminRole = 'admin-role';
const installerRole = 'installer';

const hashLabel = (label: string): string =>
  utils.keccak256(utils.toUtf8Bytes(label));

let claimManager: ClaimManager;
let ensRegistry: ENSRegistry;
let roleFactory: DomainTransactionFactoryV2;
let roleResolver: RoleDefinitionResolverV2;
let erc1056: Contract;
let provider: JsonRpcProvider;
let revocationRegistry: ClaimsRevocationRegistry;
let claimRevocation: ClaimRevocation;

let deployer: JsonRpcSigner;
let deployerAddr: string;
let device: EwSigner;
let deviceAddr: string;
let deviceJS: JsonRpcSigner;
let installer: EwSigner;
let installerAddr: string;
let installerJS: JsonRpcSigner;
let installer1: EwSigner;
let installer1Addr: string;
let installer1JS: JsonRpcSigner;
let authority: EwSigner;
let authorityAddr: string;
let authorityJS: JsonRpcSigner;
let admin: EwSigner;
let adminAddr: string;
let adminJS: JsonRpcSigner;

export function revocationTests(): void {
  describe('Tests on ganache', testsOnGanache);
}

export function testsOnGanache(): void {
  before(async function () {
    ({ provider } = this);
    deployer = provider.getSigner(1);
    deployerAddr = await deployer.getAddress();
    const providerSettings: ProviderSettings = {
      type: ProviderTypes.HTTP,
    };
    const deviceKeys = new Keys({
      privateKey:
        'c88b703fb08cbea894b6aeff5a544fb92e78a18e19814cd85da83b71f772aa6c',
    });
    deviceAddr = deviceKeys.getAddress();
    device = EwSigner.fromPrivateKey(deviceKeys.privateKey, providerSettings);
    const adminKeys = new Keys({
      privateKey:
        '82d052c865f5763aad42add438569276c00d3d88a2d062d36b2bae914d58b8c8',
    });
    adminAddr = adminKeys.getAddress();
    admin = EwSigner.fromPrivateKey(adminKeys.privateKey, providerSettings);
    const installerKeys = new Keys({
      privateKey:
        '388c684f0ba1ef5017716adb5d21a053ea8e90277d0868337519f97bede61418',
    });
    installerAddr = installerKeys.getAddress();
    installer = EwSigner.fromPrivateKey(
      installerKeys.privateKey,
      providerSettings
    );
    const authorityKeys = new Keys({
      privateKey:
        '659cbb0e2411a44db63778987b1e22153c086a95eb6b18bdf89de078917abc63',
    });
    authorityAddr = authorityKeys.getAddress();
    authority = EwSigner.fromPrivateKey(
      authorityKeys.privateKey,
      providerSettings
    );
    const installer1Keys = new Keys({
      privateKey:
        'aa3680d5d48a8283413f7a108367c7299ca73f553735860a87b08f39395618b7',
    });
    installer1Addr = installer1Keys.getAddress();
    installer1 = EwSigner.fromPrivateKey(
      installer1Keys.privateKey,
      providerSettings
    );
    deviceJS = provider.getSigner(3);
    installerJS = provider.getSigner(4);
    authorityJS = provider.getSigner(5);
    adminJS = provider.getSigner(6);
    installer1JS = provider.getSigner(7);
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
    erc1056 = await (await erc1056Factory.deploy()).deployed();
    const { ensFactory, domainNotifierFactory } = this;
    ensRegistry = await (
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

    claimManager = await (
      await new ClaimManagerFactory(deployer).deploy()
    ).deployed();
    claimManager.initialize(erc1056.address, ensRegistry.address);
    roleFactory = new DomainTransactionFactoryV2({
      domainResolverAddress: roleResolver.address,
    });

    revocationRegistry = await (
      await new ClaimsRevocationRegistryFactory(authority).deploy(
        erc1056.address,
        ensRegistry.address,
        claimManager.address
      )
    ).deployed();

    await (
      await ensRegistry.setSubnodeOwner(
        root,
        hashLabel(authorityRole),
        deployerAddr
      )
    ).wait();
    await (
      await ensRegistry.setSubnodeOwner(
        root,
        hashLabel(deviceRole),
        deployerAddr
      )
    ).wait();
    await (
      await ensRegistry.setSubnodeOwner(
        root,
        hashLabel(installerRole),
        deployerAddr
      )
    ).wait();
    await (
      await ensRegistry.setSubnodeOwner(
        root,
        hashLabel(adminRole),
        deployerAddr
      )
    ).wait();

    await (
      await ensRegistry.setResolver(
        utils.namehash(authorityRole),
        roleResolver.address
      )
    ).wait();
    await (
      await ensRegistry.setResolver(
        utils.namehash(deviceRole),
        roleResolver.address
      )
    ).wait();
    await (
      await ensRegistry.setResolver(
        utils.namehash(installerRole),
        roleResolver.address
      )
    ).wait();
    await (
      await ensRegistry.setResolver(
        utils.namehash(adminRole),
        roleResolver.address
      )
    ).wait();

    await (
      await deployer.sendTransaction({
        ...roleFactory.newRole({
          domain: authorityRole,
          roleDefinition: {
            roleName: authorityRole,
            enrolmentPreconditions: [],
            requestorFields: [],
            issuerFields: [],
            issuer: {
              issuerType: 'DID',
              did: [`did:ethr:${authorityAddr}`],
            },
            revoker: {
              revokerType: 'DID',
              did: [`did:ethr:${authorityAddr}`],
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
          domain: deviceRole,
          roleDefinition: {
            roleName: deviceRole,
            enrolmentPreconditions: [],
            requestorFields: [],
            issuerFields: [],
            issuer: {
              issuerType: 'DID',
              did: [`did:ethr:${authorityAddr}`],
            },
            revoker: { revokerType: 'ROLE', roleName: installerRole },
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
          domain: installerRole,
          roleDefinition: {
            roleName: installerRole,
            enrolmentPreconditions: [],
            requestorFields: [],
            issuerFields: [],
            issuer: { issuerType: 'ROLE', roleName: authorityRole },
            revoker: { revokerType: 'ROLE', roleName: authorityRole },
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
          domain: adminRole,
          roleDefinition: {
            roleName: adminRole,
            enrolmentPreconditions: [],
            requestorFields: [],
            issuerFields: [],
            issuer: { issuerType: 'ROLE', roleName: authorityRole },
            revoker: { revokerType: 'DID', did: [] },
            metadata: [],
            roleType: '',
            version: defaultVersion,
          },
        }),
      })
    ).wait();
  });

  it('Role can be revoked where revokerType is DID', async () => {
    await requestRole({
      claimManager,
      roleName: authorityRole,
      agreementSigner: authorityJS,
      proofSigner: authorityJS,
    });
    expect(
      await claimManager.hasRole(
        authorityAddr,
        utils.namehash(authorityRole),
        defaultVersion
      )
    ).true;
    claimRevocation = new ClaimRevocation(
      authority,
      revocationRegistry.address
    );

    await claimRevocation.revokeClaim(
      authorityRole,
      `did:ethr:${await authority.getAddress()}`,
      `did:ethr:${await authority.getAddress()}`
    );
    expect(
      await claimRevocation.isClaimRevoked(
        authorityRole,
        `did:ethr:${await authority.getAddress()}`
      )
    ).true;
  });

  it('Role can be revoked where revokerType is Role ', async () => {
    await requestRole({
      claimManager,
      roleName: authorityRole,
      agreementSigner: authorityJS,
      proofSigner: authorityJS,
    });
    await requestRole({
      claimManager,
      roleName: installerRole,
      agreementSigner: installerJS,
      proofSigner: authorityJS,
    });
    expect(
      await claimManager.hasRole(
        installerAddr,
        utils.namehash(installerRole),
        defaultVersion
      )
    ).true;
    claimRevocation = new ClaimRevocation(
      authority,
      revocationRegistry.address
    );

    await claimRevocation.revokeClaim(
      installerRole,
      `did:ethr:${installerAddr}`,
      `did:ethr:${authorityAddr}`
    );
    expect(
      await claimRevocation.isClaimRevoked(
        installerRole,
        `did:ethr:${installerAddr}`
      )
    ).true;
  });

  it('Role can be revoked where issuerType is "DID" and revokerType is "Role" ', async () => {
    await requestRole({
      claimManager,
      roleName: authorityRole,
      agreementSigner: authorityJS,
      proofSigner: authorityJS,
    });
    await requestRole({
      claimManager,
      roleName: deviceRole,
      agreementSigner: deviceJS,
      proofSigner: authorityJS,
    });
    await requestRole({
      claimManager,
      roleName: installerRole,
      agreementSigner: installerJS,
      proofSigner: authorityJS,
    });
    claimRevocation = new ClaimRevocation(
      installer,
      revocationRegistry.address
    );

    await claimRevocation.revokeClaim(
      deviceRole,
      `did:ethr:${deviceAddr}`,
      `did:ethr:${installerAddr}`
    );
    expect(
      await claimRevocation.isClaimRevoked(deviceRole, `did:ethr:${deviceAddr}`)
    ).true;
  });

  it('Revoker can revoke his/her own role', async () => {
    await requestRole({
      claimManager,
      roleName: authorityRole,
      agreementSigner: authorityJS,
      proofSigner: authorityJS,
    });
    expect(
      await claimManager.hasRole(
        authorityAddr,
        utils.namehash(authorityRole),
        defaultVersion
      )
    ).true;
    claimRevocation = new ClaimRevocation(
      authority,
      revocationRegistry.address
    );

    await claimRevocation.revokeClaim(
      authorityRole,
      `did:ethr:${authorityAddr}`,
      `did:ethr:${authorityAddr}`
    );
    expect(
      await claimRevocation.isClaimRevoked(
        authorityRole,
        `did:ethr:${authorityAddr}`
      )
    ).true;
  });

  it('Revoker can revoke role issued by other authorities', async () => {
    await requestRole({
      claimManager,
      roleName: authorityRole,
      agreementSigner: authorityJS,
      proofSigner: authorityJS,
    });
    await requestRole({
      claimManager,
      roleName: deviceRole,
      agreementSigner: deviceJS,
      proofSigner: authorityJS,
    });
    await requestRole({
      claimManager,
      roleName: installerRole,
      agreementSigner: installerJS,
      proofSigner: authorityJS,
    });
    claimRevocation = new ClaimRevocation(
      installer,
      revocationRegistry.address
    );

    await claimRevocation.revokeClaim(
      deviceRole,
      `did:ethr:${deviceAddr}`,
      `did:ethr:${installerAddr}`
    );
    expect(
      await claimRevocation.isClaimRevoked(deviceRole, `did:ethr:${deviceAddr}`)
    ).true;
  });

  it('Revoker can revoke role issued by him/her', async () => {
    await requestRole({
      claimManager,
      roleName: authorityRole,
      agreementSigner: authorityJS,
      proofSigner: authorityJS,
    });
    await requestRole({
      claimManager,
      roleName: installerRole,
      agreementSigner: installerJS,
      proofSigner: authorityJS,
    });
    expect(
      await claimManager.hasRole(
        installerAddr,
        utils.namehash(installerRole),
        defaultVersion
      )
    ).true;
    claimRevocation = new ClaimRevocation(
      authority,
      revocationRegistry.address
    );

    await claimRevocation.revokeClaim(
      installerRole,
      `did:ethr:${installerAddr}`,
      `did:ethr:${authorityAddr}`
    );
    expect(
      await claimRevocation.isClaimRevoked(
        installerRole,
        `did:ethr:${installerAddr}`
      )
    ).true;
  });

  it('Role can be revoked for multiple DIDs by authorised revoker, bulk revocation ', async () => {
    await requestRole({
      claimManager,
      roleName: authorityRole,
      agreementSigner: authorityJS,
      proofSigner: authorityJS,
    });
    await requestRole({
      claimManager,
      roleName: installerRole,
      agreementSigner: installerJS,
      proofSigner: authorityJS,
    });
    await requestRole({
      claimManager,
      roleName: installerRole,
      agreementSigner: installer1JS,
      proofSigner: authorityJS,
    });
    expect(
      await claimManager.hasRole(
        installerAddr,
        utils.namehash(installerRole),
        defaultVersion
      )
    ).true;
    expect(
      await claimManager.hasRole(
        installer1Addr,
        utils.namehash(installerRole),
        defaultVersion
      )
    ).true;
    claimRevocation = new ClaimRevocation(
      authority,
      revocationRegistry.address
    );

    await claimRevocation.revokeClaimforDIDs(
      installerRole,
      [`did:ethr:${installer1Addr}`, `did:ethr:${installerAddr}`],
      `did:ethr:${authorityAddr}`
    );
    expect(
      await claimRevocation.isClaimRevoked(
        installerRole,
        `did:ethr:${installerAddr}`
      )
    ).true;

    expect(
      await claimRevocation.isClaimRevoked(
        installerRole,
        `did:ethr:${installer1Addr}`
      )
    ).true;
  });

  it('Role details can be fetched based on role and subject address', async () => {
    await requestRole({
      claimManager,
      roleName: authorityRole,
      agreementSigner: authorityJS,
      proofSigner: authorityJS,
    });
    await requestRole({
      claimManager,
      roleName: installerRole,
      agreementSigner: installerJS,
      proofSigner: authorityJS,
    });
    expect(
      await claimManager.hasRole(
        installerAddr,
        utils.namehash(installerRole),
        defaultVersion
      )
    ).true;
    claimRevocation = new ClaimRevocation(
      authority,
      revocationRegistry.address
    );

    await claimRevocation.revokeClaim(
      installerRole,
      `did:ethr:${installerAddr}`,
      `did:ethr:${authorityAddr}`
    );
    expect(
      await claimRevocation.isClaimRevoked(
        installerRole,
        `did:ethr:${installerAddr}`
      )
    ).true;

    const result = await claimRevocation.getRevocationDetail(
      installerRole,
      `did:ethr:${installerAddr}`
    );
    expect(result.length).to.equal(2);
    expect(result[0]).equal(authorityAddr);
  });

  it('Revocation status should be false if role is not revoked', async () => {
    await requestRole({
      claimManager,
      roleName: authorityRole,
      agreementSigner: authorityJS,
      proofSigner: authorityJS,
    });
    await requestRole({
      claimManager,
      roleName: adminRole,
      agreementSigner: adminJS,
      proofSigner: authorityJS,
    });

    expect(
      await claimRevocation.isClaimRevoked(adminRole, `did:ethr:${adminAddr}`)
    ).false;
  });
}
