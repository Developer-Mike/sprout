import { Transform } from "@/types/ProjectData"
import Vector from "./vector"
import { RuntimeGameObjectData, RuntimeSpriteData } from "@/types/RuntimeProjectData"

export default class CollisionEngine {
  private collisionCanvas: HTMLCanvasElement

  constructor() {
    this.collisionCanvas = document.createElement("canvas")
  }

  // Check if two boxes are colliding (return center collision point and normal)
  spriteBoxCollision(sprite1: RuntimeSpriteData, transform1: Transform, sprite2: RuntimeSpriteData, transform2: Transform): CollisionInfo | null {
    const x1 = transform1.x
    const y1 = transform1.y
    const x2 = transform2.x
    const y2 = transform2.y
    const w1 = transform1.width * sprite1.width
    const h1 = transform1.height * sprite1.height
    const w2 = transform2.width * sprite2.width
    const h2 = transform2.height * sprite2.height

    const dx = x2 - x1
    const px = (w1 + w2) / 2 - Math.abs(dx)
    if (px <= 0) return null

    const dy = y2 - y1
    const py = (h1 + h2) / 2 - Math.abs(dy)
    if (py <= 0) return null

    if (px < py) {
      const sx = Math.sign(dx)
      return {
        point: { x: x1 + sx * w1 / 2, y: y2 },
        normal: { x: sx, y: 0 }
      }
    } else {
      const sy = Math.sign(dy)
      return {
        point: { x: x2, y: y1 + sy * h1 / 2 },
        normal: { x: 0, y: sy }
      }
    }
  }

  spriteBoxPointCollision(sprite: RuntimeSpriteData, transform: Transform, point: Vector): CollisionInfo | null {
    return null
  }

  spriteCollision(sprite1: RuntimeSpriteData, transform1: Transform, sprite2: RuntimeSpriteData, transform2: Transform): CollisionInfo | null {
    return null
  }

  spritePointCollision(sprite: RuntimeSpriteData, transform: Transform, point: Vector): CollisionInfo | null {
    return null
  }
}

export interface CollisionInfo {
  game_object?: RuntimeGameObjectData
  point: { x: number, y: number }
  normal: { x: number, y: number }
}