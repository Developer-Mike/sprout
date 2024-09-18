import SourceLocation from "../source-location"
import AST from "./ast"
import ExpressionAST from "./expr/expression-ast"
import IdentifierExprAST from "./expr/identifier-expr-ast"

export default class VariableDeclarationAST extends AST {
  constructor(
    public constant: boolean,
    public name: IdentifierExprAST, 
    public value: ExpressionAST,
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `${this.constant ? 'const' : 'let'} ${this.name.toJavaScript()} = ${this.value?.toJavaScript()}`
  }
}