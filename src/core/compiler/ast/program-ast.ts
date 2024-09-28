import CompileError from "../compile-error"
import Token from "../token"
import FunctionDefinitionAST from "./function-definition-ast"
import IdentifierExprAST from "./expr/identifier-expr-ast"
import VariableDeclarationAST from "./variable-declaration-ast"
import AST from "./ast"
import SourceLocation from "../source-location"

export default class ProgramAST extends AST {
  sourceLocation: SourceLocation

  constructor(
    public body: AST[],
    public errors: CompileError[], 
    public tokens: Token[] // For debugging
  ) {
    super()
    this.sourceLocation = { start: body[0].sourceLocation.start, end: body[body.length - 1].sourceLocation.end }
  }

  override toJavaScript(): string {
    return this.body.map(node => node.toJavaScript()).join('\n')
  }

  getGlobalDeclarations(): Declaration[] {
    return this.body.map(node => {
      if (node instanceof VariableDeclarationAST) return { readonly: node.constant, identifier: node.name }
      if (node instanceof FunctionDefinitionAST) return { readonly: true, identifier: node.proto.name }

      return null
    }).filter(declaration => declaration !== null)
  }
}

export interface Declaration {
  readonly: boolean
  identifier: IdentifierExprAST
}