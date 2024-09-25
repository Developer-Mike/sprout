import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/code-editor/CodeEditor.module.scss"
import { SPROUT_LANGUAGE_KEY, SPROUT_THEME_KEY } from "@/constants"
import { KEYWORDS_MAP } from "@/core/compiler/token"
import { Editor, useMonaco } from "@monaco-editor/react"
import { useRouter } from "next/router"
import { useContext, useEffect } from "react"

export default function CodeEditor() {
  const { project } = useContext(ProjectContext)
  const router = useRouter()

  const monaco = useMonaco()
  useEffect(() => {
    if (!monaco) return

    setLanguage(monaco)
    setTheme(monaco)

    monaco.languages.registerCompletionItemProvider(SPROUT_LANGUAGE_KEY, project.getAutocompletionProvider(monaco))
  }, [monaco])

  useEffect(() => { (async () => {
    if (!monaco) return

    const editor = monaco.editor.getModels()[0]
    if (!editor) return

    // Compile the game object's code
    await project.compileAST(project.selectedGameObjectKey)

    const errors = project.compiledASTs[project.selectedGameObjectKey]?.errors
    if (!errors) return

    const errorMarkers = errors.map(error => {
      const startPos = editor.getPositionAt(error.location.start)
      const endPos = editor.getPositionAt(error.location.end)

      return {
        startLineNumber: startPos.lineNumber,
        startColumn: startPos.column,
        endLineNumber: endPos.lineNumber,
        endColumn: endPos.column,
        message: error.message,
        severity: monaco.MarkerSeverity.Error
      }
    })

    monaco.editor.setModelMarkers(editor, "error", errorMarkers)
  })() }, [monaco, project, project.selectedGameObjectKey, project.selectedGameObject.code]) // TODO: Throttle

  if (router.query["tokens"]) {
    useEffect(() => {
      if (!monaco) return

      const editor = monaco.editor.getModels()[0]
      if (!editor) return

      const tokens = project.compiledASTs[project.selectedGameObjectKey]?.tokens
      if (!tokens) return

      // Clear previous decorations
      const oldDecorations = editor.getAllDecorations().map(decoration => decoration.id)
      editor.deltaDecorations(oldDecorations, [])

      for (const token of tokens) {
        const startPos = editor.getPositionAt(token.location.start)
        const endPos = editor.getPositionAt(token.location.end)

        editor.deltaDecorations([], [{
          range: new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
          options: { className: styles[`token-${token.getDebugCategory()}`], hoverMessage: { value: token.toString() } }
        }])
      }
    }, [monaco, project.compiledASTs, project.selectedGameObject.id])
  }

  return (
    <div id={styles.codeEditorContainer}>
      <Editor
        theme={SPROUT_THEME_KEY}
        language={SPROUT_LANGUAGE_KEY}
        options={{ 
          padding: { top: 10 },
          minimap: { enabled: false }
        }}
        path={project.selectedGameObjectKey}
        value={project.selectedGameObject.code}
        onChange={value => project.updateData(null, data => {
          data.gameObjects[project.selectedGameObjectKey].code = value ?? ""
        })}
      />

      <img id={styles.gameObjectPreview} src={project.getActiveSprite(project.selectedGameObject).src} />
    </div>
  )
}

function setLanguage(monaco: any) {
  monaco.languages.register({ id: SPROUT_LANGUAGE_KEY })

  monaco.languages.setMonarchTokensProvider(SPROUT_LANGUAGE_KEY, {
    keywords: Object.keys(KEYWORDS_MAP),
    tokenizer: {
      root: [
        [/@?[a-zA-Z_][\w$]*/, {
          cases: {
            "@keywords": "keyword",
            "@default": "identifier"
          }
        }],
        [/\/\/.*/, "comment"],
        [/\/\*/, { token: "comment", next: "comment" }],
        [/".*?"/, "string"],
        [/\d+/, "number"],
        [/\d*\.\d+/, "number.float"],
        [/[(){}[\]]/, "@brackets"],
        [/[;,.]/, "delimiter"],
        [/[=<>!%*/+-]/, "operator"],
      ],
      comment: [
        [/\*\//, { token: "comment", next: "@pop" }],
        [/./, "comment"]
      ]
    }
  })

  monaco.languages.setLanguageConfiguration(SPROUT_LANGUAGE_KEY, {
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"]
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: "\"", close: "\"", notIn: ["string"] }
    ]
  })
}

function setTheme(monaco: any) {
  const cssVariable = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name)

  monaco.editor.defineTheme(SPROUT_THEME_KEY, {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": cssVariable("--container-low"),
      "editor.lineHighlightBackground": cssVariable("--container-high"),

      "editorGutter.background": cssVariable("--container-low"),
      "editorLineNumber.foreground": cssVariable("--primary-dim"),

      "editor.selectionBackground": cssVariable("--primary-very-dim"),
      "editorCursor.foreground": cssVariable("--primary"),
      "editorWhitespace.foreground": cssVariable("--primary"),
    }
  })

  monaco.editor.setTheme(SPROUT_THEME_KEY)
}