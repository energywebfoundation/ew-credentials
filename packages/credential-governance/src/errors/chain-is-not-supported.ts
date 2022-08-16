export class ChainIsNotSupported extends Error {
  constructor(chainId: string | number) {
    super(`Chain ${chainId} is not supported`);
  }
}
