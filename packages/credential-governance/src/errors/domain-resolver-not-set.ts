export class DomainResolverNotSet extends Error {
  constructor(node: string) {
    super(`Resolver for domain ${node} is not set`);
  }
}
