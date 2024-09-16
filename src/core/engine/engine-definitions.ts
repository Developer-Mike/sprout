import { GameObjectData, StageData } from "@/types/ProjectData"
import { sleep } from "../compiler/inbuilt-functions"

// Only to suppress the error
const isStopped = () => false

export let frame = false
export let time = {
  frame_time: 1, // Default to 1
  start_timestamp: Date.now(),
  get timestamp() { return Date.now() },
  get timer() { return this.timestamp - this.start_timestamp }
}

export function render(gameObjects: { [key: string]: GameObjectData }, sprites: { [key: string]: string }, stage: StageData, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // Set matrix
  ctx.resetTransform()
  ctx.scale(canvas.width / stage.width, canvas.height / stage.height)
  ctx.save()

  // Clear canvas
  ctx.clearRect(0, 0, stage.width, stage.height)

  const orderedGameObjects = Object.values(gameObjects)
    .sort((a, b) => a.layer - b.layer)

  for (const gameObject of orderedGameObjects) {
    if (!gameObject.visible) continue

    // Skip if no sprite or index out of bounds
    if (gameObject.sprites.length === 0 || gameObject.active_sprite < 0 || gameObject.active_sprite >= gameObject.sprites.length)
      return

    // TODO: Calculate height correctly
    const height = gameObject.transform.width * gameObject.transform.height_scale

    const x = -gameObject.transform.width / 2
    const y = -height / 2

    // Set matrix
    ctx.translate(gameObject.transform.x, gameObject.transform.y)
    ctx.rotate(gameObject.transform.rotation * Math.PI / 180)

    if (gameObject.transform.width < 0) ctx.scale(-1, 1)
    if (gameObject.transform.height_scale < 0) ctx.scale(1, -1)

    // Draw sprite
    const sprite = new Image()
    sprite.src = sprites[gameObject.sprites[gameObject.active_sprite]]
    ctx.drawImage(sprite, x, y, gameObject.transform.width, height)

    // Reset matrix
    ctx.restore()
    ctx.save()
  }
}

export async function tick() {
  const start = performance.now()
  await sleep(0)
  const end = performance.now()

  return (end - start) / 1000
}

export async function await_frame() {
  await new Promise((resolve, reject) => {
    requestAnimationFrame(() => (
      isStopped() ? reject("Stopped") : resolve(null)
    ))
  })
}