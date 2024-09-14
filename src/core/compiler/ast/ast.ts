import SourceLocation from "../source-location"

export default abstract class AST {
  abstract sourceLocation: SourceLocation
  abstract toJavaScript(): string
}