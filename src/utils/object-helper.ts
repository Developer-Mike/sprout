export default class ObjectHelper {
  // Deep copy an object while keeping references to classes
  // Parameter keep is an array of classes to maintain references to
  static deepClone(object: any, keep: any[] = []): any {    
    if (object === null || typeof object !== "object" || keep.includes(object.constructor))
      return object


    if (object instanceof Array) {
      const clone = []
      for (const value of object) {
        clone.push(ObjectHelper.deepClone(value, keep))
      }

      return clone
    }

    const clone: any = {}
    for (const key in object) {
      clone[key] = ObjectHelper.deepClone(object[key], keep)
    }

    return clone
  }

  // Merge two objects together without copying the target object
  static deepMerge(target: any, source: any, setKey: (object: any, key: string, value: any) => void = (object, key, value) => { object[key] = value }): any {
    for (const key in source) {
      if (source[key] instanceof Array) {
        target[key] = target[key] ?? []
        for (const value of source[key]) {
          target[key].push(value)
        }
      } else if (source[key] instanceof Object) {
        target[key] = target[key] ?? {}
        ObjectHelper.deepMerge(target[key], source[key])
      } else {
        setKey(target, key, source[key])
      }
    }

    return target
  }
}