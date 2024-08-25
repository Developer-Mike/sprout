import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/code-editor/CodeEditor.module.scss"
import { SPROUT_LANGUAGE_KEY } from "@/constants"
import { Editor, useMonaco } from "@monaco-editor/react"
import { useContext, useEffect } from "react"

export default function CodeEditor() {
  const { project } = useContext(ProjectContext)

  const monaco = useMonaco()
  useEffect(() => {
    if (!monaco) return
    setTheme(monaco)
  }, [monaco])

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
            project.selectedGameObject.activeSprite
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