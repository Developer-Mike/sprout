import SourceLocation from "../../source-location"
import ExpressionAST from "./expression-ast"

export default class MemberExprAST extends ExpressionAST {
  constructor(
    public object: ExpressionAST,
    public property: ExpressionAST,
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `${this.object.toJavaScript()}.${this.property.toJavaScript()}`
  }
}