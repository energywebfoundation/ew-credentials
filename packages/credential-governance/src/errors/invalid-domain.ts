export class InvalidDomain extends Error {
  constructor(node: string, definition: unknown) {
    super(`Node ${node} has invalid definition ${definition}}`);
  }
}
