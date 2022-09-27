import { ContractFactory, utils } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import {
  abi as RoleDefAbi,
  bytecode as RoleDefBytecode,
} from '@energyweb/credential-governance/build/contracts/RoleDefinitionResolverV2.json';
import {
  abi as PublicResolverAbi,
  bytecode as PublicResolverBytecode,
} from '@energyweb/credential-governance/build/contracts/PublicResolver.json';
import {
  abi as DomainNotifierAbi,
  bytecode as DomainNotiferBytecode,
} from '@energyweb/credential-governance/build/contracts/DomainNotifier.json';
import {
  abi as ensAbi,
  bytecode as ensBytecode,
} from '@ensdomains/ens-contracts/artifacts/contracts/registry/ENSRegistry.sol/ENSRegistry.json';
import { claimIssuerVerificationTests } from './claim-issuer-verification';
import { vcIssuerVerificationTests } from './vc-issuer-verification';
import { revocationVerificationTests } from './vc-revocation-test';
import { issuerVerificationTests } from './issuer-verification-test';
import { cacheTests } from './cache-tests';

export const hashLabel = (label: string): string =>
  utils.keccak256(utils.toUtf8Bytes(label));

describe('[VC Verificaiton]', function () {
  this.timeout(0);
  const provider = new JsonRpcProvider('http://localhost:8544');
  const deployer = provider.getSigner(1);

  before(async function () {
    const owner = provider.getSigner(1);
    const anotherAccount = provider.getSigner(2);

    const publicResolverFactory = new ContractFactory(
      PublicResolverAbi,
      PublicResolverBytecode,
      deployer
    );
    const roleDefResolverFactory = new ContractFactory(
      RoleDefAbi,
      RoleDefBytecode,
      deployer
    );
    const ensFactory = new ContractFactory(ensAbi, ensBytecode, deployer);
    const domainNotifierFactory = new ContractFactory(
      DomainNotifierAbi,
      DomainNotiferBytecode,
      deployer
    );

    const { chainId } = await provider.getNetwork();

    Object.assign(this, {
      publicResolverFactory,
      roleDefResolverFactory,
      ensFactory,
      domainNotifierFactory,
      owner,
      anotherAccount,
      provider,
      chainId,
    });
  });

  describe('Verification of issuer and authoritative credentials', () => {
    describe(
      'Cache test for RoleDefinition, role credential, DID Document',
      cacheTests
    );
    describe('Issuer Chain with RoleEIP191Jwt', claimIssuerVerificationTests);
    describe(
      'Issuer Chain with Verifiable Credentials',
      vcIssuerVerificationTests
    );
    describe('Issuer with either VC or RoleEIP191Jwt', issuerVerificationTests);
  });

  describe('Verification of revocation', revocationVerificationTests);
});
