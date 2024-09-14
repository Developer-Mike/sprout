import SourceLocation from "../source-location"
import ExpressionAST from "./expression-ast"

export default class OnExprAST extends ExpressionAST {
  constructor(
    public condition: ExpressionAST, 
    public body: ExpressionAST, 
    public override sourceLocation: SourceLocation
  ) { super() }

  toJavaScript(): string {
    return `;(async () => { 
      while (true) {
        if (${this.condition.toJavaScript()}) {
          ${this.body.toJavaScript()}
        }

        await tick()
      }
    })()`
  }
}