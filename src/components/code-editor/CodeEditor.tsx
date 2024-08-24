import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/code-editor/CodeEditor.module.scss"
import { Editor, useMonaco } from "@monaco-editor/react"
import type monaco from 'monaco-editor'
import { useContext, useEffect, useRef } from "react"

export default function CodeEditor() {
  const { project } = useContext(ProjectContext)

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const monaco = useMonaco()
  useEffect(() => {
    if (!monaco) return
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
  }, [monaco])

  const onCodeChange = async () => {
    const code = editorRef.current?.getValue()
    if (!code) return

    await project.updateData(null, data => {
      data.gameObjects[project.activeGameObjectIndex].code = code
    })
  }

  useEffect(() => {
    const code = document.getElementById(styles.codeEditor) as HTMLDivElement
    if (!code) return

    onCodeChange()
  }, [project, project.data.workspace.selectedGameObjectId, project.activeGameObject.code])

  return (
    <div id={styles.codeEditorContainer}>
      <Editor onMount={editor => editorRef.current = editor}
        options={{ 
          padding: { top: 10 },
          minimap: { enabled: false }
        }}
        theme="sproutTheme"
        language="javascript"
        value={project.activeGameObject.code}
        onChange={onCodeChange}
      />

      <img id={styles.gameObjectPreview} 
        src={project.data.sprites[
          project.activeGameObject.sprites[
            project.activeGameObject.activeSprite
          ]
        ]}
      />
    </div>
  )
}