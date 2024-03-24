import styles from "@/components/navbar/Navbar.module.scss"
import React, { ReactElement } from "react"

export default function Navbar({ startItems, endItems }: {
  startItems?: ReactElement[]
  endItems?: ReactElement[]
}) {
  return (
    <div id={styles.navbar}>
      <img id={styles.logoIcon} src="/sprout.svg" alt="Sprout logo" />
      <h1 id={styles.logo}>Sprout</h1>

      {startItems?.map((item, index) => (
        React.cloneElement(item, { key: index, className: `${item.props.className} ${styles.navItem}` })
      ))}

      <div className={styles.spacer} />

      {endItems?.map((item, index) => (
        React.cloneElement(item, { key: index, className: `${item.props.className} ${styles.navItem}` })
      ))}
    </div>
  )
}
