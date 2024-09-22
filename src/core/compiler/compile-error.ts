import SourceLocation from "./source-location"

export default class CompileError extends Error {
  constructor(message: string, public location: SourceLocation) {
    super(message)
  }

  toString(): string {
    return `${this.message} at index ${this.location.start}-${this.location.end}`
  }
}