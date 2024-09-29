/**
 * Represents an autocompletion item.
 * 
 * @property value The value of the item. If the value is *, it means that the item is a wildcard.
 * @property type The type of the item.
 * @property detail Some additional information about the item.
 * @property children The children of the item.
 */
export default interface AutocompletionItem {
  value: string
  type: AutocompletionItemType
  detail?: string
  children?: AutocompletionItem[]
}

export enum AutocompletionItemType {
  KEYWORD,
  CONSTANT,
  VARIABLE,
  FUNCTION
}