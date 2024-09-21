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
  return a
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
  `
var test = 1
test += 1
//test++
  `,
  `
if (test == 1) {
  console.log("Test is 1")
} else if (test <= 2) {
 console.log("Test is less than or equal to 2")
} else {
 console.log("Test is greater than 2")
}`,
  `
var a = 1
for (i in range(10)) {
  a += i
}
  `,
  `
var a = 1
if (100 == 100) console.log("Hello, World!")
else console.log("Goodbye, World!")
  `,
  `
if (true) continue
else break
  `,
  `
on (true) {
  console.log("Hello, World!")
}
  `,
  `
while (i < 5) {
  i += 1
}
  `,
  `
break
continue
return null
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
        errors: result.errors,
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