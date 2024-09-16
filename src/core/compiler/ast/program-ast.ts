import CompileError from "../compile-error"
import Token from "../token"
import AST from "./ast"
import FunctionDefinitionAST from "./function-definition-ast"
import VariableDeclarationAST from "./variable-declaration-ast"

export default class ProgramAST {
  nodes: AST[] = []
  errors: CompileError[] = []
  tokens: Token[] = [] // For debugging

  constructor(nodes: AST[], errors: CompileError[], tokens: Token[]) {    
    this.nodes = nodes
    this.errors = errors
    this.tokens = tokens
  }

  toJavaScript(): string {
    return this.nodes.map(node => node.toJavaScript()).join("\n")
  }

  getGlobalDeclarations(): Declaration[] {
    return this.nodes.map(node => {
      if (node instanceof VariableDeclarationAST) return { readonly: node.constant, name: node.name }
      if (node instanceof FunctionDefinitionAST) return { readonly: true, name: node.proto.name }

      return null
    }).filter(declaration => declaration !== null)
  }
}

export interface Declaration {
  readonly: boolean
  name: string
}