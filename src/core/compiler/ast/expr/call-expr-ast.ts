import SourceLocation from "../../source-location"
import ExpressionAST from "./expression-ast"

export default class CallExprAST extends ExpressionAST {
  constructor(
    public callee: ExpressionAST,
    public args: ExpressionAST[],
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `${this.callee.toJavaScript()}(${this.args.map(arg => arg.toJavaScript()).join(", ")})`
  }
}