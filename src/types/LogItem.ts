export default interface LogItem {
  gameObjectId: string | null
  message: string
  type: LogItemType
}

export enum LogItemType {
  INFO = "info",
  ERROR = "error"
}