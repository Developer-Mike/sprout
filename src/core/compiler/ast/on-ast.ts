import SourceLocation from "../source-location"
import AST from "./ast"
import BlockStatementAST from "./block-statement-ast"
import IfExprAST from "./expr/if-expr-ast"
import ExpressionAST from "./expr/expression-ast"

export default class OnAST extends AST {
  constructor(
    public condition: ExpressionAST,
    public body: BlockStatementAST,
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    // Handle if expression using artificial AST node
    const ifExpr = new IfExprAST(this.condition, this.body, null, this.sourceLocation)

    return `;(async () => { 
      while (true) {
        ${ifExpr.toJavaScript()}

        await tick()
      }
    })()`
  }
}