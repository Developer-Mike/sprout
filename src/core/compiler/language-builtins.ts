export default class LanguageBuiltins {
  private executionContext: any

  constructor(executionContext: any) {
    this.executionContext = executionContext

    // Copy JS builtins to the execution context
    this.executionContext.Object = Object
    this.executionContext.Math = Math

    // Add builtins to the execution context
    this.executionContext.log = this.log
    this.executionContext.range = this.range
  }

  log(message: string) {
    console.log(message)
  }

  range(start_or_end: number, end?: number, step?: number): number[] {
    const start = end !== undefined ? start_or_end : 0
    end = end ?? start_or_end
    step = step ?? (start < end ? 1 : -1)
    const up = start < end

    const result: number[] = []
    for (let i = start; up ? i < end : i > end; i += step) {
      result.push(i)
    }

    return result
  }
}