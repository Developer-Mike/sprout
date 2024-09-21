import SourceLocation from "../source-location"
import AST from "./ast"
import BlockStatementAST from "./block-statement-ast"
import ExpressionAST from "./expr/expression-ast"

export default class WhileAST extends AST {
  constructor(
    public condition: ExpressionAST,
    public body: BlockStatementAST,
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `while (${this.condition.toJavaScript()}) ${this.body.toJavaScript()}`
  }
}