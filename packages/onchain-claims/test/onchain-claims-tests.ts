import { ContractFactory, utils } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import {
  abi as RoleDefAbi,
  bytecode as RoleDefBytecode,
} from '@energyweb/credential-governance/build/contracts/RoleDefinitionResolverV2.json';
import {
  abi as PublicResolverAbi,
  bytecode as PublicResolverBytecode,
} from '../build/contracts/PublicResolver.json';
import {
  abi as DomainNotifierAbi,
  bytecode as DomainNotiferBytecode,
} from '../build/contracts/DomainNotifier.json';
import {
  abi as ensAbi,
  bytecode as ensBytecode,
} from '@ensdomains/ens-contracts/artifacts/contracts/registry/ENSRegistry.sol/ENSRegistry.json';
import { claimManagerTests } from './claim-manager-tests/claim-manager-testuite';
import { revocationRegistryTests } from './revocation-registry-testsuite';
import { eip712test } from '../src/eip712.spec';

export const hashLabel = (label: string): string =>
  utils.keccak256(utils.toUtf8Bytes(label));

describe('[ONCHAIN ROLE ENROLMENT]', function () {
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

  describe('EIP712 Test', eip712test);
  describe('ClaimManager Test', claimManagerTests);
  describe('Revocation Test', revocationRegistryTests);
});
