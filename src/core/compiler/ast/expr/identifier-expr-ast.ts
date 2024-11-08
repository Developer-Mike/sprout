import SourceLocation from "../../source-location"
import ExpressionAST from "./expression-ast"

export default class IdentifierExprAST extends ExpressionAST {
  constructor(
    public name: string, 
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return this.name
  }
}