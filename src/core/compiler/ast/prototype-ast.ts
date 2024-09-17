import SourceLocation from "../source-location";
import AST from "./ast";
import IdentifierAST from "./identifier-ast";

export default class PrototypeAST extends AST {
  constructor(
    public name: IdentifierAST, 
    public args: IdentifierAST[], 
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `${this.name.toJavaScript()}(${this.args.map(arg => arg.toJavaScript()).join(', ')})`
  }
}