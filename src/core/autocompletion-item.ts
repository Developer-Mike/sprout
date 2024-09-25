export default interface AutocompletionItem {
  insertText: string
  label: string
  kind: AutocompletionItemKind
  detail?: string
  children?: AutocompletionItem[]
}

export enum AutocompletionItemKind {
  Keyword,
  Identifier,
  Function
}