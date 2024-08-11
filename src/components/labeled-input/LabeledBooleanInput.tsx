import { useState } from "react"
import style from "./LabeledInput.module.scss"
import Icon from "../Icon"

export default function LabeledBooleanInput({ label, value, onChange }: {
  label: string
  value?: boolean
  onChange?: (value: boolean) => void
}) {
  const [checked, _setChecked] = useState(value ?? false)
  const setChecked = (value: boolean) => {
    _setChecked(value)
    onChange?.(value)
  }

  return (
    <label className={style.container}>
      <span className={style.label}>{label}</span>
      <div className={style.checkbox} onClick={() => setChecked(!checked)}>
        <Icon iconId={checked ? "check" : "close"} />
      </div>
    </label>
  )
}