import SourceLocation from "../source-location"
import AST from "./ast"

export default class IdentifierAST extends AST {
  constructor(
    public name: string, 
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return this.name
  }
}