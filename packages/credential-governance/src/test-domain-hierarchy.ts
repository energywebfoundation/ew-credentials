import { DomainHierarchy } from './domain-hierarchy';
import { DomainReader } from './domain-reader';
import { VOLTA_CHAIN_ID, VOLTA_DOMAIN_NOTIFER_ADDRESS, VOLTA_ENS_REGISTRY_ADDRESS, VOLTA_PUBLIC_RESOLVER_ADDRESS, VOLTA_RESOLVER_V1_ADDRESS, VOLTA_RESOLVER_V2_ADDRESS } from './chain-constants';
import { providers } from 'ethers';
import { ResolverContractType } from './types/resolver-contract-type';

const provider = new providers.JsonRpcProvider(
    'https://volta-rpc.energyweb.org/'
  );
  
const domainReader = new DomainReader({
    ensRegistryAddress: VOLTA_ENS_REGISTRY_ADDRESS,
    provider: provider,
  });

  domainReader.addKnownResolver({
    chainId: VOLTA_CHAIN_ID,
    address: VOLTA_RESOLVER_V2_ADDRESS,
    type: ResolverContractType.RoleDefinitionResolver_v2,
  });
  domainReader.addKnownResolver({
    chainId: VOLTA_CHAIN_ID,
    address: VOLTA_RESOLVER_V1_ADDRESS,
    type: ResolverContractType.RoleDefinitionResolver_v1,
  });
  domainReader.addKnownResolver({
    chainId: VOLTA_CHAIN_ID,
    address: VOLTA_PUBLIC_RESOLVER_ADDRESS,
    type: ResolverContractType.PublicResolver,
  });

const domainHierarchy = new DomainHierarchy({
    domainReader: domainReader,
    ensRegistryAddress: VOLTA_ENS_REGISTRY_ADDRESS,
    provider: provider,
    domainNotifierAddress: VOLTA_DOMAIN_NOTIFER_ADDRESS,
    publicResolverAddress: VOLTA_PUBLIC_RESOLVER_ADDRESS,
  });

async function main() {
    const domains = await domainHierarchy.getSubdomainsUsingResolver({
      domain: 'iam.ewc',
      mode: 'ALL',
    });
    // Sorting to reduce "parent namespace does not exists" type errors
    console.log(domains);
  }

main()