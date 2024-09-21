import SourceLocation from "../source-location"
import AST from "./ast"
import ExpressionAST from "./expr/expression-ast"
import NullExprAST from "./expr/null-expr-ast"

export default class ReturnAST extends AST {
  constructor(
    public value: ExpressionAST | null,
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    // Default to null if no value is provided
    return `return ${this.value ? this.value.toJavaScript() : new NullExprAST(this.sourceLocation).toJavaScript()}`
  }
}