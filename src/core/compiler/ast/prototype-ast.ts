import SourceLocation from "../source-location";
import AST from "./ast";
import IdentifierExprAST from "./expr/identifier-expr-ast";

export default class PrototypeAST extends AST {
  constructor(
    public name: IdentifierExprAST, 
    public args: IdentifierExprAST[], 
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `${this.name.toJavaScript()}(${this.args.map(arg => arg.toJavaScript()).join(', ')})`
  }
}