export default class ExecutionHelper {
  static scopedEval(src: string, ctx: any, onError?: (error: Error) => void) {
    ctx = new Proxy(ctx, {
      has: () => true
    })

    let func = new Function(`with(this) { ${src} }`)

    try {
      func.call(ctx)?.catch?.(onError)
    } catch (error) {
      onError?.(error as Error)
    }
  }
}