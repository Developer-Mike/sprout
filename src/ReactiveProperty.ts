import { useState } from "react"

/**
 * A hook that allows you to use a property of an object as a state.
 * WARNING: The state will not update if the object is mutated.
 */
export default function useProperty<T extends object>(object: T | undefined, path: keyof T): [any, (value: any) => void] {
  const [state, setState] = useState(object ? object[path] : undefined)

  const setValue = (value: any) => {
    if (!object) return

    object[path] = value
    setState(value)
  }

  return [state, setValue]
}