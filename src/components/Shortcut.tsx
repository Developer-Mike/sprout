import { useEffect } from "react"

export default function Shortcut({ ctrl, shift, alt, keyName, action }: {
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  keyName: string
  action: () => void
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === keyName && !!ctrl === e.ctrlKey && !!shift === e.shiftKey && !!alt === e.altKey) {
        e.preventDefault()
        action()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => { window.removeEventListener("keydown", onKeyDown) }
  }, [ctrl, shift, alt, keyName, action])

  return null
}