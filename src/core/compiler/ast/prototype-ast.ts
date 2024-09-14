import SourceLocation from "../source-location";
import AST from "./ast";

export default class PrototypeAST extends AST {
  constructor(
    public name: string, 
    public args: string[], 
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `function ${this.name}(${this.args.join(", ")})`
  }
}