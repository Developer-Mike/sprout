/**
 * Represents an autocompletion item.
 * 
 * @property value The value of the item.
 * @property type The type of the item.
 * @property detail Some additional information about the item.
 * @property isList Whether the item is a list. If true, the autocompletion of the children will only show up if a list item is selected.
 * @property children The children of the item.
 */
export default interface AutocompletionItem {
  value: string
  type: AutocompletionItemType
  detail?: string
  isList?: boolean
  children?: AutocompletionItem[]
}

export enum AutocompletionItemType {
  KEYWORD,
  CONSTANT,
  VARIABLE,
  FUNCTION
}