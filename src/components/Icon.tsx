export default function Icon({ iconId }: { 
  iconId: string 
}) {
  return (
    <span className="material-symbols-rounded">
      {iconId}
    </span>
  )
}
