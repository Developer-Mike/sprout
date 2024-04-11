import style from "./LabeledInput.module.scss"

export default function LabeledInput({ label, value, onChange }: {
  label: string,
  value?: string,
  onChange?: (value: string) => void
}) {
  return (
    <label className={style.container}>
      <span className={style.label}>{label}</span>
      <input className={style.input} onChange={e => onChange?.(e.target.value)} value={value} />
    </label>
  )
}