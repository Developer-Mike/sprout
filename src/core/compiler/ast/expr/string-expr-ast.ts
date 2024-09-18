import SourceLocation from "../../source-location"
import ExpressionAST from "./expression-ast"

export default class StringExprAST extends ExpressionAST {
  constructor(
    public value: string, 
    public override sourceLocation: SourceLocation
  ) { super() }
  
  toJavaScript(): string {
    // Wrap the string in quotes to allow calling methods on it
    return `("${this.value}")`
  }
}