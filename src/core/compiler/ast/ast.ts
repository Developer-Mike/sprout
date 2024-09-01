import SourceLocation from "../source-location"

export default abstract class AST {
  abstract value: any
  abstract sourceLocation: SourceLocation
  abstract toJavaScript(): string
}