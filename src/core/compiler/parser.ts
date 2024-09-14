import AST from "./ast/ast"
import ProgramAST from "./ast/program-ast"
import Token from "./token"

export default class Parser {
  tokens: Token[] = []

  private get currentToken() {
    return this.tokens[0]
  }

  private get nextToken() {
    return this.tokens[1]
  }

  private consumeToken() {
    this.tokens.shift()
  }

  parse(tokens: Token[]): ProgramAST {
    this.tokens = tokens

    // TODO: Implement parser
    const astNodes: AST[] = []

    let astNode: AST
    while (this.currentToken !== undefined) {
      astNode = this.getNextASTNode()
      astNodes.push(astNode)
    }

    return new ProgramAST(astNodes, tokens)
  }

  private getNextASTNode(): AST {
    return null as unknown as AST
  }
}