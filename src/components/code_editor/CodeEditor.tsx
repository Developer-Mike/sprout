import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/code_editor/CodeEditor.module.scss"
import { TAB_SIZE } from "@/constants"
import { useContext, useEffect } from "react"

export default function CodeEditor() {
  const { project } = useContext(ProjectContext)

  const onCodeChange = () => {
    const codeElement = document.getElementById(styles.codeEditor) as HTMLDivElement
    if (!codeElement) return

    const code = codeElement.textContent || ""
    project.getActiveGameObject().code = code

    // Update line numbers
    const lineNumbers = document.getElementById(styles.codeLineNumbers) as HTMLDivElement
    if (lineNumbers) {
      const lineCount = (code.match(/\n/g)?.length ?? 0) + 1
      lineNumbers.textContent = Array.from({ length: lineCount }, (_, i) => i + 1).join("\n")
    }

    // Update code highlight
    const highlight = document.getElementById(styles.codeHighlight) as HTMLDivElement
    if (highlight) {
      // TODO: Highlight code
      // Just a proof of concept for now
      const highlightedCode = code.replace(
        /(function|if|else|while|for|return|const|let|var|new|class|extends|export|import|default|from|async|await|=>)/g, 
        `<span class='${styles.keyword}'>$1</span>`
      ).replace(
        /(;|\.)/g, 
        `<span class='${styles.punctuation}'>$1</span>`
      )

      highlight.innerHTML = highlightedCode
    }
  }

  useEffect(() => {
    const code = document.getElementById(styles.codeEditor) as HTMLDivElement
    if (!code) return

    code.textContent = project.getActiveGameObject().code
    onCodeChange()
  }, [project, project.data.workspace.selectedGameObject])

  return (
    <div id={styles.codeContainer}>
      <code id={styles.codeLineNumbers} />

      <div id={styles.code}>
        <code id={styles.codeEditor}
          contentEditable={true} spellCheck={false} 
          onInput={onCodeChange}
          onKeyDown={(e) => {
            if (e.key !== "Tab") return

            e.preventDefault()
            document.execCommand("insertText", false, " ".repeat(TAB_SIZE))
          }}
        />

        <code id={styles.codeHighlight} />
      </div>
    </div>
  )
}