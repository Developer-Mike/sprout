import Lexer from "./lexer"
import Parser from "./parser"
import ProgramAST from "./ast/program-ast"

export default class Compiler {
  lexer: Lexer
  parser: Parser
  
  constructor() {
    this.lexer = new Lexer()
    this.parser = new Parser()
  }

  compile(source: string): ProgramAST {
    const tokens = this.lexer.lex(source)
    const ast = this.parser.parse(tokens)

    return ast
  }
}