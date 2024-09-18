import AST from "./ast/ast"
import ExpressionAST from "./ast/expr/expression-ast"
import NumberExprAST from "./ast/expr/number-expr-ast"
import ProgramAST from "./ast/program-ast"
import Token, { TokenType } from "./token"
import CompileError from "./compile-error"
import SourceLocation from "./source-location"
import IdentifierExprAST from "./ast/expr/identifier-expr-ast"
import CallExprAST from "./ast/expr/call-expr-ast"
import BinaryExprAST from "./ast/expr/binary-expr-ast"
import PrototypeAST from "./ast/prototype-ast"
import FunctionDefinitionAST from "./ast/function-definition-ast"
import VariableDeclarationAST from "./ast/variable-declaration-ast"
import StringExprAST from "./ast/expr/string-expr-ast"
import NullExprAST from "./ast/expr/null-expr-ast"
import BlockStatementAST from "./ast/block-statement-ast"
import MemberExprAST from "./ast/expr/member-expr-ast"

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
    this.tokens = [...tokens]

    const nodes: AST[] = []

    while (this.currentToken.type !== TokenType.EOF) {
      const node = this.parseStatement()
      if (node !== null) nodes.push(node)
    }

    const body = new BlockStatementAST(nodes, { start: 0, end: tokens[tokens.length - 1].location.end })
    return new ProgramAST(body, this.errors, tokens)
  }

  private logError(message: string, location: SourceLocation) {
    this.errors.push(new CompileError(message, location))
    return null
  }

  private parseStatement(): AST | null {
    switch (this.currentToken?.type) {
      case TokenType.KEYWORD_FUN:
        return this.parseFunctionDefinition()
      case TokenType.KEYWORD_VAR:
      case TokenType.KEYWORD_CONST:
        return this.parseVariableDeclaration()
      default:
        return this.parseExpression()
    }
  }
  
  private parseBlockStatement(): BlockStatementAST | null {
    // If it's embraced, parse the embraced block statement
    if (this.currentToken.type === TokenType.CURLY_OPEN)
      return this.parseEmbracedBlockStatement()

    // Otherwise, parse a single expression
    const expression = this.parseExpression()
    if (expression === null) return null

    return new BlockStatementAST([expression], expression.sourceLocation)
  }

  private parseEmbracedBlockStatement(): BlockStatementAST | null {
    if (this.currentToken.type !== TokenType.CURLY_OPEN)
      return this.logError("Expected '{'", this.currentToken.location)

    const bodyStartLocation = this.currentToken.location.start
    this.consumeToken() // consume '{'

    const body: AST[] = []
    // @ts-ignore TS doesn't know that this loop changes the current token
    while (this.currentToken.type !== TokenType.CURLY_CLOSE) {
      const statement = this.parseStatement()
      if (statement === null) return null

      body.push(statement)
    }

    const bodyEndLocation = this.currentToken.location.end
    this.consumeToken() // consume '}'

    return new BlockStatementAST(body, { start: bodyStartLocation, end: bodyEndLocation })
  }

  private parsePrimaryExpression(): ExpressionAST | null {
    switch (this.currentToken.type) {
      case TokenType.LITERAL_NUMBER:
        return this.parseNumberExpression()
      case TokenType.LITERAL_STRING:
        return this.parseStringExpression()
      case TokenType.LITERAL_NULL:
        return this.parseNullExpression()
      case TokenType.IDENTIFIER:
        return this.parseMemberExpression()
      case TokenType.PAREN_OPEN:
        return this.parseParenExpression()
      default:
        return this.logError("Expected primary expression", this.currentToken.location)
    }
  }

  private parseNumberExpression(): NumberExprAST {
    let value = this.currentToken.value ?? ""
    const location = this.currentToken.location
    this.consumeToken() // consume number token

    if (this.currentToken.type === TokenType.PUNCTUATOR) {
      value += "."
      location.end = this.currentToken.location.end

      this.consumeToken() // consume '.'

      // @ts-ignore TS doesn't know that consumeToken changes the current token
      if (this.currentToken.type === TokenType.LITERAL_NUMBER) {
        value += this.currentToken.value
        location.end = this.currentToken.location.end

        this.consumeToken() // consume number token
      }
    }

    return new NumberExprAST(value, location)
  }

  private parseStringExpression(): StringExprAST {
    const ast = new StringExprAST(
      this.currentToken.value!, 
      this.currentToken.location
    )

    this.consumeToken() // consume string token
    return ast
  }

  private parseNullExpression(): ExpressionAST {
    this.consumeToken() // consume 'null' token
    return new NullExprAST(this.currentToken.location)
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

  private parseIdentifierExpression(): IdentifierExprAST | null {
    if (this.currentToken.type !== TokenType.IDENTIFIER)
      return this.logError("Expected identifier", this.currentToken.location)

    const ast = new IdentifierExprAST(this.currentToken.value!, this.currentToken.location)
    this.consumeToken() // consume identifier token

    return ast
  }

  private parseMemberExpression(): ExpressionAST | null {
    let baseIdentifier = this.parseIdentifierExpression()
    if (baseIdentifier === null) return null

    let expressionAst: ExpressionAST = baseIdentifier
    while (this.currentToken.type === TokenType.PUNCTUATOR) {
      this.consumeToken() // consume '.'

      // @ts-ignore TS doesn't know that consumeToken changes the current token
      if (this.currentToken.type !== TokenType.IDENTIFIER)
        return this.logError("Expected member name after '.'", this.currentToken.location)

      const memberIdentifier = this.parseIdentifierExpression()
      if (memberIdentifier === null) return null

      // Create a new member expression node
      expressionAst = new MemberExprAST(expressionAst, memberIdentifier, { start: expressionAst.sourceLocation.start, end: memberIdentifier.sourceLocation.end })

      this.consumeToken() // consume member name
    }

    // If not a function call, return a variable expression
    if (this.currentToken.type !== TokenType.PAREN_OPEN)
      return expressionAst

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

    const callEndLocation = this.currentToken.location.end
    this.consumeToken() // consume ')'

    return new CallExprAST(expressionAst, args, { start: expressionAst.sourceLocation.start, end: callEndLocation })
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

  private parseVariableDeclaration(): VariableDeclarationAST | null {
    const isConstant = this.currentToken.type === TokenType.KEYWORD_CONST
    this.consumeToken() // consume 'var'

    if (this.currentToken.type !== TokenType.IDENTIFIER)
      return this.logError("Expected variable name", this.currentToken.location)

    const variableIdentifier = new IdentifierExprAST(this.currentToken.value!, this.currentToken.location)

    this.consumeToken() // consume variable name

    // @ts-ignore TS doesn't know that consumeToken changes the current token
    if (this.currentToken.type !== TokenType.ASSIGNMENT)
      return this.logError("Expected '=' after variable name", this.currentToken.location)

    this.consumeToken() // consume '='

    const variableValue = this.parseExpression()
    if (variableValue === null) return null

    return new VariableDeclarationAST(isConstant, variableIdentifier, variableValue, { start: variableIdentifier.sourceLocation.start, end: variableValue.sourceLocation.end })
  }

  private parsePrototype(): PrototypeAST | null {
    if (this.currentToken.type !== TokenType.IDENTIFIER)
      return this.logError("Expected function name", this.currentToken.location)

    const functionIdentifier = new IdentifierExprAST(this.currentToken.value!, this.currentToken.location)

    this.consumeToken() // consume function name

    // @ts-ignore TS doesn't know that consumeToken changes the current token
    if (this.currentToken.type !== TokenType.ASSIGNMENT)
      return this.logError("Expected '=' after function name", this.currentToken.location)

    this.consumeToken() // consume '='

    // @ts-ignore TS doesn't know that consumeToken changes the current token
    if (this.currentToken.type !== TokenType.PAREN_OPEN)
      return this.logError("Expected '(' after '='", this.currentToken.location)

    this.consumeToken() // consume '('

    const args: IdentifierExprAST[] = []
    while (this.currentToken.type === TokenType.IDENTIFIER) {
      const arg = this.parseIdentifierExpression()
      if (arg === null) return null

      args.push(arg)

      if (this.currentToken.type === TokenType.SEPARATOR) {
        this.consumeToken() // consume ','
      }
    }

    if (this.currentToken.type !== TokenType.PAREN_CLOSE)
      return this.logError("Expected ')' after function arguments", this.currentToken.location)

    const functionEndLocation = this.currentToken.location.end
    this.consumeToken() // consume ')'

    return new PrototypeAST(functionIdentifier, args, { start: functionIdentifier.sourceLocation.start, end: functionEndLocation })
  }

  private parseFunctionDefinition(): FunctionDefinitionAST | null {
    this.consumeToken() // consume 'fun'

    const proto = this.parsePrototype()
    if (proto === null) return null

    if (this.currentToken.type !== TokenType.ASSIGNMENT)
      return this.logError("Expected '=' after function prototype", this.currentToken.location)

    this.consumeToken() // consume '='

    const body = this.parseBlockStatement()
    if (body === null) return null

    return new FunctionDefinitionAST(proto, body, { start: proto.sourceLocation.start, end: body.sourceLocation.end })
  }
}