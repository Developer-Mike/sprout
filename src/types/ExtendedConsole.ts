export type ExtendedConsole = typeof console & {
  runtimeLog: (...params: any[]) => void
}