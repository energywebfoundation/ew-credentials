import { ClaimManager__factory } from '../ethers/factories/ClaimManager__factory';
import { providers, Wallet } from 'ethers';

const safeAddress = 'gnosis safe address to transfer ownership to';
const proxyContractAddress = 'deployed proxy contract address';

const provider = new providers.JsonRpcProvider(
  'https://volta-rpc.energyweb.org'
);

const deployer = new Wallet(
  'private key of the current owner of the upgradaeble contract'
).connect(provider);

async function main() {
  const cm = ClaimManager__factory.connect(proxyContractAddress, deployer);
  console.log('Current owner of the contract' + (await cm.owner()));
  await cm.transferOwnership(safeAddress);
  console.log('New owner of the contract' + (await cm.owner()));
}

main();
