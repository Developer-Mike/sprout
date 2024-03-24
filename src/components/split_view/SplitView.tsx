import styles from "@/components/split_view/SplitView.module.scss"

export default function SplitView({ children, id, className, horizontal, vertical }: {
  children: React.ReactNode
  id?: string
  className?: string
  horizontal?: boolean
  vertical?: boolean
}) {
  return (
    <div id={id} className={`${className ?? ""} ${styles.split} ${vertical ? styles.vertical : ""} ${horizontal ? styles.horizontal : ""}`}>
      {children}
    </div>
  )
}