import { useEffect, useState } from "react"

/**
 * A hook that allows you to use a property of an target(object) as a state.
 * WARNING: The state will not update if the target(object) is mutated.
 */
export default function useProperty<T extends object | null | undefined>(
  object: T,
  getTarget: (object: T) => any,
  setTarget: (object: T, value: any) => void
): [any, (value: any) => void] {
  const [state, setState] = useState(getTarget(object))

  useEffect(() => {
    setState(getTarget(object))
  }, [object])

  const setValue = (value: any) => {
    setTarget(object, value)
    setState(value)
  }

  return [state, setValue]
}