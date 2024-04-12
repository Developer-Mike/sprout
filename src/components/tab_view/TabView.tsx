import styles from "@/components/tab_view/TabView.module.scss"
import { useState } from "react"
import Icon from "../Icon"

export interface ActionButton {
  icon: string
  onClick: () => void
}

export interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

export default function TabView({ id, className, tabs, actionButtons }: {
  id?: string
  className?: string
  tabs: Tab[]
  actionButtons?: ActionButton[]
}) {
  const [activeTab, setActiveTab] = useState(tabs[0].id)

  return (
    <div id={id} className={`${styles.tabView} ${className ?? ""}`}>
      <div id={styles.tabs}>
        {actionButtons && actionButtons.map((button, index) => (
          <div key={index} className={`${styles.actionButton} button`} onClick={button.onClick}>
            <Icon iconId={button.icon} />
          </div>
        ))}

        {tabs.map(tab => (
          <div key={tab.id} className={`${styles.tab} ${tab.id === activeTab ? styles.activeTab : ""}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </div>
        ))}
      </div>

      <div id={styles.leaf}>
        { tabs.find(tab => tab.id === activeTab)?.content }
      </div>
    </div>
  )
}