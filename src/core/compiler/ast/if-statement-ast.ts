import SourceLocation from "../source-location"
import AST from "./ast"
import BlockStatementAST from "./block-statement-ast"
import ExpressionAST from "./expr/expression-ast"

export default class IfStatementAST extends AST {
  constructor(
    public condition: ExpressionAST,
    public thenBody: BlockStatementAST,
    public elseBody: BlockStatementAST | null,
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    let value = `if (${this.condition.toJavaScript()}) ${this.thenBody.toJavaScript()}`
    if (this.elseBody) value += ` else ${this.elseBody.toJavaScript()}`

    return value
  }
}
