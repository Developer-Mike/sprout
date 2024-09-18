import ProgramAST from "@/core/compiler/ast/program-ast"

export interface DebugData {
  ast: { [gameObjectKey: string]: ProgramAST }
}