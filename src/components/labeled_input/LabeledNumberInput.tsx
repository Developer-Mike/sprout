import style from "./LabeledInput.module.scss"

export default function LabeledNumberInput({ label, value, precision, onChange }: {
  label: string
  value?: number
  precision?: number
  onChange?: (value: number) => void
}) {
  return (
    <label className={style.container}>
      <span className={style.label}>{label}</span>
      <input className={style.input} type="text" onInput={e => {
        const value = parseFloat(parseFloat(e.currentTarget.value).toFixed(precision ?? 20)) 

        if (isNaN(value)) onChange?.(0)
        else onChange?.(value)
      }} value={value} />
    </label>
  )
}