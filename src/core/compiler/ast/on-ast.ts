import SourceLocation from "../source-location"
import AST from "./ast"
import BlockStatementAST from "./block-statement-ast"
import ExpressionAST from "./expr/expression-ast"

export default class OnAST extends AST {
  constructor(
    public condition: ExpressionAST,
    public body: BlockStatementAST,
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `
      game_object.on.push({
        condition: () => { return ${this.condition.toJavaScript()} },
        callback: async () => ${this.body.toJavaScript()}
      })
    `
  }
}