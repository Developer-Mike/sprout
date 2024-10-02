import { useCallback, useEffect, useRef, useState } from "react"
import style from "./LabeledInput.module.scss"

export default function LabeledNumberInput({ label, value, precision, dragSensitivity, onChange }: {
  label: string
  value?: number
  precision?: number
  dragSensitivity?: number
  onChange?: (value: number, inputType: InputType) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [stringValue, setStringValue] = useState(value?.toString())
  useEffect(() => {
    if (inputRef.current === document.activeElement) return
    setStringValue(value?.toString())
  }, [value])

  const [isBeingDragged, setIsBeingDragged] = useState(false)

  const dispatchOnChange = useCallback((input: HTMLInputElement, inputType: InputType) => {
    const numericalValue = parseFloat(parseFloat(input.value).toFixed(precision ?? 20))

    setStringValue(input.value)
    onChange?.(isNaN(numericalValue) ? 0 : numericalValue, inputType)
  }, [onChange])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isBeingDragged) return

      const input = inputRef.current
      if (!input) return

      const newValue = parseFloat((parseFloat(input.value) + e.movementX * (dragSensitivity ?? 1)).toFixed(precision ?? 20)).toString()
      if (input.value === newValue) return

      input.value = newValue
      dispatchOnChange(input, InputType.Dragging)
    }
    window.addEventListener("mousemove", onMouseMove)

    const onMouseUp = () => {
      if (!isBeingDragged) return
      
      const input = inputRef.current
      if (!input) return

      setIsBeingDragged(false)
      dispatchOnChange(input, InputType.LostFocus)
    }
    window.addEventListener("mouseup", onMouseUp)

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [isBeingDragged])

  return (
    <label className={style.container}>
      <span className={`${style.label} ${style.draggable}`}
        onMouseDown={_ => setIsBeingDragged(true)}
      >{label}</span>
      <input ref={inputRef} className={style.input} type="text" value={stringValue}
        onKeyDown={e => {
          if (e.key === "Enter") e.currentTarget.blur()
          if (e.key.length === 1 && !/[0-9.-]/.test(e.key)) e.preventDefault()
        }}
        onInput={e => dispatchOnChange(e.currentTarget, InputType.Typing)}
        onBlur={e => dispatchOnChange(e.currentTarget, InputType.LostFocus)}
      />
    </label>
  )
}

export enum InputType {
  Typing,
  Dragging,
  LostFocus
}