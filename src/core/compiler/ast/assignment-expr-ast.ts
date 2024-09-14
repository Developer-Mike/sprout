import SourceLocation from "../source-location"
import ExpressionAST from "./expression-ast"

export default class AssignmentExprAST extends ExpressionAST {
  constructor(
    public name: string, 
    public value: ExpressionAST, 
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `${this.name} = ${this.value.toJavaScript()}`
  }
}