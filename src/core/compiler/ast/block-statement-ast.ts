import SourceLocation from "../source-location"
import AST from "./ast"

export default class BlockStatementAST extends AST {
  constructor(
    public body: AST[],
    public override sourceLocation: SourceLocation
  ) { super() }

  // TODO: Return a value
  toJavaScript(): string {
    return `{ ${this.body.map((expr) => expr.toJavaScript()).join(';\n')} }`
  }
}