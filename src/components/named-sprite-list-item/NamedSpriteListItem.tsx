import Icon from "../Icon"
import styles from "./NamedSpriteListItem.module.scss"

export default function NamedSpriteListItem({ className, label, src, draggable, onDragStart, onDragEnd, onClick, onContextMenu, isFocused, onDelete }: {
  className?: string
  label: string
  src: string
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
  onClick: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  isFocused?: boolean
  onDelete?: () => void
}) {
  return (
    <div className={`${styles.listItem} ${isFocused ? styles.focused : ""} ${className ?? ""}`}
      onClick={onClick} onContextMenu={onContextMenu}
      draggable={draggable} onDragStart={onDragStart} onDragEnd={onDragEnd}
    >
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