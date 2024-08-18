export default function Icon({ id, iconId }: { 
  id?: string,
  iconId: string 
}) {
  return (
    <div style={{ fontSize: "0" }}>
      <span id={id} className="material-symbols-rounded" style={{ userSelect: "none" }}>
        {iconId}
      </span>
    </div>
  )
}
