import Parser from "../../parser"
import SourceLocation from "../../source-location"
import BlockStatementAST from "../block-statement-ast"
import ReturnAST from "../return-ast"
import ExpressionAST from "./expression-ast"

export default class IfExprAST extends ExpressionAST {
  constructor(
    parser: Parser,
    public condition: ExpressionAST,
    public thenBody: BlockStatementAST,
    public elseBody: BlockStatementAST | null,
    public override sourceLocation: SourceLocation
  ) { 
    super()

    for (const returnAST of this.getAllASTsOfType(ReturnAST))
      parser.logError('Return statements are not allowed inside if expressions', returnAST.sourceLocation)
  }

  toJavaScript(): string {
    let value = `if (${this.condition.toJavaScript()}) ${this.thenBody.toExprJavaScript()}`
    if (this.elseBody) value += ` else ${this.elseBody.toExprJavaScript()}`
    return `(() => { ${value} })()`
  }
}
