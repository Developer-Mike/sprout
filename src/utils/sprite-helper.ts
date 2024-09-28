import { COLLISION_MASK_SIZE } from "@/constants"

export default class SpriteHelper {
  static loadFromBase64(base64: string): Promise<HTMLImageElement> {
    return new Promise(resolve => {
      const image = new Image()
      image.src = base64

      image.onload = () => resolve(image)
      if (image.complete) resolve(image)
    })
  }

  static getCollisionMask(sprite: HTMLImageElement): boolean[][] {
    const canvas = document.createElement("canvas")
    canvas.width = sprite.width
    canvas.height = sprite.height

    const context = canvas.getContext("2d")
    if (!context) return []
    context.drawImage(sprite, 0, 0)

    const data = context.getImageData(0, 0, sprite.width, sprite.height).data

    // TODO: Shrink the collision mask to COLLISION_MASK_SIZE
    const collisionMask: boolean[][] = []
    for (let y = 0; y < sprite.height; y++) {
      collisionMask[y] = []
      for (let x = 0; x < sprite.width; x++) {
        const alpha = data[(y * sprite.width + x) * 4 + 3]
        collisionMask[y][x] = alpha > 0
      }
    }

    return collisionMask
  }
}