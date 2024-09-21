import SourceLocation from "../source-location"
import AST from "./ast"
import ExpressionAST from "./expr/expression-ast"
import NullExprAST from "./expr/null-expr-ast"

export default class BlockStatementAST extends AST {
  constructor(
    public body: AST[],
    public override sourceLocation: SourceLocation
  ) { super() }

  toExprJavaScript(): string {
    const bodyWithExpr = [...this.body]

    // If the last AST node is not an expression, add null expression
    if (bodyWithExpr[bodyWithExpr.length - 1] !instanceof ExpressionAST)
      bodyWithExpr.push(new NullExprAST(this.sourceLocation))

    return `{
      ${bodyWithExpr.map((expr, index) => {
        if (index === bodyWithExpr.length - 1)
          return `return ${expr.toJavaScript()} ${expr !instanceof NullExprAST ? '?? null' : ''}`
        else return expr.toJavaScript()
      }).join(';\n')}
    }`
  }

  toJavaScript(): string {
    return `{
      ${this.body.map((expr) => expr.toJavaScript()).join(';\n')} 
    }`
  }
}