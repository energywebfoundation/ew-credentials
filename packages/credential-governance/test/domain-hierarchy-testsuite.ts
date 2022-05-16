import { ContractFactory, utils, providers, constants } from 'ethers';
import { DomainHierarchy } from '../src/domain-hierarchy';
import {
  DomainReader,
  DomainTransactionFactoryV2,
  EncodedCall,
  IRoleDefinitionV2,
  ResolverContractType,
} from '../src';
import { ENSRegistry } from '../ethers/ENSRegistry';
import { RoleDefinitionResolverV2 } from '../ethers/RoleDefinitionResolverV2';
import { DomainNotifier } from '../ethers/DomainNotifier';
import { PublicResolver } from '../ethers/PublicResolver';
import { hashLabel } from './credential-governance-test';
import { expect } from 'chai';
import { LegacyDomainDefTransactionFactory } from './legacy-domain-def-transaction-factory';
import { RoleDefinitionResolverV2__factory } from '../ethers/factories/RoleDefinitionResolverV2__factory';

const { AddressZero } = constants;

let ensFactory: ContractFactory;
let domainNotifierFactory: ContractFactory;
let publicResolverFactory: ContractFactory;
let ensRegistry: ENSRegistry;
let ensRoleDefResolverV2: RoleDefinitionResolverV2;
let domainNotifier: DomainNotifier;
let ensPublicResolver: PublicResolver;
let owner: providers.JsonRpcSigner;
let provider: providers.JsonRpcProvider;
let chainId: number;

let domainReader: DomainReader;
let domainHierarchy: DomainHierarchy;

const domain = 'ewc';
const node = utils.namehash(domain);

const addSubdomain = async (parentDomain: string, label: string) => {
  const rootNode = utils.namehash(parentDomain);
  const subdomain = `${label}.${parentDomain}`;
  const subNode = utils.namehash(subdomain);
  await ensRegistry.setSubnodeOwner(
    rootNode,
    hashLabel(label),
    await owner.getAddress()
  );
  let call: EncodedCall;
  await ensRegistry.setResolver(subNode, ensRoleDefResolverV2.address);
  const domainDefTxFactory = new DomainTransactionFactoryV2({
    domainResolverAddress: ensRoleDefResolverV2.address,
  });
  call = domainDefTxFactory.newRole({
    domain: subdomain,
    roleDefinition: role,
  });
  await (await owner.sendTransaction(call)).wait();
};

const role: IRoleDefinitionV2 = {
  requestorFields: [],
  issuerFields: [],
  issuer: {
    issuerType: 'DID',
    did: [`did:ethr:volta:0x7aA65E31d404A8857BA083f6195757a730b51CFe`],
  },
  revoker: {
    revokerType: 'DID',
    did: [`did:ethr:volta:0x7aA65E31d404A8857BA083f6195757a730b51CFe`],
  },
  metadata: [],
  roleName: 'myRole',
  roleType: 'test',
  version: 1,
  enrolmentPreconditions: [],
};

