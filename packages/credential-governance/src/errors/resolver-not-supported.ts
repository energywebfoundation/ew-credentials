export class ResolverNotSupported extends Error {
  constructor(node: string, resolver: string) {
    super(`Node ${node} is defined on unregistered resolver ${resolver}`);
  }
}
