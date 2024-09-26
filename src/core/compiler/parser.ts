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
import AssignmentExprAST from "./ast/expr/assignment-expr-ast"
import BooleanExprAST from "./ast/expr/boolean-expr-ast"
import ReturnAST from "./ast/return-ast"
import BreakAST from "./ast/break-ast"
import ContinueAST from "./ast/continue-ast"
import OnAST from "./ast/on-ast"
import WhileAST from "./ast/while-ast"
import ForAST from "./ast/for-ast"
import IfExprAST from "./ast/expr/if-expr-ast"
import UnsubscribeAST from "./ast/unsubscribe-ast"

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
    this.errors = []

    const body: AST[] = []
    while (this.currentToken !== undefined && this.currentToken.type !== TokenType.EOF) {
      const node = this.parseStatement()
      if (node !== null) body.push(node)
    }

    return new ProgramAST(body, this.errors, tokens)
  }

  private logError(message: string, location: SourceLocation) {
    this.errors.push(new CompileError(message, location))
    this.consumeToken() // consume the token to avoid infinite loop
    return null
  }

  private parseStatement(): AST | null {
    switch (this.currentToken?.type) {
      case TokenType.KEYWORD_FUN:
        return this.parseFunctionDefinition()
      case TokenType.KEYWORD_VAR:
      case TokenType.KEYWORD_CONST:
        return this.parseVariableDeclaration()
      case TokenType.KEYWORD_WHILE:
        return this.parseWhileStatement()
      case TokenType.KEYWORD_FOR:
        return this.parseForStatement()
      case TokenType.KEYWORD_ON:
        return this.parseOnStatement()
      case TokenType.KEYWORD_RETURN:
        return this.parseReturnStatement()
      case TokenType.KEYWORD_BREAK:
        return this.parseBreakStatement()
      case TokenType.KEYWORD_CONTINUE:
        return this.parseContinueStatement()
      case TokenType.KEYWORD_UNSUBSCRIBE:
        return this.parseUnsubscribeStatement()
      default:
        return this.parseExpression()
    }
  }
  
  private parseBlockStatement(): BlockStatementAST | null {
    // If it's embraced, parse the embraced block statement
    if (this.currentToken.type === TokenType.CURLY_OPEN)
      return this.parseEmbracedBlockStatement()

    // Otherwise, parse a single statement
    const statement = this.parseStatement()
    if (statement === null) return null

    return new BlockStatementAST([statement], statement.sourceLocation)
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
    let objectExpr: ExpressionAST | null = null
    switch (this.currentToken.type) {
      case TokenType.LITERAL_NUMBER:
        objectExpr = this.parseNumberExpression()
        break
      case TokenType.LITERAL_STRING:
        objectExpr = this.parseStringExpression()
        break
      case TokenType.LITERAL_BOOLEAN:
        objectExpr = this.parseBooleanExpression()
        break
      case TokenType.LITERAL_NULL:
        objectExpr = this.parseNullExpression()
        break
      case TokenType.IDENTIFIER:
        objectExpr = this.parseIdentifierExpression()
        break
      case TokenType.KEYWORD_IF:
        objectExpr = this.parseIfExpression()
        break
      case TokenType.PAREN_OPEN:
        objectExpr = this.parseParenExpression()
        break
      default:
        return this.logError("Expected primary expression", this.currentToken.location)
    }
    if (objectExpr === null) return null

    // Parse member expressions
    // @ts-ignore TS doesn't know that the current token changes
    while (this.currentToken.type === TokenType.OPTIONAL_OPERATOR || this.currentToken.type === TokenType.PUNCTUATOR) {
      const optional = this.currentToken.type === TokenType.OPTIONAL_OPERATOR
      if (optional) this.consumeToken() // consume '?'

      if (this.currentToken.type !== TokenType.PUNCTUATOR)
        return this.logError("Expected '.' after '?'", this.currentToken.location)

      this.consumeToken() // consume '.'

      // @ts-ignore TS doesn't know that consumeToken changes the current token
      if (this.currentToken.type !== TokenType.IDENTIFIER)
        return this.logError("Expected member name after '.'", this.currentToken.location)

      const memberIdentifier = this.parseIdentifierExpression()
      if (memberIdentifier === null) return null

      // Create a new member expression node
      objectExpr = new MemberExprAST(objectExpr, memberIdentifier, optional, { start: objectExpr.sourceLocation.start, end: memberIdentifier.sourceLocation.end })
    }

    return objectExpr
  }

  private parseNumberExpression(): NumberExprAST {
    const ast = new NumberExprAST(
      this.currentToken.value!, 
      this.currentToken.location
    )

    this.consumeToken() // consume number token
    return ast
  }

  private parseStringExpression(): StringExprAST {
    const ast = new StringExprAST(
      this.currentToken.value!, 
      this.currentToken.location
    )

    this.consumeToken() // consume string token
    return ast
  }

  private parseBooleanExpression(): ExpressionAST {
    const ast = new BooleanExprAST(
      this.currentToken.value!, 
      this.currentToken.location
    )

    this.consumeToken() // consume boolean token
    return ast
  }

  private parseNullExpression(): ExpressionAST {
    const ast = new NullExprAST(
      this.currentToken.location
    )

    this.consumeToken() // consume null token
    return ast
  }

  private parseIfExpression(): IfExprAST | null {
    if (this.currentToken.type !== TokenType.KEYWORD_IF)
      return this.logError("Expected keyword 'if'", this.currentToken.location)

    const ifStartLocation = this.currentToken.location.start
    this.consumeToken() // consume 'if'

    // @ts-ignore TS doesn't know that consumeToken changes the current token
    if (this.currentToken.type !== TokenType.PAREN_OPEN)
      return this.logError("Expected '(' after 'if'", this.currentToken.location)

    this.consumeToken() // consume '('

    const condition = this.parseExpression()
    if (condition === null) return null

    // @ts-ignore TS doesn't know that consumeToken changes the current token
    if (this.currentToken.type !== TokenType.PAREN_CLOSE)
      return this.logError("Expected ')' after condition", this.currentToken.location)

    this.consumeToken() // consume ')'

    const thenBody = this.parseBlockStatement()
    if (thenBody === null) return null

    let elseBody: BlockStatementAST | null = null
    // @ts-ignore TS doesn't know that this loop changes the current token
    if (this.currentToken.type === TokenType.KEYWORD_ELSE) {
      this.consumeToken() // consume 'else'

      elseBody = this.parseBlockStatement()
      if (elseBody === null) return null
    }

    return new IfExprAST(condition, thenBody, elseBody, { start: ifStartLocation, end: elseBody?.sourceLocation.end ?? thenBody.sourceLocation.end })
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
    if (this.currentToken.type !== TokenType.IDENTIFIER)
      return this.logError("Expected identifier", this.currentToken.location)

    const identifier = new IdentifierExprAST(this.currentToken.value!, this.currentToken.location)
    this.consumeToken() // consume identifier token

    // If it's a function call, parse it
    // @ts-ignore TS doesn't know that consumeToken changes the current token
    if (this.currentToken.type === TokenType.PAREN_OPEN) {
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

      return new CallExprAST(identifier, args, { start: identifier.sourceLocation.start, end: callEndLocation })
    }

    // If it's an assignment, parse it
    // @ts-ignore TS doesn't know that consumeToken changes the current token
    if (this.currentToken.type === TokenType.ASSIGNMENT || this.currentToken.type === TokenType.OPERATOR_ASSIGNMENT) {
      const assignmentOperator = this.currentToken.value
      this.consumeToken() // consume assignment token

      const value = this.parseExpression()
      if (value === null) return null

      return new AssignmentExprAST(identifier, value, assignmentOperator, { start: identifier.sourceLocation.start, end: value.sourceLocation.end })
    }

    return identifier
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
      const arg = new IdentifierExprAST(this.currentToken.value!, this.currentToken.location)
      this.consumeToken() // consume argument name

      args.push(arg)

      if (this.currentToken.type === TokenType.SEPARATOR)
        this.consumeToken() // consume ','
    }

    if (this.currentToken.type !== TokenType.PAREN_CLOSE)
      return this.logError("Expected ')' after function arguments", this.currentToken.location)

    const functionEndLocation = this.currentToken.location.end
    this.consumeToken() // consume ')'

    return new PrototypeAST(functionIdentifier, args, { start: functionIdentifier.sourceLocation.start, end: functionEndLocation })
  }

  private parseFunctionDefinition(): FunctionDefinitionAST | null {
    if (this.currentToken.type !== TokenType.KEYWORD_FUN)
      return this.logError("Expected keyword 'fun'", this.currentToken.location)

    this.consumeToken() // consume 'fun'

    const proto = this.parsePrototype()
    if (proto === null) return null

    const body = this.parseEmbracedBlockStatement()
    if (body === null) return null

    return new FunctionDefinitionAST(proto, body, { start: proto.sourceLocation.start, end: body.sourceLocation.end })
  }

  private parseWhileStatement(): WhileAST | null {
    if (this.currentToken.type !== TokenType.KEYWORD_WHILE)
      return this.logError("Expected keyword 'while'", this.currentToken.location)

    const whileStartLocation = this.currentToken.location.start
    this.consumeToken() // consume 'while'

    // @ts-ignore TS doesn't know that consumeToken changes the current token
    if (this.currentToken.type !== TokenType.PAREN_OPEN)
      return this.logError("Expected '(' after 'while'", this.currentToken.location)

    this.consumeToken() // consume '('

    const condition = this.parseExpression()
    if (condition === null) return null

    // @ts-ignore TS doesn't know that consumeToken changes the current token
    if (this.currentToken.type !== TokenType.PAREN_CLOSE)
      return this.logError("Expected ')' after condition", this.currentToken.location)

    this.consumeToken() // consume ')'

    const body = this.parseBlockStatement()
    if (body === null) return null

    return new WhileAST(condition, body, { start: whileStartLocation, end: body.sourceLocation.end })
  }

  private parseForStatement(): ForAST | null {
    if (this.currentToken.type !== TokenType.KEYWORD_FOR)
      return this.logError("Expected keyword 'for'", this.currentToken.location)

    const forStartLocation = this.currentToken.location.start
    this.consumeToken() // consume 'for'

    // @ts-ignore TS doesn't know that consumeToken changes the current token
    if (this.currentToken.type !== TokenType.PAREN_OPEN)
      return this.logError("Expected '(' after 'for'", this.currentToken.location)

    this.consumeToken() // consume '('
    
    // Parse identifier
    if (this.currentToken.type !== TokenType.IDENTIFIER)
      return this.logError("Expected identifier", this.currentToken.location)

    const identifier = this.currentToken.value!
    this.consumeToken() // consume identifier

    // @ts-ignore TS doesn't know that consumeToken changes the current token
    if (this.currentToken.type !== TokenType.KEYWORD_IN)
      return this.logError("Expected keyword 'in'", this.currentToken.location)

    this.consumeToken() // consume 'in'

    // Parse array
    const array = this.parseExpression()
    if (array === null) return null

    // @ts-ignore TS doesn't know that consumeToken changes the current token
    if (this.currentToken.type !== TokenType.PAREN_CLOSE)
      return this.logError("Expected ')' after array", this.currentToken.location)

    this.consumeToken() // consume ')'

    const body = this.parseBlockStatement()
    if (body === null) return null

    return new ForAST(identifier, array, body, { start: forStartLocation, end: body.sourceLocation.end })
  }

  private parseOnStatement(): OnAST | null {
    if (this.currentToken.type !== TokenType.KEYWORD_ON)
      return this.logError("Expected keyword 'on'", this.currentToken.location)

    const onStartLocation = this.currentToken.location.start
    this.consumeToken() // consume 'on'

    // @ts-ignore TS doesn't know that consumeToken changes the current token
    if (this.currentToken.type !== TokenType.PAREN_OPEN)
      return this.logError("Expected '(' after 'on'", this.currentToken.location)

    this.consumeToken() // consume '('

    const condition = this.parseExpression()
    if (condition === null) return null

    // @ts-ignore TS doesn't know that consumeToken changes the current token
    if (this.currentToken.type !== TokenType.PAREN_CLOSE)
      return this.logError("Expected ')' after condition", this.currentToken.location)

    this.consumeToken() // consume ')'

    const body = this.parseBlockStatement()
    if (body === null) return null

    return new OnAST(condition, body, { start: onStartLocation, end: body.sourceLocation.end })
  }

  private parseReturnStatement(): ReturnAST | null {
    if (this.currentToken.type !== TokenType.KEYWORD_RETURN)
      return this.logError("Expected keyword 'return'", this.currentToken.location)

    const returnStartLocation = this.currentToken.location.start
    this.consumeToken() // consume 'return'

    // Parse optional return value
    const value = this.parseExpression()

    return new ReturnAST(value, { start: returnStartLocation, end: value?.sourceLocation.end ?? returnStartLocation })
  }

  private parseBreakStatement(): BreakAST | null {
    if (this.currentToken.type !== TokenType.KEYWORD_BREAK)
      return this.logError("Expected keyword 'break'", this.currentToken.location)

    const location = this.currentToken.location
    this.consumeToken() // consume 'break'

    return new BreakAST(location)
  }

  private parseContinueStatement(): ContinueAST | null {
    if (this.currentToken.type !== TokenType.KEYWORD_CONTINUE)
      return this.logError("Expected keyword 'continue'", this.currentToken.location)

    const location = this.currentToken.location
    this.consumeToken() // consume 'continue'

    return new ContinueAST(location)
  }

  private parseUnsubscribeStatement(): UnsubscribeAST | null {
    if (this.currentToken.type !== TokenType.KEYWORD_UNSUBSCRIBE)
      return this.logError("Expected keyword 'unsubscribe'", this.currentToken.location)

    const location = this.currentToken.location
    this.consumeToken() // consume 'unsubscribe'

    return new UnsubscribeAST(location)
  }
}