export function domainHierarchyTestSuite(): void {
  describe('DomainHierarchy', () => {
    before(async function () {
      ({
        publicResolverFactory,
        ensFactory,
        domainNotifierFactory,
        provider,
        owner,
        chainId,
      } = this);
    });

    beforeEach(async () => {
      ensRegistry = (await ensFactory.deploy()) as ENSRegistry;
      await ensRegistry.deployed();
      domainNotifier = (await domainNotifierFactory.deploy(
        ensRegistry.address
      )) as DomainNotifier;
      await domainNotifier.deployed();
      ensRoleDefResolverV2 = await new RoleDefinitionResolverV2__factory(
        owner
      ).deploy(ensRegistry.address, domainNotifier.address);
      await ensRoleDefResolverV2.deployed();
      ensPublicResolver = (await publicResolverFactory.deploy(
        ensRegistry.address
      )) as PublicResolver;
      await ensPublicResolver.deployed();

      domainReader = new DomainReader({
        ensRegistryAddress: ensRegistry.address,
        provider,
      });
      domainReader.addKnownResolver({
        chainId,
        address: ensRoleDefResolverV2.address,
        type: ResolverContractType.RoleDefinitionResolver_v2,
      });
      domainReader.addKnownResolver({
        chainId,
        address: ensPublicResolver.address,
        type: ResolverContractType.PublicResolver,
      });

      domainHierarchy = new DomainHierarchy({
        domainReader,
        provider,
        ensRegistryAddress: ensRegistry.address,
        domainNotifierAddress: domainNotifier.address,
        resolverAddress: ensRoleDefResolverV2.address,
      });

      // Register and set resolver for parent node
      const rootNameHash =
        '0x0000000000000000000000000000000000000000000000000000000000000000';
      await ensRegistry.setSubnodeOwner(
        rootNameHash,
        hashLabel(domain),
        await owner.getAddress()
      );
      expect(await ensRegistry.owner(node)).to.equal(await owner.getAddress());
      await ensRegistry.setResolver(node, ensRoleDefResolverV2.address);
      const domainDefTxFactoryV2 = new DomainTransactionFactoryV2({
        domainResolverAddress: ensRoleDefResolverV2.address,
      });
      const callV2 = domainDefTxFactoryV2.newRole({
        domain: domain,
        roleDefinition: role,
      });
      await (await owner.sendTransaction(callV2)).wait();
    });

    describe('getSubdomainsUsingResolver', () => {
      it('returns subdomains using RoleDefResolver', async () => {
        await Promise.all([
          addSubdomain('ewc', 'test'),
          addSubdomain('ewc', 'iam'),
        ]);
        const subDomains = await domainHierarchy.getSubdomainsUsingResolver({
          domain: domain,
          mode: 'ALL',
        });
        expect(subDomains.length).to.equal(2);
      });

      it("continues even if domain isn't registered", async () => {
        await Promise.all([
          addSubdomain('ewc', 'test'),
          addSubdomain('ewc', 'iam'),
        ]);

        // deregister namespace by setting resolver to zero address
        await ensRegistry.setResolver(utils.namehash('iam.ewc'), AddressZero);

        const subDomains = await domainHierarchy.getSubdomainsUsingResolver({
          domain,
          mode: 'ALL',
        });
        expect(subDomains.length).to.equal(1);
      });

      it('returns subdomains using PublicResolver', async () => {
        await Promise.all([
          addSubdomain('ewc', 'test'),
          addSubdomain('ewc', 'iam'),
        ]);
        const subDomains = await domainHierarchy.getSubdomainsUsingResolver({
          domain: domain,
          mode: 'ALL',
        });
        expect(subDomains.length).to.equal(2);
      });

      it('returns subdomains using PublicResolver and RoleDefResolver', async () => {
        await Promise.all([
          addSubdomain('ewc', 'test'),
          addSubdomain('ewc', 'iam'),
        ]);
        const subDomains = await domainHierarchy.getSubdomainsUsingResolver({
          domain: domain,
          mode: 'ALL',
        });
        expect(subDomains.length).to.equal(2);
      });

      it('filter out apps and roles domains and subdomains (mode: ALL)', async () => {
        await addSubdomain('ewc', 'iam');
        await Promise.all([
          addSubdomain('iam.ewc', 'apps'),
          addSubdomain('iam.ewc', 'roles'),
        ]);
        await Promise.all([
          addSubdomain('apps.iam.ewc', 'flex'),
          addSubdomain('roles.iam.ewc', 'operator'),
        ]);
        await addSubdomain('flex.apps.iam.ewc', 'roles');
        await Promise.all([
          addSubdomain('roles.flex.apps.iam.ewc', 'tso'),
          addSubdomain('roles.flex.apps.iam.ewc', 'dso'),
        ]);
        const subDomains = await domainHierarchy.getSubdomainsUsingResolver({
          domain: domain,
          mode: 'ALL',
        });

        expect(subDomains).to.contains('iam.ewc');
        expect(subDomains).to.contains('flex.apps.iam.ewc');
        expect(subDomains).to.contains('operator.roles.iam.ewc');
        expect(subDomains).to.contains('tso.roles.flex.apps.iam.ewc');
        expect(subDomains).to.contains('dso.roles.flex.apps.iam.ewc');
        expect(subDomains.length).to.equal(5);
      });

      it('filter out apps and roles domains and subdomains (mode: FIRSTLEVEL)', async () => {
        await Promise.all([
          addSubdomain('ewc', 'apps'),
          addSubdomain('ewc', 'roles'),
          addSubdomain('ewc', 'iam'),
          addSubdomain('ewc', 'flex'),
        ]);
        await Promise.all([
          addSubdomain('iam.ewc', 'apps'),
          addSubdomain('iam.ewc', 'roles'),
          addSubdomain('apps.ewc', 'flex'),
          addSubdomain('roles.ewc', 'operator'),
        ]);
        await Promise.all([
          addSubdomain('apps.iam.ewc', 'flex'),
          addSubdomain('roles.iam.ewc', 'operator'),
        ]);
        const subDomains = await domainHierarchy.getSubdomainsUsingResolver({
          domain: domain,
          mode: 'FIRSTLEVEL',
        });

        expect(subDomains).to.contains('iam.ewc');
        expect(subDomains).to.contains('flex.ewc');
        expect(subDomains.length).to.equal(2);
      });
    });

    describe('getSubdomainsUsingRegistry', () => {
      it('returns subdomains', async () => {
        await Promise.all([
          addSubdomain('ewc', 'test'),
          addSubdomain('ewc', 'iam'),
        ]);
        const subDomains = await domainHierarchy.getSubdomainsUsingRegistry({
          domain: domain,
        });
        expect(subDomains.length).to.equal(3);
      });

      it("continues even if domain isn't registered", async () => {
        await Promise.all([
          addSubdomain('ewc', 'test'),
          addSubdomain('ewc', 'iam'),
        ]);

        // deregister namespace by setting resolver to zero address
        const emptyAddress = '0x'.padEnd(42, '0');
        await ensRegistry.setResolver(utils.namehash('iam.ewc'), emptyAddress);

        const subDomains = await domainHierarchy.getSubdomainsUsingRegistry({
          domain: domain,
        });
        expect(subDomains.length).to.equal(2);
      });
    });

    // TODO: Test multi-level
  });
}
