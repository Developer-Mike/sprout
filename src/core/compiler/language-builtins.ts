import AutocompletionItem, { AutocompletionItemType } from "../autocompletion-item"

export default class LanguageBuiltins {
  private executionContext: any
  private readonly builtins: { [key: string]: any } = {
    Object: Object,
    Math: Math,
    log: this.log,
    range: this.range
  }

  constructor(executionContext: any) {
    this.executionContext = executionContext

    for (const key in this.builtins) {
      this.executionContext[key] = this.builtins[key]
    }
  }

  addAutocompletionItems(suggestions: AutocompletionItem[]) {
    for (const key in this.builtins) {
      suggestions.push({
        value: key,
        type: this.builtins[key] === Object ? AutocompletionItemType.CONSTANT : AutocompletionItemType.FUNCTION
      })
    }
  }

  log(...messages: any[]) {
    console.log(...messages)
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