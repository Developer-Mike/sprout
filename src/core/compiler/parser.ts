import AST from "./ast/ast"
import ExpressionAST from "./ast/expression-ast"
import NumberExprAST from "./ast/number-expr-ast"
import ProgramAST from "./ast/program-ast"
import Token, { TokenType } from "./token"
import CompileError from "./compile-error"
import SourceLocation from "./source-location"
import VariableExprAST from "./ast/variable-expr-ast"
import CallExprAST from "./ast/call-expr-ast"
import BinaryExprAST from "./ast/binary-expr-ast"

export default class Parser {
  readonly precedence: { [operator: string]: number } = {
    "<": 10, ">": 10, "<=": 10, ">=": 10, "==": 10, "!=": 10,
    "+": 20, "-": 20, 
    "*": 40, "/": 40, "%": 40,
  }

  tokens: Token[] = []
  errors: CompileError[] = []

  private get currentToken() {
    return this.tokens[0]
  }

  private get currentTokenPrecedence() {
    return this.precedence[this.currentToken.value ?? ''] ?? -1
  }

  private consumeToken() {
    this.tokens.shift()
    return null
  }

  parse(tokens: Token[]): ProgramAST {
    this.tokens = tokens

    const astNodes: AST[] = []

    while (this.currentToken !== undefined) {
      const astNode = this.getNextASTNode()
      if (astNode !== null) astNodes.push(astNode)
    }

    return new ProgramAST(astNodes, tokens)
  }

  private logError(message: string, location: SourceLocation) {
    this.errors.push(new CompileError(message, location))
    return null
  }

  /*private getNextASTNode(): AST | null {
    return ({
      // [TokenType.KEYWORD_FUN]: this.parseFunction,
      // [TokenType.KEYWORD_VAR]: this.parseVariableDeclaration,
      [TokenType.EOL]: this.consumeToken,
    })[this.currentToken.type]?.call(this)
      ?? this.parseExpression()
  }*/

  private parsePrimaryExpression(): ExpressionAST | null {
    return ({
      [TokenType.LITERAL_NUMBER]: this.parseNumberExpression,
      [TokenType.IDENTIFIER]: this.parseIdentifierExpression,
      [TokenType.PAREN_OPEN]: this.parseParenExpression,
    })[this.currentToken.type]?.call(this)
      ?? this.logError("Expected primary expression", this.currentToken.location)
  }

  private parseNumberExpression(): NumberExprAST {
    const ast = new NumberExprAST(
      this.currentToken.value!, 
      this.currentToken.location
    )

    this.consumeToken() // consume number token
    return ast
  }

  private parseParenExpression(): ExpressionAST | null {
    this.consumeToken() // consume '('

    // parse expression inside parenthesis
    const ast = this.parseExpression()
    if (ast === null) return null

    if (this.currentToken.type !== TokenType.PAREN_CLOSE)
      return this.logError("Expected ')' at the end of expression", this.currentToken.location)

    this.consumeToken() // consume ')'

    return ast
  }

  private parseIdentifierExpression(): ExpressionAST | null {
    const identifierValue = this.currentToken.value
    const identifierLocation = this.currentToken.location

    this.consumeToken() // consume identifier token

    // If not a function call, return a variable expression
    if (this.currentToken.type !== TokenType.PAREN_OPEN)
      return new VariableExprAST(identifierValue!, identifierLocation)

    // Parse function call
    this.consumeToken() // consume '('

    // parse arguments
    const args: ExpressionAST[] = []
    // @ts-ignore TS doesn't know that this loop changes the current token
    while (this.currentToken.type !== TokenType.PAREN_CLOSE) {
      const arg = this.parseExpression()
      if (arg === null) return null

      args.push(arg)

      // @ts-ignore TS doesn't know that this loop changes the current token
      if (this.currentToken.type === TokenType.SEPARATOR)
        this.consumeToken() // consume ','
    }

    this.consumeToken() // consume ')'

    return new CallExprAST(identifierValue!, args, identifierLocation)
  }

  private parseExpression(): ExpressionAST | null {
    let lhs = this.parsePrimaryExpression()
    if (lhs === null) return null

    return this.parseBinOpRHS(0, lhs)
  }

  private parseBinOpRHS(exprPrecedence: number, lhs: ExpressionAST): ExpressionAST | null {
    // If it's a binary operator, find its precedence
    while (true) {
      const tokenPrecedence = this.currentTokenPrecedence

      // If it's not a binary operator, or it has lower precedence, return
      if (tokenPrecedence < exprPrecedence) return lhs

      // It's a binary operator, so consume it
      const binOp = this.currentToken.value
      this.consumeToken() // Eat e.g. '+'

      // Parse the expression on the right side of the operator
      let rhs = this.parsePrimaryExpression()
      if (rhs === null) return null

      // If the operator after the RHS has higher precedence, let the pending operator treat the RHS as its LHS
      if (tokenPrecedence < this.currentTokenPrecedence) {
        rhs = this.parseBinOpRHS(tokenPrecedence + 1, rhs)
        if (rhs === null) return null
      }

      // Create a new binary expression node
      lhs = new BinaryExprAST(binOp!, lhs, rhs, { start: lhs.sourceLocation.start, end: rhs.sourceLocation.end })
    }
  }

  /*private parseVariableDeclaration(): AST {
    // TODO
  }

  private parsePrototype(): AST {
    // TODO
  }

  private parseFunction(): AST {
    // TODO
  }*/
}