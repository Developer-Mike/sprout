import SourceLocation from "../../source-location"
import IdentifierExprAST from "./identifier-expr-ast"
import ExpressionAST from "./expression-ast"
import MemberExprAST from "./member-expr-ast"

export default class CallExprAST extends ExpressionAST {
  constructor(
    public callee: ExpressionAST,
    public args: ExpressionAST[],
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `${this.callee}(${this.args.map(arg => arg.toJavaScript()).join(", ")})`
  }
}