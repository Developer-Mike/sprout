import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/code-editor/CodeEditor.module.scss"
import { DEBUG_HIGHLIGHT_TOKENS, SPROUT_LANGUAGE_KEY } from "@/constants"
import Token from "@/core/compiler/token"
import { Editor, useMonaco } from "@monaco-editor/react"
import { useContext, useEffect } from "react"

export default function CodeEditor() {
  const { project, debugInfo } = useContext(ProjectContext)

  const monaco = useMonaco()
  useEffect(() => {
    if (!monaco) return
    setTheme(monaco)
  }, [monaco])

  useEffect(() => {
    if (!DEBUG_HIGHLIGHT_TOKENS) return
    if (!monaco) return

    const tokens = debugInfo.compiler?.[project.selectedGameObject.id]?.tokens as Token[] | undefined
    if (!tokens) return

    const editor = monaco.editor.getModels()[0]
    if (!editor) return

    // Clear previous decorations
    const oldDecorations = editor.getAllDecorations().map(decoration => decoration.id)
    editor.deltaDecorations(oldDecorations, [])

    for (const token of tokens) {
      const startPos = editor.getPositionAt(token.location.start)
      const endPos = editor.getPositionAt(token.location.end)

      editor.deltaDecorations([], [{
        range: new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
        options: { className: styles[`token-${token.getDebugCategory()}`] }
      }])
    }
  }, [monaco, debugInfo, project.selectedGameObject.id])

  return (
    <div id={styles.codeEditorContainer}>
      <Editor
        theme="sproutTheme"
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

      <img id={styles.gameObjectPreview} 
        src={project.data.sprites[
          project.selectedGameObject.sprites[
            project.selectedGameObject.active_sprite
          ]
        ]}
      />
    </div>
  )
}

function setTheme(monaco: any) {
  const cssVariable = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name)

  monaco.editor.defineTheme("sproutTheme", {
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

  monaco.editor.setTheme("sproutTheme")
}