import { providers } from 'ethers';
import {
  VOLTA_DOMAIN_NOTIFER_ADDRESS,
  VOLTA_ENS_REGISTRY_ADDRESS,
  VOLTA_PUBLIC_RESOLVER_ADDRESS,
} from '../src/chain-constants';
import { DomainHierarchy } from '../src/domain-hierarchy';
import { DomainReader } from '../src';
import { expect } from 'chai';

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
  const domainHierarchy = new DomainHierarchy({
    domainReader,
    ensRegistryAddress: VOLTA_ENS_REGISTRY_ADDRESS,
    provider,
    domainNotifierAddress: VOLTA_DOMAIN_NOTIFER_ADDRESS,
    publicResolverAddress: VOLTA_PUBLIC_RESOLVER_ADDRESS,
  });

  const domain = 'dmitryfesenko.iam.ewc';

  it('getSubdomainsUsingResolver and getSubdomainsUsingRegistry should return same domains', async () => {
    const resolverDomains = await domainHierarchy.getSubdomainsUsingResolver({
      domain: domain,
      mode: 'ALL',
    });
    console.dir(resolverDomains);

    const registryDomains = await domainHierarchy.getSubdomainsUsingRegistry({
      domain: domain,
    });
    console.dir(registryDomains);
    expect(resolverDomains).equal(registryDomains);
  });
});
