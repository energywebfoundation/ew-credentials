/**
 * Script to transfer ownership of an UUPS upgradeable contract
 */
import { ClaimManager__factory } from '../ethers/factories/ClaimManager__factory';
import { providers, Wallet } from 'ethers';

// Gnosis safe address to transfer the ownership to
const safeAddress = '0x94BF7557Aa65cEc2948Bf6B60A1b93xxxxxxxxxx';

//deployed proxy contract address for which ownership needs to be changed
const proxyContractAddress = '0xD9A5D757e991D183Bc1695F912aF7a980450xxxx';
const ownerPrivateKey = 'key of the current owner of the contract';

const provider = new providers.JsonRpcProvider(
  'https://volta-rpc.energyweb.org'
);

const contractExecuter = new Wallet(ownerPrivateKey).connect(provider);

async function main() {
  //Choose the contract for which ownership needs to be changed
  const cm = ClaimManager__factory.connect(
    proxyContractAddress,
    contractExecuter
  );
  console.log('Current owner of the contract' + (await cm.owner()));
  await cm.transferOwnership(safeAddress);
  console.log('New owner of the contract' + (await cm.owner()));
}

main();
