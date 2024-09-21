import SourceLocation from "../source-location"
import AST from "./ast"

export default class BreakAST extends AST {
  constructor(
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return "break"
  }
}