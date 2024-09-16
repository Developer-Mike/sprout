import SourceLocation from "./source-location"

export default class CompileError extends Error {
  constructor(message: string, public sourceLocation: SourceLocation) {
    super(message)
  }

  toString(): string {
    return `${this.message} at index ${this.sourceLocation.start}-${this.sourceLocation.end}`
  }
}