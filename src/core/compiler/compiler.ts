import { ProgramAST } from "./ast"
import Lexer from "./lexer"
import Parser from "./parser"
import * as InbuiltFunctions from "./inbuilt-functions"

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

  static getInbuiltFunctions() { return InbuiltFunctions }
}