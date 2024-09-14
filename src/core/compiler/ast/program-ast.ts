import Token from "../token"
import AST from "./ast"

export default class ProgramAST {
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

export interface Declaration {
  name: string
  readonly: boolean
}