import { AST, ProgramAST } from "./ast"
import Token from "./token"

export default class Parser {
  parse(tokens: Token[]): ProgramAST {
    // TODO: Implement parser

    const astNodes: AST[] = []
    return new ProgramAST(astNodes, tokens)
  }
}