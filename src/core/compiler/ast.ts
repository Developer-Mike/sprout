import SourceLocation from "./source-location"
import Token from "./token"

export abstract class AST {
  abstract value: any
  abstract sourceLocation: SourceLocation
  abstract toJavaScript(): string
}

export interface Declaration {
  name: string
  readonly: boolean
}

export class ProgramAST {
  tokens: Token[] = [] // For debugging
  nodes: AST[] = []

  constructor(nodes: AST[], tokens: Token[]) {    
    this.nodes = nodes
    this.tokens = tokens
  }

  toJavaScript(): string {
    return this.nodes.map(node => node.toJavaScript()).join("\n")
  }

  getGlobalDeclarations(): Declaration[] {
    return []
  }
}