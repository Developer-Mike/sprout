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
import AwaitExprAST from "./ast/expr/await-expr-ast"
import ListExprAST from "./ast/expr/list-expr-ast"
import UnaryExprAst from "./ast/expr/unary-expr-ast"
import IfStatementAST from "./ast/if-statement-ast"

export default class Parser {
  readonly precedence: { [operator: string]: number } = {
    "||": 4,
    "&&": 5,
    "<": 10, ">": 10, "<=": 10, ">=": 10, "==": 10, "!=": 10,
    "+": 20, "-": 20, 
    "*": 40, "/": 40, "%": 40,
    "**": 50
  }

  private tokens: Token[] = []
  private errors: CompileError[] = []

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
    while (this.currentToken.type !== TokenType.EOF) {
      const node = this.parseStatement()
      body.push(node)
    }

    return new ProgramAST(body, this.errors, tokens)
  }

  logError(message: string, location: SourceLocation, consumeToken = true) {
    this.errors.push(new CompileError(message, location))

    // consume the token to avoid infinite loop
    if (consumeToken && this.currentToken.type !== TokenType.EOF) this.consumeToken()
    
    return null
  }

  get unknownLocation(): SourceLocation {
    return { start: -1, end: -1 }
  }

  private parseStatement(): AST  {
    switch (this.currentToken?.type) {
      case TokenType.KEYWORD_FUN:
        return this.parseFunctionDefinition()
      case TokenType.KEYWORD_VAR:
      case TokenType.KEYWORD_CONST:
        return this.parseVariableDeclaration()
      case TokenType.KEYWORD_IF:
        return this.parseIfStatementOrExpression(true)
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
  
  private parseBlockStatement(): BlockStatementAST {
    // If it's embraced, parse the embraced block statement
    if (this.currentToken.type === TokenType.CURLY_OPEN)
      return this.parseEmbracedBlockStatement()

    // Otherwise, parse a single statement
    const statement = this.parseStatement()

    return new BlockStatementAST([statement], statement.sourceLocation)
  }

  private parseEmbracedBlockStatement(): BlockStatementAST {
    const bodyStartLocation = this.currentToken.location.start

    if (this.currentToken.type !== TokenType.CURLY_OPEN)
      this.logError("Expected '{'", this.currentToken.location)
    else this.consumeToken() // consume '{'

    const body: AST[] = []
    // @ts-ignore TS doesn't know that consumeToken changes currentToken
    while (this.currentToken.type !== TokenType.CURLY_CLOSE && this.currentToken.type !== TokenType.EOF) {
      const statement = this.parseStatement()

      body.push(statement)
    }

    const bodyEndLocation = this.currentToken.location.end

    if (this.currentToken.type !== TokenType.CURLY_CLOSE)
      this.logError("Expected '}'", this.currentToken.location)
    else this.consumeToken() // consume '}'

    return new BlockStatementAST(body, { start: bodyStartLocation, end: bodyEndLocation })
  }

  private parsePrimaryExpression(): ExpressionAST {
    let objectExpr: ExpressionAST
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
        objectExpr = this.parseIfStatementOrExpression(false)
        break
      case TokenType.KEYWORD_AWAIT:
        objectExpr = this.parseAwaitExpression()
        break
      case TokenType.SQUARE_OPEN:
        objectExpr = this.parseListExpression()
        break
      case TokenType.PAREN_OPEN:
        objectExpr = this.parseParenExpression()
        break
      case TokenType.UNARY_OPERATOR:
      case TokenType.BINARY_OPERATOR:
        objectExpr = this.parseUnaryPrefixExpression()
        break
      default:
        this.logError("Expected primary expression", this.currentToken.location)
        objectExpr = new IdentifierExprAST('', this.unknownLocation)
    }

    // Parse member expressions
    // @ts-ignore TS doesn't know that consumeToken changes currentToken
    while ([TokenType.OPTIONAL_OPERATOR, TokenType.PUNCTUATOR, TokenType.SQUARE_OPEN].includes(this.currentToken.type)) {
      // @ts-ignore TS doesn't know that consumeToken changes currentToken
      const optional = this.currentToken.type === TokenType.OPTIONAL_OPERATOR
      if (optional) this.consumeToken() // consume '?'

      // @ts-ignore TS doesn't know that consumeToken changes currentToken
      const punctuator = this.currentToken.type === TokenType.PUNCTUATOR

      if (![TokenType.PUNCTUATOR, TokenType.SQUARE_OPEN].includes(this.currentToken.type))
        this.logError("Expected '.' or '[' after optional operator", this.currentToken.location)
      else this.consumeToken() // consume '.' or '['

      let memberIdentifier: ExpressionAST
      if (punctuator) {
        if (this.currentToken.type !== TokenType.IDENTIFIER) {
          this.logError("Expected member name after '.'", this.currentToken.location)
          break // Don't return null, just break the loop
        }

        memberIdentifier = this.parseIdentifierExpression()
      } else {
        memberIdentifier = this.parseExpression()

        // @ts-ignore TS doesn't know that consumeToken changes currentToken
        if (this.currentToken.type !== TokenType.SQUARE_CLOSE)
          this.logError("Expected ']' after member expression", this.currentToken.location)
        else this.consumeToken() // consume ']'
      }

      // Create a new member expression node
      objectExpr = new MemberExprAST(objectExpr, memberIdentifier, optional, { start: objectExpr.sourceLocation.start, end: memberIdentifier.sourceLocation.end })
    }

    // If it's an assignment, parse it
    // @ts-ignore TS doesn't know that consumeToken changes currentToken
    if (this.currentToken.type === TokenType.ASSIGNMENT || this.currentToken.type === TokenType.OPERATOR_ASSIGNMENT) {
      const assignmentOperator = this.currentToken.value
      this.consumeToken() // consume assignment token

      const value = this.parseExpression()

      // Don't allow assignment to optional member expressions
      if (objectExpr instanceof MemberExprAST && objectExpr.isOptionalChain())
        this.logError("Cannot assign to optional chain", objectExpr.sourceLocation)

      return new AssignmentExprAST(objectExpr, value, assignmentOperator, { start: objectExpr.sourceLocation.start, end: value.sourceLocation.end })
    }

    // If there's a unary operator after the primary expression, parse it
    // @ts-ignore TS doesn't know that consumeToken changes currentToken
    if (this.currentToken.type === TokenType.UNARY_OPERATOR) {
      const endLocation = this.currentToken.location.end

      const operator = this.currentToken.value!
      this.consumeToken() // consume operator

      return new UnaryExprAst(operator, false, objectExpr, { start: objectExpr.sourceLocation.start, end: endLocation })
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

  private parseIfStatementOrExpression(statement: boolean): IfStatementAST | IfExprAST {
    const ifStartLocation = this.currentToken.location.start

    if (this.currentToken.type !== TokenType.KEYWORD_IF)
      this.logError("Expected keyword 'if'", this.currentToken.location)
    else this.consumeToken() // consume 'if'

    // @ts-ignore TS doesn't know that consumeToken changes currentToken
    if (this.currentToken.type !== TokenType.PAREN_OPEN)
      this.logError("Expected '(' after 'if'", this.currentToken.location)
    else this.consumeToken() // consume '('

    const condition = this.parseExpression()

    // @ts-ignore TS doesn't know that consumeToken changes currentToken
    if (this.currentToken.type !== TokenType.PAREN_CLOSE)
      this.logError("Expected ')' after condition", this.currentToken.location)
    else this.consumeToken() // consume ')'

    const thenBody = this.parseBlockStatement()

    let elseBody: BlockStatementAST | null = null
    // @ts-ignore TS doesn't know that consumeToken changes currentToken
    if (this.currentToken.type === TokenType.KEYWORD_ELSE) {
      this.consumeToken() // consume 'else'

      elseBody = this.parseBlockStatement()
    }

    return statement ?
      new IfStatementAST(condition, thenBody, elseBody, { start: ifStartLocation, end: elseBody?.sourceLocation.end ?? thenBody.sourceLocation.end }) :
      new IfExprAST(this, condition, thenBody, elseBody, { start: ifStartLocation, end: elseBody?.sourceLocation.end ?? thenBody.sourceLocation.end })
  }

  private parseAwaitExpression(): AwaitExprAST {
    const awaitStartLocation = this.currentToken.location.start

    if (this.currentToken.type !== TokenType.KEYWORD_AWAIT)
      this.logError("Expected keyword 'await'", this.currentToken.location)
    else this.consumeToken() // consume 'await'

    const expression = this.parseExpression()

    return new AwaitExprAST(expression, { start: awaitStartLocation, end: expression.sourceLocation.end })
  }

  private parseListExpression(): ListExprAST {
    const listStartLocation = this.currentToken.location.start

    if (this.currentToken.type !== TokenType.SQUARE_OPEN)
      this.logError("Expected '['", this.currentToken.location)
    else this.consumeToken() // consume '['

    const elements: ExpressionAST[] = []
    // @ts-ignore TS doesn't know that consumeToken changes currentToken
    if (this.currentToken.type !== TokenType.SQUARE_CLOSE) {
      do {
        // @ts-ignore TS doesn't know that consumeToken changes currentToken
        if (this.currentToken.type === TokenType.SEPARATOR)
          this.consumeToken() // consume ','

        const element = this.parseExpression()
        elements.push(element)
      } while (this.currentToken.type === TokenType.SEPARATOR)
    }

    const listEndLocation = this.currentToken.location.end

    if (this.currentToken.type !== TokenType.SQUARE_CLOSE)
      this.logError("Expected ']'", this.currentToken.location)
    else this.consumeToken() // consume ']'

    return new ListExprAST(elements, { start: listStartLocation, end: listEndLocation })
  }

  private parseParenExpression(): ExpressionAST  {
    if (this.currentToken.type !== TokenType.PAREN_OPEN)
      this.logError("Expected '('", this.currentToken.location)
    else this.consumeToken() // consume '('

    // parse expression inside parenthesis
    const ast = this.parseExpression()

    if (this.currentToken.type !== TokenType.PAREN_CLOSE)
      this.logError("Expected ')' at the end of expression", this.currentToken.location)
    else this.consumeToken() // consume ')'

    return ast
  }

  private parseUnaryPrefixExpression(): UnaryExprAst  {
    const startLocation = this.currentToken.location.start
    const operator = this.currentToken.value ?? ''

    if (this.currentToken.type !== TokenType.UNARY_OPERATOR && this.currentToken.type !== TokenType.BINARY_OPERATOR)
      this.logError("Expected unary operator", this.currentToken.location)
    else this.consumeToken() // consume operator

    const operand = this.parsePrimaryExpression()

    return new UnaryExprAst(operator, true, operand, { start: startLocation, end: operand.sourceLocation.end })
  }

  private parseIdentifierExpression(): ExpressionAST {
    const identifier = new IdentifierExprAST(this.currentToken.value ?? '', this.currentToken.location)

    if (this.currentToken.type !== TokenType.IDENTIFIER)
      this.logError("Expected identifier", this.currentToken.location)
    else this.consumeToken() // consume identifier token

    // If it's a function call, parse it
    // @ts-ignore TS doesn't know that consumeToken changes currentToken
    if (this.currentToken.type === TokenType.PAREN_OPEN) {
      this.consumeToken() // consume '('

      // parse arguments
      const args: ExpressionAST[] = []

      // @ts-ignore TS doesn't know that consumeToken changes currentToken
      if (this.currentToken.type !== TokenType.PAREN_CLOSE) {
        do {
          // @ts-ignore TS doesn't know that consumeToken changes currentToken
          if (this.currentToken.type === TokenType.SEPARATOR)
            this.consumeToken() // consume ','

          const arg = this.parseExpression()
          args.push(arg)
        
          // @ts-ignore TS doesn't know that consumeToken changes currentToken
        } while (this.currentToken.type === TokenType.SEPARATOR)
      }

      const callEndLocation = this.currentToken.location.end

      // @ts-ignore TS doesn't know that consumeToken changes currentToken
      if (this.currentToken.type !== TokenType.PAREN_CLOSE)
        this.logError("Expected ')' after function arguments", this.currentToken.location)
      else this.consumeToken() // consume ')'

      return new CallExprAST(identifier, args, { start: identifier.sourceLocation.start, end: callEndLocation })
    }

    return identifier
  }

  private parseExpression(): ExpressionAST {
    let lhs = this.parsePrimaryExpression()
    return this.parseBinOpRHS(0, lhs)
  }

  private parseBinOpRHS(exprPrecedence: number, lhs: ExpressionAST): ExpressionAST {
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

      // If the operator after the RHS has higher precedence, let the pending operator treat the RHS as its LHS
      if (tokenPrecedence < this.currentTokenPrecedence) {
        rhs = this.parseBinOpRHS(tokenPrecedence + 1, rhs)
      }

      // Create a new binary expression node
      lhs = new BinaryExprAST(binOp!, lhs, rhs, { start: lhs.sourceLocation.start, end: rhs.sourceLocation.end })
    }
  }

  private parseVariableDeclaration(): VariableDeclarationAST {
    const isConstant = this.currentToken.type === TokenType.KEYWORD_CONST

    if (this.currentToken.type !== TokenType.KEYWORD_VAR && this.currentToken.type !== TokenType.KEYWORD_CONST)
      this.logError("Expected keyword 'var' or 'const'", this.currentToken.location)
    else this.consumeToken() // consume 'var' or 'const'

    const variableIdentifier = new IdentifierExprAST(this.currentToken.value ?? '', this.currentToken.location)

    if (this.currentToken.type !== TokenType.IDENTIFIER)
      this.logError("Expected variable name", this.currentToken.location)
    else this.consumeToken() // consume variable name

    // @ts-ignore TS doesn't know that consumeToken changes currentToken
    if (this.currentToken.type !== TokenType.ASSIGNMENT)
      this.logError("Expected '=' after variable name", this.currentToken.location)
    else this.consumeToken() // consume '='

    const variableValue = this.parseExpression()

    return new VariableDeclarationAST(isConstant, variableIdentifier, variableValue, { start: variableIdentifier.sourceLocation.start, end: variableValue.sourceLocation.end })
  }

  private parsePrototype(): PrototypeAST {
    const functionIdentifier = new IdentifierExprAST(this.currentToken.value ?? '', this.currentToken.location)

    if (this.currentToken.type !== TokenType.IDENTIFIER)
      this.logError("Expected function name", this.currentToken.location)
    else this.consumeToken() // consume function name

    // @ts-ignore TS doesn't know that consumeToken changes currentToken
    if (this.currentToken.type !== TokenType.ASSIGNMENT)
      this.logError("Expected '=' after function name", this.currentToken.location)
    else this.consumeToken() // consume '='

    // @ts-ignore TS doesn't know that consumeToken changes currentToken
    if (this.currentToken.type !== TokenType.PAREN_OPEN)
      this.logError("Expected '(' after '='", this.currentToken.location)
    else this.consumeToken() // consume '('

    const args: IdentifierExprAST[] = []
    while (this.currentToken.type === TokenType.IDENTIFIER) {
      const arg = new IdentifierExprAST(this.currentToken.value!, this.currentToken.location)
      this.consumeToken() // consume argument name

      args.push(arg)

      // @ts-ignore TS doesn't know that consumeToken changes currentToken
      if (this.currentToken.type === TokenType.SEPARATOR)
        this.consumeToken() // consume ','
    }

    const functionEndLocation = this.currentToken.location.end

    if (this.currentToken.type !== TokenType.PAREN_CLOSE)
      this.logError("Expected ')' after function arguments", this.currentToken.location)
    else this.consumeToken() // consume ')'

    return new PrototypeAST(functionIdentifier, args, { start: functionIdentifier.sourceLocation.start, end: functionEndLocation })
  }

  private parseFunctionDefinition(): FunctionDefinitionAST {
    if (this.currentToken.type !== TokenType.KEYWORD_FUN)
      this.logError("Expected keyword 'fun'", this.currentToken.location)
    else this.consumeToken() // consume 'fun'

    const proto = this.parsePrototype()
    const body = this.parseEmbracedBlockStatement()

    return new FunctionDefinitionAST(proto, body, { start: proto.sourceLocation.start, end: body.sourceLocation.end })
  }

  private parseWhileStatement(): WhileAST  {
    const whileStartLocation = this.currentToken.location.start

    if (this.currentToken.type !== TokenType.KEYWORD_WHILE)
      this.logError("Expected keyword 'while'", this.currentToken.location)
    else this.consumeToken() // consume 'while'

    // @ts-ignore TS doesn't know that consumeToken changes currentToken
    if (this.currentToken.type !== TokenType.PAREN_OPEN)
      this.logError("Expected '(' after 'while'", this.currentToken.location)
    else this.consumeToken() // consume '('

    const condition = this.parseExpression()

    // @ts-ignore TS doesn't know that consumeToken changes currentToken
    if (this.currentToken.type !== TokenType.PAREN_CLOSE)
      this.logError("Expected ')' after condition", this.currentToken.location)
    else this.consumeToken() // consume ')'

    const body = this.parseBlockStatement() ?? new BlockStatementAST([], condition.sourceLocation)

    return new WhileAST(condition, body, { start: whileStartLocation, end: body.sourceLocation.end })
  }

  private parseForStatement(): ForAST  {
    const forStartLocation = this.currentToken.location.start

    if (this.currentToken.type !== TokenType.KEYWORD_FOR)
      this.logError("Expected keyword 'for'", this.currentToken.location)
    else this.consumeToken() // consume 'for'

    // @ts-ignore TS doesn't know that consumeToken changes currentToken
    if (this.currentToken.type !== TokenType.PAREN_OPEN)
      this.logError("Expected '(' after 'for'", this.currentToken.location)
    else this.consumeToken() // consume '('
    
    // Parse identifier
    const identifier = this.currentToken.value ?? ''
    if (this.currentToken.type !== TokenType.IDENTIFIER)
      this.logError("Expected identifier", this.currentToken.location)
    else this.consumeToken() // consume identifier

    // @ts-ignore TS doesn't know that consumeToken changes currentToken
    if (this.currentToken.type !== TokenType.KEYWORD_IN)
      this.logError("Expected keyword 'in'", this.currentToken.location)
    else this.consumeToken() // consume 'in'

    // Parse array
    const array = this.parseExpression()

    // @ts-ignore TS doesn't know that consumeToken changes currentToken
    if (this.currentToken.type !== TokenType.PAREN_CLOSE)
      this.logError("Expected ')' after array", this.currentToken.location)
    else this.consumeToken() // consume ')'

    const body = this.parseBlockStatement()

    return new ForAST(identifier, array, body, { start: forStartLocation, end: body.sourceLocation.end })
  }

  private parseOnStatement(): OnAST {
    const onStartLocation = this.currentToken.location.start

    if (this.currentToken.type !== TokenType.KEYWORD_ON)
      this.logError("Expected keyword 'on'", this.currentToken.location)
    else this.consumeToken() // consume 'on'

    // @ts-ignore TS doesn't know that consumeToken changes currentToken
    if (this.currentToken.type !== TokenType.PAREN_OPEN)
      this.logError("Expected '(' after 'on'", this.currentToken.location)
    else this.consumeToken() // consume '('

    const condition = this.parseExpression()

    // @ts-ignore TS doesn't know that consumeToken changes currentToken
    if (this.currentToken.type !== TokenType.PAREN_CLOSE)
      this.logError("Expected ')' after condition", this.currentToken.location)
    else this.consumeToken() // consume ')'

    const body = this.parseBlockStatement()

    return new OnAST(condition, body, { start: onStartLocation, end: body.sourceLocation.end })
  }

  private parseReturnStatement(): ReturnAST  {
    const returnStartLocation = this.currentToken.location.start

    if (this.currentToken.type !== TokenType.KEYWORD_RETURN)
      this.logError("Expected keyword 'return'", this.currentToken.location)
    else this.consumeToken() // consume 'return'

    // Parse optional return value
    const value = this.parseExpression()

    return new ReturnAST(value, { start: returnStartLocation, end: value?.sourceLocation.end ?? returnStartLocation })
  }

  private parseBreakStatement(): BreakAST  {
    const location = this.currentToken.location

    if (this.currentToken.type !== TokenType.KEYWORD_BREAK)
      this.logError("Expected keyword 'break'", this.currentToken.location)
    else this.consumeToken() // consume 'break'

    return new BreakAST(location)
  }

  private parseContinueStatement(): ContinueAST  {
    const location = this.currentToken.location

    if (this.currentToken.type !== TokenType.KEYWORD_CONTINUE)
      this.logError("Expected keyword 'continue'", this.currentToken.location)
    else this.consumeToken() // consume 'continue'

    return new ContinueAST(location)
  }

  private parseUnsubscribeStatement(): UnsubscribeAST  {
    const location = this.currentToken.location

    if (this.currentToken.type !== TokenType.KEYWORD_UNSUBSCRIBE)
      this.logError("Expected keyword 'unsubscribe'", this.currentToken.location)
    else this.consumeToken() // consume 'unsubscribe'

    return new UnsubscribeAST(location)
  }
}