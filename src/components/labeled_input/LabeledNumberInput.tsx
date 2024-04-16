import { useEffect, useRef, useState } from "react"
import style from "./LabeledInput.module.scss"

export default function LabeledNumberInput({ label, value, precision, dragSensitivity, onChange }: {
  label: string
  value?: number
  precision?: number
  dragSensitivity?: number
  onChange?: (value: number) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isBeingDragged, setIsBeingDragged] = useState(false)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isBeingDragged) return

      const input = inputRef.current
      if (!input) return

      input.value = (parseFloat(input.value) + e.movementX * (dragSensitivity ?? 1)).toFixed(precision ?? 20)
      input.dispatchEvent(new Event("input", { bubbles: true }))
    }
    window.addEventListener("mousemove", onMouseMove)

    const onMouseUp = () => setIsBeingDragged(false)
    window.addEventListener("mouseup", onMouseUp)

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [isBeingDragged])

  return (
    <label className={style.container}>
      <span className={`${style.label} ${style.draggable}`}
        onMouseDown={e => setIsBeingDragged(true)}
      >{label}</span>
      <input ref={inputRef} className={style.input} type="text" onInput={e => {
        const value = parseFloat(parseFloat(e.currentTarget.value).toFixed(precision ?? 20)) 

        if (isNaN(value)) onChange?.(0)
        else onChange?.(value)
      }} value={value} />
    </label>
  )
}