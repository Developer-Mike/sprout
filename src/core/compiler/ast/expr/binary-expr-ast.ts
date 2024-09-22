import SourceLocation from "../../source-location"
import ExpressionAST from "./expression-ast"

export default class BinaryExprAST extends ExpressionAST {
  constructor(
    public operator: string, 
    public lhs: ExpressionAST | null, 
    public rhs: ExpressionAST, 
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `(${this.lhs !== null ? this.lhs.toJavaScript() : ""} ${this.operator} ${this.rhs.toJavaScript()})`
  }
}