export default function Icon({ id, className, iconId }: { 
  id?: string,
  className?: string,
  iconId: string 
}) {
  return (
    <div style={{ fontSize: "0" }}>
      <span id={id} className={`material-symbols-rounded ${className ?? ""}`} style={{ userSelect: "none" }}>
        {iconId}
      </span>
    </div>
  )
}
