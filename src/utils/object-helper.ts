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
}