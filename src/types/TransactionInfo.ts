
/**
 * TransactionInfo is a type that represents a transaction that has occurred in the editor.
 * If a previous transaction has the same type, category, affectedGameObjectId and transactionId, it will be combined with the new transaction to reduce history size.
 * The CodeEditor maintains a history itself, so no TransactionInfo is needed for code changes, meaning that the CodeEditor is not a part of the history.
 * 
 * The field transactionId should be kebab-case for consistency.
 * 
 * An example of a transaction is like this:
 * {
 *  type: TransactionType.Add,
 *  category: TransactionCategory.GameObjectList,
 *  affectedGameObjectId: "1",
 *  transactionId: "create"
 * }
 * or
 * {
 *  type: TransactionType.Remove, // When x value got smaller
 *  category: TransactionCategory.GameObjectProperty,
 *  affectedGameObjectId: "1",
 *  transactionId: "x"
 * }
  */
export default class TransactionInfo {
  type: TransactionType
  category: TransactionCategory
  affectedGameObjectKey: string | null
  transactionId: string

  constructor(type: TransactionType, category: TransactionCategory, affectedGameObjectKey: string | null, transactionId: string) {
    this.type = type
    this.category = category
    this.affectedGameObjectKey = affectedGameObjectKey
    this.transactionId = transactionId
  }

  canBeCombined(other: TransactionInfo): boolean {
    return this.type !== TransactionType.Unique && other.type !== TransactionType.Unique &&
      this.type === other.type &&
      this.category === other.category &&
      this.affectedGameObjectKey === other.affectedGameObjectKey &&
      this.transactionId === other.transactionId
  }

  /**
   * Gets the type of the transaction based on the old and new values.
   * 
   * @param oldValue The old value.
   * @param newValue The new value.
   * @returns The type of the transaction.
    */
  static getType(oldValue: any, newValue: any): TransactionType {
    if (oldValue === undefined && newValue !== undefined) return TransactionType.Add
    if (oldValue !== undefined && newValue === undefined) return TransactionType.Remove

    // check if number
    if (typeof oldValue === "number" && typeof newValue === "number") {
      if (oldValue < newValue) return TransactionType.Add
      else if (oldValue > newValue) return TransactionType.Remove
    } else {
      // Paste and mass delete operations are considered unique
      if (Math.abs(oldValue.toString().length - newValue.toString().length) > 1) return TransactionType.Unique

      else if (oldValue.toString().length < newValue.toString().length) return TransactionType.Add
      else if (oldValue.toString().length > newValue.toString().length) return TransactionType.Remove
    }
    
    return TransactionType.Update
  }
}

export enum TransactionType {
  Unique = "unique",
  Add = "add",
  Update = "update",
  Remove = "remove"
}

export enum TransactionCategory {
  ProjectSettings = "project-settings",
  SpriteLibrary = "sprite-library",
  GameObjectList = "game-object-list",
  GameObjectProperty = "game-object-property"
}