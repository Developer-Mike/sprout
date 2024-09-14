import SourceLocation from "../source-location"
import ExpressionAST from "./expression-ast"

export default class IfExprAST extends ExpressionAST {
  constructor(
    public condition: ExpressionAST, 
    public thenExpr: ExpressionAST, 
    public elseExpr: ExpressionAST | null, 
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    let value = `if (${this.condition.toJavaScript()}) { ${this.thenExpr.toJavaScript()} }`
    if (this.elseExpr) value += ` else { ${this.elseExpr.toJavaScript()} }`
    return value
  }
}
