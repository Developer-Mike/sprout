import SourceLocation from "../source-location"

export default abstract class AST {
  abstract sourceLocation: SourceLocation
  abstract toJavaScript(): string

  getAllASTsOfType<T extends AST>(type: new (...args: any[]) => T): T[] {
    const openASTs: AST[] = [this]
    const foundASTs: T[] = []

    while (openASTs.length > 0) {
      const ast = openASTs.pop()!
      if (ast instanceof type) foundASTs.push(ast as T)

      for (const key in ast) {
        const nested = (ast as any)[key]

        if (nested instanceof AST)
          openASTs.push(nested)
        else if (Array.isArray(nested)) 
          nested.filter((a: any) => a instanceof AST).forEach((a: any) => openASTs.push(a))
      }
    }

    return foundASTs
  }
}