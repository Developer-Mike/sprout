import SourceLocation from "../../source-location"
import ExpressionAST from "./expression-ast"

export default class UnaryExprAst extends ExpressionAST {
  constructor(
    public operator: string,
    public prefix: boolean,
    public operand: ExpressionAST,
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `${this.prefix ? this.operator : ""}${this.operand.toJavaScript()}${this.prefix ? "" : this.operator}`
  }
}