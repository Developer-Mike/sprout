import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/console-view/ConsoleView.module.scss"
import { useContext, useEffect, useMemo, useState } from "react"
import Icon from "../Icon"
import { LogItemType } from "@/types/LogItem"

export default function ConsoleView() {
  const { project } = useContext(ProjectContext)

  const [consoleOpen, setConsoleOpen] = useState(false)
  const [readMessagesAmount, setReadMessagesAmount] = useState(0)
  
  const hasUnreadMessages = useMemo(() => 
    project.consoleOutput.length > readMessagesAmount, 
  [project.consoleOutput, readMessagesAmount])
  const hasUnreadErrors = useMemo(() => 
    project.consoleOutput.some((message, index) => message.type === LogItemType.ERROR && index >= readMessagesAmount), 
  [project.consoleOutput, readMessagesAmount])

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
            { project.consoleOutput.toReversed().map((logEntry, index) => (
              <div key={index}
                className={`${styles.consoleLine} ${logTypeClassMap[logEntry.type] ?? ""} ${(project.consoleOutput.length - index) > readMessagesAmount ? styles.unread : ""}`}
              >{logEntry.gameObjectId ? `[${logEntry.gameObjectId}] ` : ""}{logEntry.message.toString()}</div>
            )) }
          </div>
        </div>
      ) }

      <button id={styles.openConsoleButton} 
        className={`${hasUnreadMessages ? (hasUnreadErrors ? "danger" : "primary") : ""} ${consoleOpen ? styles.open : ""}`}
        onClick={() => setConsoleOpen(!consoleOpen)}
      ><Icon iconId="terminal" /></button>
    </div>
  )
}