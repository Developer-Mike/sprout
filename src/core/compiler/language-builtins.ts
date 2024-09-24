export default class LanguageBuiltins {
  private executionContext: any

  constructor(executionContext: any) {
    this.executionContext = executionContext

    // Add builtins to the execution context
    this.executionContext.log = this.log
    this.executionContext.Object = Object
  }

  log(message: string) {
    console.log(message)
  }
}