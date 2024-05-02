import styles from "@/components/tab_view/TabView.module.scss"
import { useState } from "react"
import Icon from "../Icon"

export interface Tab {
  id: string
  icon?: string
  label?: string
  content: React.ReactNode
}

export default function TabView({ id, className, tabs, vertical, collapsible }: {
  id?: string
  className?: string
  tabs: Tab[],
  vertical?: boolean
  collapsible?: boolean
}) {
  const [activeTab, setActiveTab] = useState(tabs[0].id)
  const [isCollapsed, setIsCollapsed] = useState(!!collapsible)

  return (
    <div id={id} className={`${styles.tabView} ${vertical ? styles.vertical : ""} ${className ?? ""}`} data-is-collapsed={isCollapsed}>
      <div id={styles.tabs}>
        {tabs.map(tab => (
          <div key={tab.id} className={`${styles.tab} ${tab.id === activeTab && !isCollapsed ? styles.activeTab : ""}`}
            onClick={() => {
              if (activeTab !== tab.id) {
                setActiveTab(tab.id)
                setIsCollapsed(false)
              } else if (collapsible) setIsCollapsed(!isCollapsed)
            }}
          >
            { tab.icon && <Icon iconId={tab.icon} /> }
            { tab.label && <span className={styles.label}>{tab.label}</span> }
          </div>
        ))}
      </div>

      <div id={styles.leaf} className={`${collapsible ? styles.collapsible : ""} ${isCollapsed ? styles.collapsed : ""}`}>
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}