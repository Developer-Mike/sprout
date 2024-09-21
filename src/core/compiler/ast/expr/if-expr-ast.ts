import SourceLocation from "../../source-location"
import BlockStatementAST from "../block-statement-ast"
import ExpressionAST from "./expression-ast"

export default class IfExprAST extends ExpressionAST {
  constructor(
    public condition: ExpressionAST,
    public thenBody: BlockStatementAST,
    public elseBody: BlockStatementAST | null,
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    let value = `if (${this.condition.toJavaScript()}) ${this.thenBody.toExprJavaScript()}`
    if (this.elseBody) value += ` else ${this.elseBody.toExprJavaScript()}`
    return `(() => { ${value} })()`
  }
}
