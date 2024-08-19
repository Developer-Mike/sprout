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
  const [isBeingDragged, setIsBeingDragged] = useState(false)

  const dispatchOnChange = useCallback((input: HTMLInputElement, inputType: InputType) => {
    const value = parseFloat(parseFloat(input.value).toFixed(precision ?? 20))

    if (isNaN(value)) onChange?.(0, inputType)
    else onChange?.(value, inputType)
  }, [onChange])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isBeingDragged) return

      const input = inputRef.current
      if (!input) return

      const newValue = (parseFloat(input.value) + e.movementX * (dragSensitivity ?? 1)).toFixed(precision ?? 20)
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
      dispatchOnChange(input, InputType.Dragged)
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
      <input ref={inputRef} className={style.input} type="text" value={value}
        onKeyDown={e => {
          if (e.key === "Enter") e.currentTarget.blur()
        }}
        onInput={e => dispatchOnChange(e.currentTarget, InputType.Typing)}
      />
    </label>
  )
}

export enum InputType {
  Typing,
  Dragging,
  Dragged
}