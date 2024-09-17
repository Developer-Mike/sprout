import SourceLocation from "../source-location"
import AST from "./ast"
import BlockStatementAST from "./block-statement"
import ExpressionAST from "./expr/expression-ast"

export default class OnExprAST extends AST {
  constructor(
    public condition: ExpressionAST, 
    public body: BlockStatementAST, 
    public override sourceLocation: SourceLocation
  ) { super() }

  // TODO: Handle it with artificial AST nodes
  toJavaScript(): string {
    return `;(async () => { 
      while (true) {
        if (${this.condition.toJavaScript()}) ${this.body.toJavaScript()}

        await tick()
      }
    })()`
  }
}