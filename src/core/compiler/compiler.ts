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

  compile(source: string, setDebugInfo?: (key: string, value: any) => void): string | CompileException {
    const tokens = this.lexer.lex(source)
    const ast = this.parser.parse(tokens)

    setDebugInfo?.("compiler", {
      tokens,
      ast
    })

    return ast.map(node => node.toJavaScript()).join("\n")
  }
}