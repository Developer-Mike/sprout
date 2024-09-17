import SourceLocation from "../source-location"
import AST from "./ast"
import ExpressionAST from "./expr/expression-ast"
import IdentifierAST from "./identifier-ast"

export default class VariableDeclarationAST extends AST {
  constructor(
    public constant: boolean,
    public name: IdentifierAST, 
    public value: ExpressionAST,
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `${this.constant ? 'const' : 'let'} ${this.name.toJavaScript()} = ${this.value?.toJavaScript()}`
  }
}