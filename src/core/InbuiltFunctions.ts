import { ProjectData } from "@/types/ProjectData"

function getIsRunning() { return true }

export function render(data: ProjectData, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // Set matrix
  ctx.resetTransform()
  ctx.scale(canvas.width / data.stage.width, canvas.height / data.stage.height)
  ctx.save()

  // Clear canvas
  ctx.clearRect(0, 0, data.stage.width, data.stage.height)

  const gameObjects = Object.values(data.gameObjects)
    .sort((a, b) => a.layer - b.layer)

  for (const gameObject of gameObjects) {
    if (!gameObject.visible) continue

    // Skip if no sprite or index out of bounds
    if (gameObject.sprites.length === 0 || gameObject.activeSprite < 0 || gameObject.activeSprite >= gameObject.sprites.length)
      return

    const x = -gameObject.width / 2
    const y = -gameObject.height / 2

    // Set matrix
    ctx.translate(gameObject.x, gameObject.y)
    ctx.rotate(gameObject.rotation * Math.PI / 180)

    if (gameObject.width < 0) ctx.scale(-1, 1)
    if (gameObject.height < 0) ctx.scale(1, -1)

    // Draw sprite
    const sprite = new Image()
    sprite.src = data.sprites[gameObject.sprites[gameObject.activeSprite]]
    ctx.drawImage(sprite, x, y, gameObject.width, gameObject.height)

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

export async function frame() {
  await new Promise((resolve, reject) => {
    requestAnimationFrame(() => (
      getIsRunning() ? resolve(null) : reject("Game stopped")
    ))
  })
}

export async function sleep(ms: number) {
  await new Promise((resolve, reject) => {
    setTimeout(() => (
      getIsRunning() ? resolve(null) : reject("Game stopped")
    ), ms)
  })
}