import styles from "@/components/navbar/Navbar.module.scss"
import useTranslation from "next-translate/useTranslation"
import { useRouter } from "next/router"
import React, { MouseEvent, ReactElement, useEffect, useState } from "react"

export interface NavbarItem {
  element: ReactElement
  nested?: ReactElement[]
  align?: "start" | "end"
  customStyling?: boolean
}

export default function Navbar({ onReroutingHome, items }: {
  onReroutingHome?: () => Promise<void>
  items: NavbarItem[]
}) {
  const { t } = useTranslation("common")
  const router = useRouter()

  const [selectedItem, _setSelectedItem] = useState<NavbarItem | null>(null)
  const setSelectedItem = (item: NavbarItem | null) => {
    _setSelectedItem((item?.nested && item !== selectedItem) ? item : null)
  }

  const generateItems = (items: NavbarItem[]) => {
    return items.map((item, index) => (
      <div key={index} 
        className={`${styles.navItemContainer} ${item == selectedItem ? styles.selected : ""}`}
        onClick={() => { setSelectedItem(item) }}
      >
        { React.cloneElement(item.element, { 
          className: `${item.element.props.className} ${item.customStyling ? "" : styles.navItem}`, 
        }) }

        { item.nested && item.nested.length > 0 && (
          <div className={styles.dropdownContainer}>
            { item.nested.map((nestedItem, nestedIndex) => (
              React.cloneElement(nestedItem, { key: nestedIndex, className: `${nestedItem.props.className} ${styles.dropdownItem}` })
            )) }
          </div>
        ) }
      </div>
    ))
  }

  useEffect(() => {
    const checkBlurred: any = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest(`.${styles.navItemContainer}`)) return

      _setSelectedItem(null)
    }
    document.addEventListener("click", checkBlurred)

    return () => { document.removeEventListener("click", checkBlurred) }
  }, [])

  return (
    <div id={styles.navbar}>
      <button id={styles.logoContainer} onClick={async () => {
        if (onReroutingHome) await onReroutingHome()
        
        const targetRoute = router.pathname == "/builder" ? "/projects-overview" : "/"
        router.push(targetRoute)
      }}>
        <img id={styles.logoIcon} src="/sprout.svg" alt="Sprout logo" />
        <h1 id={styles.logo}>{t("project-name")}</h1>
      </button>

      { generateItems(items.filter((item) => item.align !== "end")) }
      <div className={styles.spacer} />
      { generateItems(items.filter((item) => item.align === "end")) }
    </div>
  )
}
