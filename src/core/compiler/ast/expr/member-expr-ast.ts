import SourceLocation from "../../source-location"
import CallExprAST from "./call-expr-ast"
import ExpressionAST from "./expression-ast"
import IdentifierExprAST from "./identifier-expr-ast"

export default class MemberExprAST extends ExpressionAST {
  constructor(
    public object: ExpressionAST,
    public property: ExpressionAST,
    public optional: boolean,
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    const dotAccessible = this.property instanceof IdentifierExprAST || this.property instanceof CallExprAST
    return `${this.object.toJavaScript()}${this.optional ? "?" : ""}${dotAccessible ? `.${this.property.toJavaScript()}` : `[${this.property.toJavaScript()}]`}`
  }
}