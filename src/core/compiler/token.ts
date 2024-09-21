import SourceLocation from "./source-location"

export default class Token {
  type: number
  value: string | null
  location: SourceLocation

  constructor(type: number, value: string | null, endLocation: number, length: number = 1) {
    this.type = type
    this.value = value
    this.location = { start: endLocation - length, end: endLocation }
  }

  toString(): string {
    const typeDescription = TokenType[this.type] || String.fromCharCode(this.type)
    return `Token(${typeDescription}, ${this.value}, ${this.location.start}-${this.location.end})`
  }

  getDebugCategory(): string {
    if ([TokenType.IDENTIFIER].includes(this.type)) return "identifiers"
    if ([TokenType.ASSIGNMENT, TokenType.OPERATOR_ASSIGNMENT, TokenType.SEPARATOR, TokenType.OPTIONAL_OPERATOR, TokenType.PUNCTUATOR, TokenType.BIN_OP].includes(this.type)) return "punctuators"
    if (Object.values(KEYWORDS_MAP).includes(this.type)) return "keywords"
    if (Object.values(BRACKETS_MAP).includes(this.type)) return "brackets"
    if ([TokenType.LITERAL_NUMBER, TokenType.LITERAL_STRING, TokenType.LITERAL_BOOLEAN, TokenType.LITERAL_NULL].includes(this.type)) return "literals"

    return "others"
  }
}

export enum TokenType {
  EOF,
  INVALID,

  IDENTIFIER,
  ASSIGNMENT,
  OPERATOR_ASSIGNMENT,
  SEPARATOR,
  OPTIONAL_OPERATOR,
  PUNCTUATOR,

  PAREN_OPEN,
  PAREN_CLOSE,
  CURLY_OPEN,
  CURLY_CLOSE,
  SQUARE_OPEN,
  SQUARE_CLOSE,

  KEYWORD_VAR,
  KEYWORD_CONST,
  KEYWORD_FUN,

  KEYWORD_RETURN,
  KEYWORD_ON,
  KEYWORD_WHILE,
  KEYWORD_FOR,
  KEYWORD_IN,
  KEYWORD_IF,
  KEYWORD_ELSE,
  KEYWORD_BREAK,
  KEYWORD_CONTINUE,

  BIN_OP,

  LITERAL_NUMBER,
  LITERAL_STRING,
  LITERAL_BOOLEAN,
  LITERAL_NULL,
}

export const BRACKETS_MAP = {
  "(": TokenType.PAREN_OPEN,
  ")": TokenType.PAREN_CLOSE,
  "{": TokenType.CURLY_OPEN,
  "}": TokenType.CURLY_CLOSE,
  "[": TokenType.SQUARE_OPEN,
  "]": TokenType.SQUARE_CLOSE,
} as Record<string, TokenType>

export const KEYWORDS_MAP = {
  "var": TokenType.KEYWORD_VAR,
  "const": TokenType.KEYWORD_CONST,
  "fun": TokenType.KEYWORD_FUN,
  "return": TokenType.KEYWORD_RETURN,
  "on": TokenType.KEYWORD_ON,
  "while": TokenType.KEYWORD_WHILE,
  "for": TokenType.KEYWORD_FOR,
  "in": TokenType.KEYWORD_IN,
  "if": TokenType.KEYWORD_IF,
  "else": TokenType.KEYWORD_ELSE,
  "break": TokenType.KEYWORD_BREAK,
  "continue": TokenType.KEYWORD_CONTINUE,
} as Record<string, TokenType>