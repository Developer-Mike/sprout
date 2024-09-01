import SourceLocation from "./source-location"

export default class Token {
  type: number
  value: string | null
  location: SourceLocation

  constructor(type: number, value: string | null, startLocation: number, endLocation?: number) {
    this.type = type
    this.value = value
    this.location = { start: startLocation, end: endLocation || startLocation }
  }

  toString(): string {
    const typeDescription = TokenType[this.type] || String.fromCharCode(this.type)
    return `Token(${typeDescription}, ${this.value})`
  }
}

export enum TokenType {
  EOF = -1,
  EOL = -2,
  INVALID = -3,

  IDENTIFIER = -4,
  ASSIGNMENT = -5,
  ARGUMENTS = -6,
  SEPARATOR = -7,

  BIN_OP = -8,

  NUMBER = -9
}