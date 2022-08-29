export class DefinitionDoesNotMatchResolver extends Error {
  constructor(node: string, definition: string, type: string) {
    super(
      `Node ${node} with definition ${definition} does not match resolver of type ${type}`
    );
  }
}
