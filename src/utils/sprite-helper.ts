export default class SpriteHelper {
  static loadFromBase64(base64: string): Promise<HTMLImageElement> {
    return new Promise(resolve => {
      const image = new Image()
      image.src = base64

      image.onload = () => resolve(image)
      if (image.complete) resolve(image)
    })
  }

  static async getCollisionMask(base64: string): Promise<CanvasImageSource> {
    const sprite = await this.loadFromBase64(base64)

    const canvas = document.createElement("canvas")
    canvas.width = sprite.width
    canvas.height = sprite.height

    const ctx = canvas.getContext("2d")!
    ctx.drawImage(sprite, 0, 0, canvas.width, canvas.height)

    // Make every pixel alpha 128 (except for the transparent ones)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) continue
      imageData.data[i] = 128
    }

    ctx.putImageData(imageData, 0, 0)
    return canvas
  }
}