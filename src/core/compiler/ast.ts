import SourceLocation from "./source-location"

export abstract class AST {
  abstract value: any
  abstract sourceLocation: SourceLocation
  abstract toJavaScript(): string
}

export class ProgramAST {
  nodes: AST[]

  getGlobalDeclarations(): string[] {
    // return a list of global declarations
    /* in future, add them to global object
      Object.defineProperty(game_objects["id"], 'variableName', {
        get: () => value
        set: (newValue) => value = newValue // TODO: Is settable?
      })
    */

    return []
  }
}