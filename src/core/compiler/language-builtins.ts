import { ExtendedConsole } from "@/types/ExtendedConsole"
import AutocompletionItem, { AutocompletionItemType } from "../autocompletion-item"

export default class LanguageBuiltins {
  private executionContext: any
  private readonly builtins: { [key: string]: any } = {
    Object: Object,
    Math: Math,
    log: this.log,
    range: this.range
  } as const

  constructor(executionContext: any) {
    this.executionContext = executionContext

    // Add builtins to the execution context
    for (const key in this.builtins) {
      this.executionContext[key] = this.builtins[key]
    }

    // Add builtins to prototypes
    ;(Array.prototype as any).first = function() {
      return this[0]
    }
  }

  addAutocompletionItems(suggestions: Record<string, AutocompletionItem>) {
    suggestions["Math"] = { type: AutocompletionItemType.CONSTANT, children: {} }
    suggestions["log"] = { type: AutocompletionItemType.FUNCTION, children: {} }
    suggestions["range"] = { type: AutocompletionItemType.FUNCTION, children: {} }
  }

  log(...messages: any[]) {
    (console as ExtendedConsole).runtimeLog(...messages)
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