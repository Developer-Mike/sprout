import { RuntimeGameObjectData, RuntimeProjectData } from "@/types/RuntimeProjectData"

// Only to suppress the error
const isStopped = () => false

export default class EngineBuiltins {  //#region Global Builtins
  readonly GLOBAL = {
    that: this,
    sleep: this.sleep,
    tick: this.tick,
    await_frame: this.awaitFrame,
    get frame() { return this.that.frame },
    get time() { return this.that.time }
  }

  frame = false
  time = {
    frame_time: 1, // Default to 1
    start_timestamp: Date.now(),
    get timestamp() { return Date.now() },
    get timer() { return this.timestamp - this.start_timestamp }
  }

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
      if (!sprite) return

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

  async sleep(ms: number) {
    await new Promise((resolve, reject) => {
      setTimeout(() => (
        isStopped() ? reject("Stopped") : resolve(null)
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
        isStopped() ? reject("Stopped") : resolve(null)
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
    game_object.transform.x += x * this.time.frame_time
    game_object.transform.y += y * this.time.frame_time
  }

  rotate(game_object: RuntimeGameObjectData, angle: number) {
    game_object.transform.rotation += angle * this.time.frame_time
  }
  //#endregion
}