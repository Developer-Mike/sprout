import SourceLocation from "../source-location"
import ExpressionAST from "./expression-ast"

export default class NumberExprAST extends ExpressionAST {
  constructor(
    public value: number, 
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return this.value.toString()
  }
}