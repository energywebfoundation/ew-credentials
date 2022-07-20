import { providers } from 'ethers';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  VOLTA_CHAIN_ID,
  VOLTA_DOMAIN_NOTIFER_ADDRESS,
  VOLTA_ENS_REGISTRY_ADDRESS,
  VOLTA_PUBLIC_RESOLVER_ADDRESS,
  VOLTA_RESOLVER_V2_ADDRESS,
  DomainHierarchy,
  DomainReader,
  ResolverContractType,
} from '../src';

chai.use(chaiAsPromised);

const { JsonRpcProvider } = providers;

/**
 * This test suite is to retrieval of the suddomains actually
 * on Volta. Not intended to be run during CI/CD
 */
xdescribe('[DomainHierarchy VOLTA]', async function () {
  this.timeout(0);
  const provider = new JsonRpcProvider('https://volta-rpc.energyweb.org');

  const domainReader = new DomainReader({
    ensRegistryAddress: VOLTA_ENS_REGISTRY_ADDRESS,
    provider,
  });
  domainReader.addKnownResolver({
    chainId: VOLTA_CHAIN_ID,
    address: VOLTA_PUBLIC_RESOLVER_ADDRESS,
    type: ResolverContractType.PublicResolver,
  });
  domainReader.addKnownResolver({
    chainId: VOLTA_CHAIN_ID,
    address: VOLTA_RESOLVER_V2_ADDRESS,
    type: ResolverContractType.RoleDefinitionResolver_v2,
  });

  const domainHierarchy = new DomainHierarchy({
    domainReader,
    ensRegistryAddress: VOLTA_ENS_REGISTRY_ADDRESS,
    provider,
    domainNotifierAddress: VOLTA_DOMAIN_NOTIFER_ADDRESS,
    publicResolverAddress: VOLTA_PUBLIC_RESOLVER_ADDRESS,
  });

  const domain = 'iam.ewc';

  it('domains from registry should include domains from resolver', async () => {
    expect(
      await domainHierarchy.getSubdomainsUsingResolver({
        domain: domain,
        mode: 'ALL',
      })
    ).to.include.members(
      await domainHierarchy.getSubdomainsUsingRegistry({
        domain: domain,
      })
    );
  });
});
