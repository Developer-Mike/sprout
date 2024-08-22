import { useEffect, useState } from "react"
import style from "./LabeledInput.module.scss"

export default function LabeledTextInput({ label, value, makeValid, isValidValue, onChange }: {
  label: string
  value?: any
  makeValid?: (value: string) => string
  isValidValue?: (value: string) => boolean
  onChange?: (value: string) => void,
}) {
  const [cachedValue, setCachedValue] = useState(value)
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    setCachedValue(value)
    setIsValid(isValidValue ? isValidValue(value) : true)
  }, [value])

  return (
    <label className={`${style.container} ${!isValid ? style.invalid : ""}`}>
      <span className={style.label}>{label}</span>
      <input className={style.input} type="text" value={cachedValue}
        autoCapitalize="false" autoComplete="false" autoCorrect="false" spellCheck="false"
        onKeyDown={e => {
          if (e.key !== "Enter") return
          e.currentTarget.blur()
        }}
        onChange={e => {
          let value = e.target.value

          if (makeValid) {
            value = makeValid(value)
            e.target.value = value
          }

          setCachedValue(value)

          const isValid =  isValidValue ? isValidValue(value) : true
          setIsValid(isValid)

          if (isValid) onChange?.(value)
        }}
      />
    </label>
  )
}