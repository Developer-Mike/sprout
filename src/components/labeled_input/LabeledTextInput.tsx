import style from "./LabeledInput.module.scss"

export default function LabeledTextInput({ label, value, onChange }: {
  label: string
  value?: any
  onChange?: (value: string) => void
}) {
  return (
    <label className={style.container}>
      <span className={style.label}>{label}</span>
      <input className={style.input} type="text" onInput={e => onChange?.(e.currentTarget.value)} value={value} />
    </label>
  )
}