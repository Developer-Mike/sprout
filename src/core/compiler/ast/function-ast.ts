import SourceLocation from "../source-location"
import AST from "./ast"
import ExpressionAST from "./expression-ast"
import PrototypeAST from "./prototype-ast"

export default class FunctionAST extends AST {
  constructor(
    public name: string, 
    public proto: PrototypeAST,
    public body: ExpressionAST, 
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `function ${this.name}(${this.proto.toJavaScript()}) { ${this.body.toJavaScript()} }`
  }
}