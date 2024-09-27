export default class LanguageBuiltins {
  private executionContext: any

  constructor(executionContext: any) {
    this.executionContext = executionContext

    // Copy JS builtins to the execution context
    this.executionContext.Object = Object
    this.executionContext.Math = Math

    // Add builtins to the execution context
    this.executionContext.log = this.log
  }

  log(message: string) {
    console.log(message)
  }
}