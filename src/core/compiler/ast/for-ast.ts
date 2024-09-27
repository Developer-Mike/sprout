import SourceLocation from "../source-location"
import AST from "./ast"
import BlockStatementAST from "./block-statement-ast"
import ExpressionAST from "./expr/expression-ast"

export default class ForAST extends AST {
  constructor(
    public identifier: string,
    public array: ExpressionAST,
    public body: BlockStatementAST,
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    // Avoid errors when identifier is already declared
    return `;(() => { for (let ${this.identifier} of ${this.array.toJavaScript()}) ${this.body.toJavaScript()} })()`
  }
}