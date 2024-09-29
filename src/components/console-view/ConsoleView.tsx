import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/console-view/ConsoleView.module.scss"
import { useContext, useEffect, useMemo, useState } from "react"
import Icon from "../Icon"

export default function ConsoleView() {
  const { project } = useContext(ProjectContext)

  const [consoleOpen, setConsoleOpen] = useState(false)
  const [readMessagesAmount, setReadMessagesAmount] = useState(0)

  useEffect(() => {
    if (readMessagesAmount > project.consoleOutput.length)
      setReadMessagesAmount(project.consoleOutput.length)
  }, [project.consoleOutput.length])

  const logTypeClassMap = useMemo(() => ({
    info: undefined,
    error: styles.error
  }), [])

  return (
    <div id={styles.consoleView} onClick={() => { if (consoleOpen) setReadMessagesAmount(project.consoleOutput.length) }}>
      { consoleOpen && (
        <div id={styles.consoleContainer}>
          <div id={styles.console}>
            { project.consoleOutput.toReversed().map((message, index) => (
              <div key={index}
                className={`${styles.consoleLine} ${logTypeClassMap[message.type] ?? ""} ${(project.consoleOutput.length - index) > readMessagesAmount ? styles.unread : ""}`}
              >{message.message.toString()}</div>
            )) }
          </div>
        </div>
      ) }

      <button id={styles.openConsoleButton} className={`${readMessagesAmount < project.consoleOutput.length ? "primary" : ""} ${consoleOpen ? styles.open : ""}`}
        onClick={() => setConsoleOpen(!consoleOpen)}
      ><Icon iconId="terminal" /></button>
    </div>
  )
}