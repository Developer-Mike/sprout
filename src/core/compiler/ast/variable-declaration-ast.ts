import SourceLocation from "../source-location"
import AST from "./ast"
import ExpressionAST from "./expression-ast"

export default class VariableDeclarationAST extends AST {
  constructor(
    public constant: boolean,
    public name: string, 
    public value: ExpressionAST | null,
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `${this.constant ? 'const' : 'let'} ${this.name} = ${this.value?.toJavaScript() ?? 'null'}`
  }
}