import SourceLocation from "../../source-location"
import ExpressionAST from "./expression-ast"

export default class MemberExprAST extends ExpressionAST {
  constructor(
    public object: ExpressionAST,
    public property: ExpressionAST,
    public optional: boolean,
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `${this.object.toJavaScript()}${this.optional ? "?" : ""}.${this.property.toJavaScript()}`
  }
}