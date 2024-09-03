import Token, { BRACKETS_MAP, KEYWORDS_MAP, TokenType } from "./token"

export default class Lexer {
  source: string[] = []
  currentLocation: number = 0

  private get currentChar() {
    return this.source[0]
  }

  private get nextChar() {
    return this.source[1]
  }

  lex(source: string): Token[] {
    this.source = source.split("")
    this.currentLocation = 0

    const tokens: Token[] = []

    let token: Token
    do {
      token = this.getNextToken()
      tokens.push(token)
    } while (token.type !== TokenType.EOF)

    return tokens
  }

  private eatChar() {
    this.source.shift()
    this.currentLocation++
  }

  // For eating e.g. "*/" or "=="
  private eatCharTwice() {
    this.eatChar()
    this.eatChar()
  }

  private getNextToken(): Token {
    // Check for EOF
    if (this.currentChar === undefined) {
      return new Token(TokenType.EOF, null, this.currentLocation, 0)
    }

    // Ignore spaces
    while (this.currentChar === " " || this.currentChar === "\t" || this.currentChar === "\v" || this.currentChar === "\f") {
      this.eatChar()
    }

    // Check for unix/DOS EOL -> Ignore multiple line breaks
    if (this.currentChar === "\n" || this.currentChar === "\r") {
      do {
        this.eatChar() // Eat EOL
      } while (this.currentChar === "\n" || this.currentChar === "\r")

      return new Token(TokenType.EOL, null, this.currentLocation, 0)
    }

    // Handle comments - Skip comment and return next token
    if (this.currentChar === "/") {
      if (this.nextChar === "/") {
        do {
          this.eatChar()
        // @ts-ignore - TS doesn't know that currentChar gets updated in the loop
        } while (this.currentChar !== "\n" && this.currentChar !== "\r" && this.currentChar !== undefined)

        return this.getNextToken()
      }

      // Multiline comment
      if (this.nextChar === "*") {
        this.eatChar() // Eat "/"

        do {
          this.eatChar()

          // Check if beginning of an ending tag
          // @ts-ignore - TS doesn't know that currentChar and nextChar get updated in the loop
          if (this.currentChar === "*" && this.nextChar === "/") {
            this.eatCharTwice() // Eat "*/"
            break
          }
        } while (this.currentChar !== undefined)

        return this.getNextToken()
      }
    }

    // Check for brackets
    if (this.currentChar in BRACKETS_MAP) {
      const bracketType = BRACKETS_MAP[this.currentChar]
      this.eatChar()
      return new Token(bracketType, null, this.currentLocation)
    }

    // Check for separator
    if (this.currentChar === ",") {
      this.eatChar()
      return new Token(TokenType.SEPARATOR, null, this.currentLocation)
    }

    // Check for identifier
    if (this.currentChar?.match(/[a-zA-Z_]/)) {
      let identifier = ""

      do {
        identifier += this.currentChar
        this.eatChar()
      } while (this.currentChar?.match(/[a-zA-Z0-9_]/))

      // Check for boolean
      if (identifier === "true" || identifier === "false") {
        return new Token(TokenType.LITERAL_BOOLEAN, identifier, this.currentLocation, identifier.length)
      }

      // Check for null
      if (identifier === "null") {
        return new Token(TokenType.LITERAL_NULL, null, this.currentLocation, identifier.length)
      }

      // Check for keywords
      const keyword = KEYWORDS_MAP[identifier]

      return keyword !== undefined ?
        new Token(keyword, null, this.currentLocation, identifier.length) :
        new Token(TokenType.IDENTIFIER, identifier, this.currentLocation, identifier.length)
    }

    // Check for string
    if (this.currentChar === "\"") {
      let string = ""
      this.eatChar() // Eat opening quote

      let escaped = false
      do {
        string += this.currentChar
        // @ts-ignore - TS doesn't know that currentChar gets updated
        escaped = !escaped && this.currentChar === "\\"

        this.eatChar()
      } while (this.currentChar !== "\"" || escaped)

      this.eatChar() // Eat closing quote
      return new Token(TokenType.LITERAL_STRING, string, this.currentLocation, string.length + 2) // Include quotes
    }

    // Check for number
    if (this.currentChar?.match(/[0-9\.]/)) {
      let number = ""

      do {
        number += this.currentChar
        this.eatChar()
      } while (this.currentChar?.match(/[0-9\.]/))

      return new Token(TokenType.LITERAL_NUMBER, number, this.currentLocation, number.length)
    }

    // Check for equality check or assignment
    if (this.currentChar === "=") {
      if (this.nextChar === "=") {
        this.eatCharTwice()
        return new Token(TokenType.BIN_OP, "==", this.currentLocation, 2)
      } else {
        this.eatChar()
        return new Token(TokenType.ASSIGNMENT, null, this.currentLocation)
      }
    }

    // Check for binary operators
    if (this.currentChar === "+" || this.currentChar === "-" || this.currentChar === "/" || this.currentChar === "*" || this.currentChar === "%") {
      const binOp = this.currentChar

      this.eatChar()
      return new Token(TokenType.BIN_OP, binOp, this.currentLocation)
    }

    // Check for binary operators with possible following "="
    if (this.currentChar === "<" || this.currentChar === ">") {
      let binOp = this.currentChar
      this.eatChar()

      // @ts-ignore - TS doesn't know that currentChar gets updated
      if (this.currentChar === "=") {
        binOp += "="
        this.eatChar()
      }

      return new Token(TokenType.BIN_OP, binOp, this.currentLocation, binOp.length)
    }

    // If not identified
    const invalidChar = this.currentChar
    this.eatChar()
    return new Token(TokenType.INVALID, invalidChar, this.currentLocation)
  }
}