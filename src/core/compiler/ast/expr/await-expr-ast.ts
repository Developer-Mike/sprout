import SourceLocation from "../../source-location"
import ExpressionAST from "./expression-ast"

export default class AwaitExprAST extends ExpressionAST {
  constructor(
    public expression: ExpressionAST,
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `await ${this.expression.toJavaScript()}`
  }
}