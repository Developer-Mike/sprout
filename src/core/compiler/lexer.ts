import Token, { TokenType } from "./token"

export default class Lexer {
  source: string[] = []
  currentChar: string | undefined = " "
  nextChar: string | undefined = " "
  currentLocation: number = 0

  lex(source: string): Token[] {
    this.source = source.split("")
    this.reset()

    const tokens: Token[] = []

    do {
      tokens.push(this.getNextToken())
    } while (tokens[tokens.length - 1].type !== TokenType.EOF)

    return tokens
  }

  private reset() {
    this.currentChar = undefined
    this.nextChar = this.source.shift()

    this.currentLocation = -1
    this.getNextChar()
  }

  private getNextChar() {
    this.currentChar = this.nextChar
    this.nextChar = this.source.shift()
    this.currentLocation++
  }

  // For eating e.g. "*/" or "=="
  private getNextCharTwice() {
    this.getNextChar()
    this.getNextChar()
  }

  private getNextToken(): Token {
    // Check for EOF
    if (this.currentChar === undefined) {
      return new Token(TokenType.EOF, null, this.currentLocation)
    }

    // Ignore spaces
    while (this.currentChar === " " || this.currentChar === "\t" || this.currentChar === "\v" || this.currentChar === "\f") {
      this.getNextChar()
    }

    // Check for unix/DOS EOL -> Ignore multiple line breaks
    if (this.currentChar === "\n" || this.currentChar === "\r") {
      do {
        this.getNextChar() // Eat EOL
      } while (this.currentChar === "\n" || this.currentChar === "\r")

      return new Token(TokenType.EOL, null, this.currentLocation)
    }

    // Handle comments - Skip comment and return next token
    if (this.currentChar === "/") {
      if (this.nextChar === "/") {
        do {
          this.getNextChar()
        // @ts-ignore - TS doesn't know that currentChar gets updated in the loop
        } while (this.currentChar !== "\n" && this.currentChar !== "\r" && this.currentChar !== undefined)

        return this.getNextToken()
      }

      // Multiline comment
      if (this.nextChar === "*") {
        this.getNextChar() // Eat "/"

        do {
          this.getNextChar()

          // Check if beginning of an ending tag
          // @ts-ignore - TS doesn't know that currentChar and nextChar get updated in the loop
          if (this.currentChar === "*" && this.nextChar === "/") {
            this.getNextCharTwice() // Eat "*/"
            break
          }
        } while (this.currentChar !== undefined)

        return this.getNextToken()
      }
    }

    // Check for identifier
    if (this.currentChar?.match(/[a-zA-Z_]/)) {
      let identifier = ""

      do {
        identifier += this.currentChar
        this.getNextChar()
      } while (this.currentChar?.match(/[a-zA-Z0-9_]/))
      
      return new Token(TokenType.IDENTIFIER, identifier, this.currentLocation)
    }

    // Check for number
    if (this.currentChar?.match(/[0-9\.]/)) {
      let number = ""

      do {
        number += this.currentChar
        this.getNextChar()
      } while (this.currentChar?.match(/[0-9\.]/))

      return new Token(TokenType.NUMBER, number, this.currentLocation)
    }

    // Check for assignment or equality check
    if (this.currentChar === "=" && this.nextChar !== "=") {
      this.getNextChar()
      return new Token(TokenType.ASSIGNMENT, null, this.currentLocation)
    }

    // If not identified
    const invalidChar = this.currentChar
    this.getNextChar()
    return new Token(TokenType.INVALID, invalidChar, this.currentLocation)
  }
}

/*
// Check for argument
// Check for separator

// Binary operators
if (currentChar == '+' || currentChar == '-' || currentChar == '/' || currentChar == '*') {
  std::string bin_op = { (char) currentChar };
  getNextChar(&currentChar, &nextChar);
  return { tok_bin_op, bin_op };
}

// Binary operators with possible following =
if (currentChar == '=' || currentChar == '<' || currentChar == '>') {
  std::string bin_op = { (char) currentChar };

  if (nextChar == '=') {
    bin_op.push_back(nextChar);
    getNextChar(&currentChar, &nextChar);
  } else if (currentChar == '=') bin_op.push_back('='); // Make double equals even if just one equal

  getNextChar(&currentChar, &nextChar);
  return { tok_bin_op, bin_op };
}
*/