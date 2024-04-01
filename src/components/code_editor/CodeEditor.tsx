import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/code_editor/CodeEditor.module.scss"
import { TAB_SIZE } from "@/constants"
import { useContext, useEffect } from "react"

export default function CodeEditor({ selectedGameObject }: {
  selectedGameObject: string
}) {
  const project = useContext(ProjectContext)

  useEffect(() => {
    const code = document.getElementById(styles.code) as HTMLDivElement
    if (!code) return

    code.textContent = project.getActiveGameObject().code
  }, [selectedGameObject])

  return (
    <code id={styles.code} 
      contentEditable={true} spellCheck={false} 
      onKeyDown={(e) => {
        if (e.key === "Tab") {
          e.preventDefault()
          document.execCommand("insertText", false, " ".repeat(TAB_SIZE))
        }
      }}
    />
  )
}