import SourceLocation from "../../source-location"
import ExpressionAST from "./expression-ast"

export default class AssignmentExprAST extends ExpressionAST {
  constructor(
    public target: ExpressionAST,
    public value: ExpressionAST,
    public operator: string | null,
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `${this.target.toJavaScript()} ${this.operator ?? ""}= ${this.value.toJavaScript()}`
  }
}