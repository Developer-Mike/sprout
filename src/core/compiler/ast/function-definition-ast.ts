import SourceLocation from "../source-location"
import AST from "./ast"
import ExpressionAST from "./expression-ast"
import PrototypeAST from "./prototype-ast"

export default class FunctionDefinitionAST extends AST {
  constructor(
    public proto: PrototypeAST,
    public body: ExpressionAST | null, 
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `function ${this.proto.toJavaScript()} { ${this.body?.toJavaScript() ?? ''} }`
  }
}