import { RuntimeGameObjectData, RuntimeProjectData } from "@/types/RuntimeProjectData"
import { LANGUAGE_BUILTINS } from "../compiler/language-builtins"

// Only to suppress the error
const isStopped = () => false

export default class EngineBuiltins {
  //#region Global Builtins
  readonly GLOBAL = {
    get frame(): boolean { return this.frame },
    get time(): any { return this.time },
    tick: this.tick,
    await_frame: this.awaitFrame
  }

  frame = false
  time = {
    frame_time: 1, // Default to 1
    start_timestamp: Date.now(),
    get timestamp() { return Date.now() },
    get timer() { return this.timestamp - this.start_timestamp }
  }

  render(data: RuntimeProjectData, canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

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
      const image = new Image() // TODO: Cache images
      image.src = sprite.src
      ctx.drawImage(image, x, y, width, height)

      // Reset matrix
      ctx.restore()
      ctx.save()
    }
  }

  async tick() {
    const start = performance.now()
    await LANGUAGE_BUILTINS.sleep(0)
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