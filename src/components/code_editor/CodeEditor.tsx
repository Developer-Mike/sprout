import styles from "@/components/code_editor/CodeEditor.module.scss"

export default function CodeEditor() {
  return (
    <code id={styles.code} contentEditable={true} spellCheck={false} />
  )
}