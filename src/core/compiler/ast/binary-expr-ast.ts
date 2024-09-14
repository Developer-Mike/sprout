import SourceLocation from "../source-location"
import ExpressionAST from "./expression-ast"

export default class BinaryExprAST extends ExpressionAST {
  constructor(
    public left: ExpressionAST, 
    public value: string, 
    public right: ExpressionAST, 
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `(${this.left.toJavaScript()} ${this.value} ${this.right.toJavaScript()})`
  }
}