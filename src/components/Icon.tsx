export default function Icon({ id, iconId }: { 
  id?: string,
  iconId: string 
}) {
  return (
    <span id={id} className="material-symbols-rounded" style={{ userSelect: "none" }}>
      {iconId}
    </span>
  )
}
