import CompileError from "../compile-error"
import Token from "../token"
import FunctionDefinitionAST from "./function-definition-ast"
import IdentifierExprAST from "./expr/identifier-expr-ast"
import VariableDeclarationAST from "./variable-declaration-ast"
import AST from "./ast"

export default class ProgramAST {
  body: AST[]
  errors: CompileError[]
  tokens: Token[] // For debugging

  constructor(body: AST[], errors: CompileError[], tokens: Token[]) {    
    this.body = body
    this.errors = errors
    this.tokens = tokens
  }

  toJavaScript(): string {
    return this.body.map(node => node.toJavaScript()).join('\n')
  }

  getGlobalDeclarations(): Declaration[] {
    return this.body.map(node => {
      if (node instanceof VariableDeclarationAST) return { readonly: node.constant, name: node.name }
      if (node instanceof FunctionDefinitionAST) return { readonly: true, name: node.proto.name }

      return null
    }).filter(declaration => declaration !== null)
  }
}

export interface Declaration {
  readonly: boolean
  name: IdentifierExprAST
}