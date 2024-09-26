import SourceLocation from "../source-location"
import AST from "./ast"

export default class UnsubscribeAST extends AST {
  constructor(
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return "return true"
  }
}