import SourceLocation from "../source-location"
import AST from "./ast"
import ExpressionAST from "./expr/expression-ast"

export default class BlockStatementAST extends AST {
  constructor(
    public body: ExpressionAST[],
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `{ ${this.body.map((expr) => expr.toJavaScript()).join(';\n')} }`
  }
}