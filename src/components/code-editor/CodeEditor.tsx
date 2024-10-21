import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/code-editor/CodeEditor.module.scss"
import { SPROUT_LANGUAGE_KEY, SPROUT_THEME_KEY } from "@/constants"
import { KEYWORDS_MAP } from "@/core/compiler/token"
import { Editor, useMonaco } from "@monaco-editor/react"
import { useRouter } from "next/router"
import { useContext, useEffect, useState } from "react"
import ConsoleView from "../console-view/ConsoleView"

export default function CodeEditor() {
  const { project } = useContext(ProjectContext)
  const router = useRouter()
  const monaco = useMonaco()

  const setupModel = (model: any) => {
    validate()

    model.onDidChangeContent(() => {
      project.updateData(null, data => {
        data.gameObjects[project.selectedGameObjectKey].code = model.getValue()
      }).then(() => validate())
    })
  }

  useEffect(() => {
    if (!monaco) return

    setLanguage(monaco)
    setTheme(monaco)

    const autocompletionProvider = monaco.languages.registerCompletionItemProvider(
      SPROUT_LANGUAGE_KEY, 
      project.getAutocompletionProvider(monaco)
    )

    // Validate the code of the current model and future models created
    const model = monaco.editor.getModels()[0]
    if (model) setupModel(model)
    
    monaco.editor.onDidCreateModel(model => setupModel(model))

    return () => {
      monaco.editor.getModels().forEach(model => model.dispose())
      monaco.editor.getEditors().forEach(editor => editor.dispose())
      autocompletionProvider.dispose()
    }
  }, [monaco])

  const validate = async () => {
    if (!monaco) return

    const editor = monaco.editor.getModel(monaco.Uri.parse(project.selectedGameObjectKey))
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

    monaco.editor.setModelMarkers(editor, SPROUT_LANGUAGE_KEY, errorMarkers)
  }

  if (router.query["tokens"]) {
    const [tokenDecorationsIdentifiers, setTokenDecorationsIdentifiers] = useState<string[]>([])

    useEffect(() => {
      if (!monaco) return

      const editor = monaco.editor.getModel(monaco.Uri.parse(project.selectedGameObjectKey))
      if (!editor) return

      const tokens = project.compiledASTs[project.selectedGameObjectKey]?.tokens
      if (!tokens) return

      // Create new decorations
      const newTokenDecorations = tokens.map(token => {
        const startPos = editor.getPositionAt(token.location.start)
        const endPos = editor.getPositionAt(token.location.end)

        return {
          range: new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
          options: { className: styles[`token-${token.getDebugCategory()}`], hoverMessage: { value: token.toString() } }
        }
      })

      // Apply new decorations
      setTokenDecorationsIdentifiers(editor.deltaDecorations(tokenDecorationsIdentifiers, newTokenDecorations))
    }, [monaco, project.compiledASTs, project.selectedGameObject.id])
  }

  return (
    <div id={styles.codeEditorContainer}>
      <Editor
        theme={SPROUT_THEME_KEY}
        language={SPROUT_LANGUAGE_KEY}
        options={{
          fixedOverflowWidgets: true,
          tabSize: 2,
          padding: { top: 10 },
          minimap: { enabled: false }
        }}
        path={project.selectedGameObjectKey}
        value={project.selectedGameObject.code}
      />

      <img id={styles.gameObjectPreview} src={project.getActiveSprite(project.selectedGameObject).src} />
      <ConsoleView />
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