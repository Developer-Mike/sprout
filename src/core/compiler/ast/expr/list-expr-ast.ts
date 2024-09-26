import SourceLocation from "../../source-location"
import ExpressionAST from "./expression-ast"

export default class ListExprAST extends ExpressionAST {
  constructor(
    public elements: ExpressionAST[],
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `[${this.elements.map(e => e.toJavaScript()).join(", ")}]`
  }
}