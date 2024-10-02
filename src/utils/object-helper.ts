export default class ObjectHelper {
  // Deep copy an object while keeping references to classes
  // Parameter keep is an array of classes to maintain references to
  static deepClone<T>(object: T, keep: any[] = []): T {
    if (object === null || typeof object !== "object")
      return object

    if (keep.includes(object.constructor))
      return object

    if (Array.isArray(object))
      return object.map(item => ObjectHelper.deepClone(item, keep)) as any

    const clone = Object.create(Object.getPrototypeOf(object))

    for (const key in object)
      clone[key] = ObjectHelper.deepClone(object[key], keep)

    return clone
  }

  // Merge two objects together without copying the target object
  static deepMerge(target: any, source: any, setKey: (object: any, key: string, value: any) => void = (object, key, value) => { object[key] = value }) {
    if (source === null || typeof source !== "object")
      return

    for (const key in source) {
      if (source[key] === null || typeof source[key] !== "object") {
        setKey(target, key, source[key])
      } else {
        if (target[key] === null || typeof target[key] !== "object") {
          setKey(target, key, {})
        }

        ObjectHelper.deepMerge(target[key], source[key], setKey)
      }
    }
  }
}