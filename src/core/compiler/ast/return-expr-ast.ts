import SourceLocation from "../source-location"
import ExpressionAST from "./expression-ast"

export default class ReturnExprAST extends ExpressionAST {
  constructor(
    public value: ExpressionAST, 
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `return ${this.value.toJavaScript()}`
  }
}