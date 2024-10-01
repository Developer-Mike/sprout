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

  static async getCollisionMask(base64: string): Promise<ImageData> {
    const sprite = await this.loadFromBase64(base64)
    const landscape = sprite.width > sprite.height

    const canvas = document.createElement("canvas")
    canvas.width = landscape ? COLLISION_MASK_SIZE : COLLISION_MASK_SIZE * sprite.width / sprite.height
    canvas.height = landscape ? COLLISION_MASK_SIZE * sprite.height / sprite.width : COLLISION_MASK_SIZE

    const context = canvas.getContext("2d")
    context!.drawImage(sprite, 0, 0, canvas.width, canvas.height)

    // Make every pixel alpha 128 (except for the transparent ones)
    const imageData = context!.getImageData(0, 0, canvas.width, canvas.height)
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) continue
      imageData.data[i] = 128
    }
    
    return imageData
  }
}