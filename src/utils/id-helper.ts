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
    const strippedId = id
      .replace(/[A-Z]/g, match => match.toLowerCase())
      .replace(/ /g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .substring(0, this.MAX_ID_LENGTH)

    if (strippedId.length == 0) return "_"
    if (strippedId[0].match(/[0-9]/)) return "_" + strippedId

    return strippedId
  }

  static isValidId(id: string, otherIds: string[]): boolean {
    return id.trim().length > 0 &&
      !otherIds.some(otherId => otherId.trim() == id.trim()) && 
      id.match(/^[a-z_][a-z0-9_]*$/) !== null
  }
}