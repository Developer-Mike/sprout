export default interface LogItem {
  message: string
  type: LogItemType
}

export enum LogItemType {
  INFO = "info",
  ERROR = "error"
}