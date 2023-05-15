import { providers, utils } from 'ethers';
import {
  DomainReader,
  VOLTA_CHAIN_ID,
  VOLTA_ENS_REGISTRY_ADDRESS,
  VOLTA_PUBLIC_RESOLVER_ADDRESS,
  VOLTA_RESOLVER_V1_ADDRESS,
  VOLTA_RESOLVER_V2_ADDRESS,
  ResolverContractType,
  EWC_CHAIN_ID,
  EWC_ENS_REGISTRY_ADDRESS,
  EWC_RESOLVER_V2_ADDRESS,
} from '../src';

const { namehash } = utils;

const provider = new providers.JsonRpcProvider(
);

async function main() {
  const chainId = (await provider.getNetwork()).chainId;
  let ensRegistryAddress: string;
  let resolverV2Address: string;

  if (chainId === VOLTA_CHAIN_ID) {
    ensRegistryAddress = VOLTA_ENS_REGISTRY_ADDRESS;
    resolverV2Address = VOLTA_RESOLVER_V2_ADDRESS;
  } else if (chainId === EWC_CHAIN_ID) {
    ensRegistryAddress = EWC_ENS_REGISTRY_ADDRESS;
    resolverV2Address = EWC_RESOLVER_V2_ADDRESS;
  } else {
    throw new Error('Unknnown chain');
  }
  const domainReader = new DomainReader({
    ensRegistryAddress,
    provider: provider,
  });

  if (chainId === VOLTA_CHAIN_ID) {
    domainReader.addKnownResolver({
      chainId,
      address: VOLTA_RESOLVER_V1_ADDRESS,
      type: ResolverContractType.RoleDefinitionResolver_v1,
    });
    domainReader.addKnownResolver({
      chainId: VOLTA_CHAIN_ID,
      address: VOLTA_PUBLIC_RESOLVER_ADDRESS,
      type: ResolverContractType.PublicResolver,
    });
  }
  domainReader.addKnownResolver({
    chainId,
    address: resolverV2Address,
    type: ResolverContractType.RoleDefinitionResolver_v2,
  });

  const nodeName = 'mining.roles.2022.apps.gp4btc.energyweb.auth.ewc';

  const domain = await domainReader.read({ node: namehash(nodeName) });
  console.dir(domain, { depth: 10, colors: true });
}

main();
