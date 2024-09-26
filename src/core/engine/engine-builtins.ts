import { RuntimeGameObjectData, RuntimeProjectData } from "@/types/RuntimeProjectData"

export default class EngineBuiltins {
  private executionContext: any

  constructor(executionContext: any) {
    this.executionContext = executionContext

    // Add builtins to the execution context
    this.executionContext.sleep = this.sleep.bind(this)
    this.executionContext.tick = this.tick.bind(this)
    this.executionContext.await_frame = this.awaitFrame.bind(this)
    this.executionContext.frame = false
    this.executionContext.time = {
      frame_time: 1, // Default to 1
      start_timestamp: Date.now(),
      get timestamp() { return Date.now() },
      get timer() { return this.timestamp - this.start_timestamp }
    }

    // Add game object builtins
    for (const gameObjectId in this.executionContext.game_objects) {
      const gameObject = this.executionContext.game_objects[gameObjectId]

      for (const key in this.GAME_OBJECT_BUILTINS) {
        const path = key.split(".")
        let target: any = gameObject
        while (path.length > 1) {
          const subpath = path.shift() as string

          if (!target[subpath]) target[subpath] = {}
          target = target[subpath]
        }

        Object.defineProperty(target, path[0], {
          get: () => (...params: any) => this.GAME_OBJECT_BUILTINS[key].call(this, gameObject, ...params)
        })
      }
    }
  }

  //#region Global Builtins
  async sleep(ms: number) {
    await new Promise((resolve, reject) => {
      setTimeout(() => (
        this.executionContext.is_stopped() ? reject("Stopped") : resolve(null)
      ), ms)
    })
  }

  async tick() {
    const start = performance.now()
    await this.sleep(0)
    const end = performance.now()

    return (end - start) / 1000
  }

  async awaitFrame() {
    await new Promise((resolve, reject) => {
      requestAnimationFrame(() => (
        this.executionContext.is_stopped() ? reject("Stopped") : resolve(null)
      ))
    })
  }
  //#endregion

  //#region Game Object Functions
  readonly GAME_OBJECT_BUILTINS: { [path: string]: (...params: any) => any } = {
    "transform.move": this.move,
    "transform.rotate": this.rotate
  }

  move(game_object: RuntimeGameObjectData, x: number, y: number) {
    game_object.transform.x += x * this.executionContext.time.frame_time
    game_object.transform.y += y * this.executionContext.time.frame_time
  }

  rotate(game_object: RuntimeGameObjectData, angle: number) {
    game_object.transform.rotation += angle * this.executionContext.time.frame_time
  }
  //#endregion

  //#region Private builtins
  private imageCache: { [src: string]: HTMLImageElement } = {}
  async render(data: RuntimeProjectData, canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Update image cache
    const newCache: { [src: string]: HTMLImageElement } = {}
    for (const sprite of Object.values(data.sprites)) {
      if (this.imageCache[sprite.src]) newCache[sprite.src] = this.imageCache[sprite.src]
      else {
        const image = new Image()
        image.src = sprite.src
        newCache[sprite.src] = image
      }
    }
    await Promise.all(Object.values(newCache).map(image => new Promise(resolve => {
      if (image.complete) resolve(void 0)
      else image.onload = resolve
    })))
    this.imageCache = newCache

    // Set matrix
    ctx.resetTransform()
    ctx.scale(canvas.width / data.stage.width, canvas.height / data.stage.height)
    ctx.save()

    // Clear canvas
    ctx.clearRect(0, 0, data.stage.width, data.stage.height)

    const orderedGameObjects = Object.values(data.gameObjects)
      .sort((a, b) => a.layer - b.layer)

    for (const gameObject of orderedGameObjects) {
      if (!gameObject.visible) continue

      // Skip if no sprite or index out of bounds
      const sprite = data.sprites[gameObject.sprites[gameObject.active_sprite]]
      if (!sprite) continue

      const width = gameObject.transform.width * sprite.width
      const height = gameObject.transform.height * sprite.height

      const x = -width / 2
      const y = -height / 2

      // Set matrix
      ctx.translate(gameObject.transform.x, gameObject.transform.y)
      ctx.rotate(gameObject.transform.rotation * Math.PI / 180)

      if (gameObject.transform.width < 0) ctx.scale(-1, 1)
      if (gameObject.transform.height < 0) ctx.scale(1, -1)

      // Draw sprite
      ctx.drawImage(this.imageCache[sprite.src], x, y, width, height)

      // Reset matrix
      ctx.restore()
      ctx.save()
    }
  }
  //#endregion
}