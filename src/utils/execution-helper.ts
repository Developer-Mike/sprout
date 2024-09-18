export default class ExecutionHelper {
  static scopedEval(src: string, ctx: any) {
    ctx = new Proxy(ctx, {
      has: () => true
    })

    let func = (new Function("with(this) { " + src + "}"))
    func.call(ctx)
  }
}