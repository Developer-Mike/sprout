import CompileException from "./compile-exception"
import Lexer from "./lexer"
import Parser from "./parser"

export default class Compiler {
  lexer: Lexer
  parser: Parser
  
  constructor() {
    this.lexer = new Lexer()
    this.parser = new Parser()
  }

  compile(source: string): string | CompileException {
    const tokens = this.lexer.lex(source)
    
    // DEBUG
    tokens.forEach(token => console.log(token.toString()))

    const ast = this.parser.parse(tokens)
    return ast.map(node => node.toJavaScript()).join("\n")
  }
}