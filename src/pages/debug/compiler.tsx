import DefaultHead from "@/components/DefaultHead"
import CompileError from "@/core/compiler/compile-error"
import Compiler from "@/core/compiler/compiler"
import { useEffect, useState } from "react"

const TEST_SNIPPETS = [
  `
fun main = () {}
  `,
  `
fun main = (a_random_variable) {
  var a = a_random_variable + "test"
}
  `,
  `
console.log("Hello, World!")
console?.log("Hello, World!")
  `,
  `
var ok = 1
ok = (2 + ok / 3) * 4
test()
  `,
]

export default function CompilerDebug() {
  const [outputs, setOutputs] = useState<{ output: string, errors: CompileError[] }[]>([])

  useEffect(() => {
    const compiler = new Compiler()
    setOutputs(TEST_SNIPPETS.map((snippet, i) => {
      console.log(`Compiling snippet with index ${i}`)
      console.log(snippet)

      const result = compiler.compile(snippet)

      console.log(result.tokens.map(token => token.toString()).join("\n"))

      return {
        output: result.toJavaScript(),
        errors: [...result.errors],
      }
    }))
  }, [])

  return (
    <>
      <DefaultHead title="Compiler Debug"/>
      <main>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Snippet</th>
              <th>Output</th>
              <th>Errors</th>
            </tr>
          </thead>
          <tbody>
            {TEST_SNIPPETS.map((snippet, i) => (
              <tr key={i} style={{ border: "1px solid white" }}>
                <td><pre>{snippet}</pre></td>
                <td><pre>{outputs[i]?.output}</pre></td>
                <td>
                  <ul>
                    {outputs[i]?.errors.map((error, j) => (
                      <li key={j}>{error.toString()}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  )
}