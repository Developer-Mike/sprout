import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/code-editor/CodeEditor.module.scss"
import { Editor, useMonaco } from "@monaco-editor/react"
import { useContext, useEffect } from "react"

export default function CodeEditor() {
  const { project } = useContext(ProjectContext)

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
    const code = monaco?.editor?.getValue()
    if (!code) return

    console.log(code)

    /*
    await project.updateData(null, data => {
      data.gameObjects[project.activeGameObjectIndex].code = code
    })
    */
  }

  useEffect(() => {

  }, [project, project.data.workspace.selectedGameObjectKey, project.selectedGameObject?.code])

  return (
    <div id={styles.codeEditorContainer}>
      <Editor
        options={{ 
          padding: { top: 10 },
          minimap: { enabled: false }
        }}
        theme="sproutTheme"
        language="javascript"
        onChange={onCodeChange}
      />

      <img id={styles.gameObjectPreview} 
        src={project.data.sprites[
          project.selectedGameObject.sprites[
            project.selectedGameObject.activeSprite
          ]
        ]}
      />
    </div>
  )
}