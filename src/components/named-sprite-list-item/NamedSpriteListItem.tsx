import Icon from "../Icon"
import styles from "./NamedSpriteListItem.module.scss"

export default function NamedSpriteListItem({ className, label, src, onClick, isFocused, onDelete }: {
  className?: string
  label: string
  src: string
  onClick: () => void
  isFocused?: boolean
  onDelete?: () => void
}) {
  return (
    <div className={`${styles.listItem} ${isFocused ? styles.focused : ""} ${className ?? ""}`} onClick={onClick}>
      <img className={styles.image} src={src} alt={label} />
      <span className={styles.label}>{label}</span>

      { onDelete !== undefined && <div className={styles.delete}
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.()
          }}
        >
          <Icon iconId="delete" />
        </div>
      }
    </div>
  )
}