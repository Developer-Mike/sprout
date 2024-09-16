import SourceLocation from "../source-location"
import ExpressionAST from "./expression-ast"

export default class BreakExprAST extends ExpressionAST {
  constructor(
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return "break"
  }
}