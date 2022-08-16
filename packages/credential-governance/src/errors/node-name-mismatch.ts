export class NodeNameMismatch extends Error {
  constructor(node: string, name: string) {
    super(`Node name ${name} does not correspond to node hash ${node}`);
  }
}
