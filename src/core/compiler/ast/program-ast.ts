import CompileError from "../compile-error"
import Token from "../token"
import FunctionDefinitionAST from "./function-definition-ast"
import VariableDeclarationAST from "./variable-declaration-ast"
import AST from "./ast"
import SourceLocation from "../source-location"
import AutocompletionItem, { AutocompletionItemType } from "@/core/autocompletion-item"

export default class ProgramAST extends AST {
  sourceLocation: SourceLocation

  constructor(
    public body: AST[],
    public errors: CompileError[], 
    public tokens: Token[] // For debugging
  ) {
    super()
    
    this.sourceLocation = body.length > 0 ? { start: body[0].sourceLocation.start, end: body[body.length - 1].sourceLocation.end } : { start: 0, end: 0 }
  }

  override toJavaScript(): string {
    return this.body.map(node => node.toJavaScript()).join('\n')
  }

  getGlobalDeclarations(): AutocompletionItem[] {
    return this.body.map(node => {
      if (node instanceof VariableDeclarationAST) return { type: node.constant ? AutocompletionItemType.CONSTANT : AutocompletionItemType.VARIABLE, value: node.name.toJavaScript() }
      if (node instanceof FunctionDefinitionAST) return { type: AutocompletionItemType.FUNCTION, value: node.proto.name.toJavaScript() }

      return null
    }).filter(declaration => declaration !== null)
  }
}