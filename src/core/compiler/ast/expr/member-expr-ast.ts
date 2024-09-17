import SourceLocation from "../../source-location"
import IdentifierAST from "../identifier-ast"
import ExpressionAST from "./expression-ast"

export default class MemberExprAST extends ExpressionAST {
  constructor(
    public object: IdentifierAST | MemberExprAST,
    public property: IdentifierAST,
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `${this.object.toJavaScript()}.${this.property.toJavaScript()}`
  }
}