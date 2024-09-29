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

  getGlobalDeclarations(): Record<string, AutocompletionItem> {
    return this.body.reduce((acc, node) => {
      if (node instanceof VariableDeclarationAST)
        acc[node.name.toJavaScript()] = { type: node.constant ? AutocompletionItemType.CONSTANT : AutocompletionItemType.VARIABLE, children: {} }
      if (node instanceof FunctionDefinitionAST)
        acc[node.proto.name.toJavaScript()] = { type: AutocompletionItemType.FUNCTION, children: {} }

      return acc
    }, {} as Record<string, AutocompletionItem>)
  }
}