export default class IdHelper {
  static readonly MAX_ID_LENGTH = 50

  static generateId(baseName: string, otherIds: string[]): string {
    let id = baseName
    let index = 0

    while (!this.isValidId(id, otherIds)) {
      id = baseName + (index > 0 ? `_${index}` : "")
      index++
    }

    return this.makeIdValid(id)
  }

  static makeIdValid(id: string): string {
    return id
      .replace(/[A-Z]/g, match => match.toLowerCase())
      .replace(/ /g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .substring(0, this.MAX_ID_LENGTH)
  }

  static isValidId(id: string, otherIds: string[]): boolean {
    return id.trim().length > 0 &&
      otherIds.find(otherId => otherId.trim() === id.trim()) === undefined && 
      id.match(/^[a-z_][a-z0-9_]*$/) !== null
  }
}