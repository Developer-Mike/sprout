import styles from "@/components/dialog/Dialog.module.scss"
import React from "react"
import { createContext, useCallback, useState } from "react"

export type Dialog = {
  id: string
  title: string
  content: React.ReactNode
  actions: DialogAction[]
}

export type DialogAction = {
  default?: boolean
  element: React.ReactNode
  onClick: (hide: () => void) => void
}

export const DialogContext = createContext<{
  dialogs: Dialog[]
  getCurrentDialog: () => HTMLElement | null
  showDialog: (dialog: Dialog) => void
  hideDialog: (id: string) => void
}>({
  dialogs: [],
  getCurrentDialog: () => null,
  showDialog: () => { },
  hideDialog: () => { }
})

export default function DialogWrapper({ children }: {
  children: React.ReactNode
}) {
  const [dialogs, setDialogs] = useState<Dialog[]>([])

  const getCurrentDialog = useCallback(() => document.getElementById(styles.dialog), [])

  const showDialog = useCallback((dialog: Dialog) => {
    setDialogs([...dialogs, dialog])
  }, [dialogs])

  const hideDialog = useCallback((id: string) => {
    setDialogs(dialogs.filter(d => d.id !== id))
  }, [dialogs])

  return (
    <DialogContext.Provider value={{
      dialogs,
      getCurrentDialog,
      showDialog,
      hideDialog
    }}>
      {children}

      <div id={styles.dialogBackground} className={dialogs.length > 0 ? styles.visible : ""} 
        onClick={(e) => {
          if (e.target !== e.currentTarget) return
          const defaultAction = dialogs[0]?.actions.find(action => action.default)
          defaultAction?.onClick(() => hideDialog(dialogs[0].id))
        }}
      >
        <div id={styles.dialog}>
          <h1 id={styles.dialogTitle}>{dialogs[0]?.title}</h1>

          <div>{dialogs[0]?.content}</div>

          <div id={styles.dialogActions}>
            {dialogs[0]?.actions?.map((action, i) =>
              React.cloneElement(
                action.element as React.ReactElement,
                { key: i, onClick: () => action.onClick(() => hideDialog(dialogs[0].id)) }
              )
            )}
          </div>
        </div>
      </div>
    </DialogContext.Provider>
  )
}