import SourceLocation from "../../source-location"
import AST from "../ast"

export default abstract class ExpressionAST extends AST {
  abstract override sourceLocation: SourceLocation
  abstract override toJavaScript(): string
}