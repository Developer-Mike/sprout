import SourceLocation from "../../source-location"
import IdentifierExprAST from "./identifier-expr-ast"
import ExpressionAST from "./expression-ast"

export default class AssignmentExprAST extends ExpressionAST {
  constructor(
    public identifier: IdentifierExprAST,
    public value: ExpressionAST,
    public operator: string | null,
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `${this.identifier.toJavaScript()} ${this.operator ?? ""}= ${this.value.toJavaScript()}`
  }
}