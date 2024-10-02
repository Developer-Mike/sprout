import { Transform } from "@/types/ProjectData"
import Vector from "./vector"
import { RuntimeGameObjectData, RuntimeSpriteData } from "@/types/RuntimeProjectData"

export default class CollisionEngine {
  private collisionCanvas: HTMLCanvasElement

  constructor() {
    this.collisionCanvas = document.createElement("canvas")
    this.collisionCanvas.width = 

    // DEBUG
    this.collisionCanvas.style.zIndex = "1000"
    this.collisionCanvas.style.position = "fixed"
    this.collisionCanvas.style.top = "0"
    this.collisionCanvas.style.left = "0"
    this.collisionCanvas.style.backgroundColor = "white"
    this.collisionCanvas.style.border = "1px solid black"
    document.body.appendChild(this.collisionCanvas)
  }

  /*

  // Check if a box and a point are colliding (regarding the scale and rotation of the box)
  spriteBoxPointCollision(sprite: RuntimeSpriteData, transform: Transform, point: Vector): CollisionInfo | null {
    const x = transform.x
    const y = transform.y
    const w = transform.width * sprite.width
    const h = transform.height * sprite.height

    const dx = point.x - x
    const px = w / 2 - Math.abs(dx)
    if (px <= 0) return null

    const dy = point.y - y
    const py = h / 2 - Math.abs(dy)
    if (py <= 0) return null

    if (px < py) {
      const sx = Math.sign(dx)
      return {
        box: { x: x + sx * w / 2, y, width: px, height: h },
        point: { x: point.x, y: y },
        normal: { x: sx, y: 0 }
      }
    } else {
      const sy = Math.sign(dy)
      return {
        box: { x, y: y + sy * h / 2, width: w, height: py },
        point: { x, y: point.y },
        normal: { x: 0, y: sy }
      }
    }
  }

  // Check if two sprites are colliding (return center collision point and normal)
  spriteCollision(sprite1: RuntimeSpriteData, transform1: Transform, sprite2: RuntimeSpriteData, transform2: Transform): CollisionInfo | null {
    // Check if bounding boxes are colliding
    const boxCollision = this.spriteBoxCollision(sprite1, transform1, sprite2, transform2)
    if (!boxCollision) return null

    // Get intersection rectangle
    const x1 = transform1.x
    const y1 = transform1.y
    const x2 = transform2.x
    const y2 = transform2.y
    const w1 = transform1.width * sprite1.width
    const h1 = transform1.height * sprite1.height
    const w2 = transform2.width * sprite2.width
    const h2 = transform2.height * sprite2.height

    const dx = x2 - x1
    const dy = y2 - y1
    const px = (w1 + w2) / 2 - Math.abs(dx)
    const py = (h1 + h2) / 2 - Math.abs(dy)

    const intersection = {
      x: x1 + Math.sign(dx) * (w1 + px) / 2,
      y: y1 + Math.sign(dy) * (h1 + py) / 2,
      width: px,
      height: py
    }

    // Update collision canvas
    this.collisionCanvas.width = Math.ceil(intersection.width)
    this.collisionCanvas.height = Math.ceil(intersection.height)

    const ctx = this.collisionCanvas.getContext("2d")!
    ctx.imageSmoothingEnabled = false

    ctx.clearRect(0, 0, this.collisionCanvas.width, this.collisionCanvas.height)

    // Draw both sprites on the collision canvas
    ctx.drawImage(sprite1.collision_mask, (x1 - intersection.x) / transform1.width * sprite1.width, (y1 - intersection.y) / transform1.height * sprite1.height, sprite1.width, sprite1.height)
    ctx.globalCompositeOperation = "source-in"
    ctx.drawImage(sprite2.collision_mask, (x2 - intersection.x) / transform2.width * sprite2.width, (y2 - intersection.y) / transform2.height * sprite2.height, sprite2.width, sprite2.height)

    return null
  }

  // Check if a sprite and a point are colliding (return center collision point and normal)
  spritePointCollision(sprite: RuntimeSpriteData, transform: Transform, point: Vector): CollisionInfo | null {
    // Check if bounding box and point are colliding
    const boxCollision = this.spriteBoxPointCollision(sprite, transform, point)
    if (!boxCollision) return null

    // Update collision canvas
    this.collisionCanvas.width = Math.ceil(transform.width * sprite.width)
    this.collisionCanvas.height = Math.ceil(transform.height * sprite.height)

    const ctx = this.collisionCanvas.getContext("2d")!
    ctx.imageSmoothingEnabled = false

    ctx.clearRect(0, 0, this.collisionCanvas.width, this.collisionCanvas.height)

    // Draw sprite on the collision canvas
    ctx.drawImage(sprite.collision_mask, 0, 0, sprite.width, sprite.height)

    // Check if the pixel has an alpha value greater than 128 -> collision
    const imageData = ctx.getImageData((point.x - transform.x) / transform.width * sprite.width, (point.y - transform.y) / transform.height * sprite.height, 1, 1)
    if (imageData.data[3] > 128) {
      const normal = { x: point.x - boxCollision.point.x, y: point.y - boxCollision.point.y }
      const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y)
      return { point, normal: { x: normal.x / length, y: normal.y / length } }
    }

    return null
  }*/

  // Rotate a point around an origin by an angle (in radians)
  private rotatePoint(point: Vector, angle: number, origin: Vector): Vector {
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)

    // Translate the point to the origin
    const translated = point.subtract(origin)

    // Apply rotation
    const rotatedX = translated.x * cos - translated.y * sin
    const rotatedY = translated.x * sin + translated.y * cos

    // Translate back to original position
    return Vector.of(rotatedX, rotatedY).add(origin)
  }

  // Get the four vertices of a rotated and scaled rectangle
  getVertices(transform: Transform, sprite: RuntimeSpriteData): Vector[] {
    // Compute the actual width and height after scaling
    const halfWidth = (transform.width * sprite.width) / 2
    const halfHeight = (transform.height * sprite.height) / 2

    // Calculate the four corners of the rectangle before rotation
    const topLeft = Vector.of(transform.x - halfWidth, transform.y - halfHeight)
    const topRight = Vector.of(transform.x + halfWidth, transform.y - halfHeight)
    const bottomLeft = Vector.of(transform.x - halfWidth, transform.y + halfHeight)
    const bottomRight = Vector.of(transform.x + halfWidth, transform.y + halfHeight)

    const origin = Vector.of(transform.x, transform.y); // The center of the rectangle

    // Apply rotation to each corner around the origin (center of the rectangle)
    return [
      this.rotatePoint(topLeft, transform.rotation * Math.PI / 180, origin),
      this.rotatePoint(topRight, transform.rotation * Math.PI / 180, origin),
      this.rotatePoint(bottomRight, transform.rotation * Math.PI / 180, origin),
      this.rotatePoint(bottomLeft, transform.rotation * Math.PI / 180, origin),
    ]
  }

  // Get the perpendicular normals (axes) of the polygon's edges
  private getNormals(vertices: Vector[]): Vector[] {
    const normals: Vector[] = []

    for (let i = 0; i < vertices.length; i++) {
      const next = (i + 1) % vertices.length
      const edge = vertices[next].subtract(vertices[i])
      
      // Perpendicular vector (normal to the edge)
      normals.push(edge.perpendicular.normalized)
    }

    return normals
  }

  // Project vertices onto a given axis and get min/max projection
  private projectVertices(axis: Vector, vertices: Vector[]): { min: number; max: number } {
    let min = Infinity
    let max = -Infinity

    for (const vertex of vertices) {
      const projection = vertex.dot(axis)
      if (projection < min) min = projection
      if (projection > max) max = projection
    }

    return { min, max }
  }

  private isPointInPolygon(point: Vector, polygon: Vector[]): boolean {
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y
      const xj = polygon[j].x, yj = polygon[j].y
  
      const intersect = ((yi > point.y) !== (yj > point.y)) &&
                        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }
    return inside
  }

  private findEdgeIntersection(p1: Vector, p2: Vector, p3: Vector, p4: Vector): Vector | null {
    const s1 = p2.subtract(p1)  // Vector for the first line segment
    const s2 = p4.subtract(p3)  // Vector for the second line segment
  
    const denominator = (-s2.x * s1.y + s1.x * s2.y)
  
    // If the denominator is 0, the lines are parallel and don't intersect
    if (denominator === 0) return null
  
    const s = (-s1.y * (p1.x - p3.x) + s1.x * (p1.y - p3.y)) / denominator
    const t = ( s2.x * (p1.y - p3.y) - s2.y * (p1.x - p3.x)) / denominator
  
    // Check if the intersection occurs within the bounds of both line segments
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
      // Calculate the intersection point
      const intersectionX = p1.x + (t * s1.x)
      const intersectionY = p1.y + (t * s1.y)
      return Vector.of(intersectionX, intersectionY)
    }
  
    return null  // No intersection within the segments
  }

  // Main collision detection function using the Separating Axis Theorem
  spriteBoxCollision(
    sprite1: RuntimeSpriteData,
    transform1: Transform,
    sprite2: RuntimeSpriteData,
    transform2: Transform
  ): CollisionInfo | null {
    // Get the vertices of both rectangles
    const vertices1 = this.getVertices(transform1, sprite1)
    const vertices2 = this.getVertices(transform2, sprite2)

    // Calculate the normals (separating axes)
    const normals = [...this.getNormals(vertices1), ...this.getNormals(vertices2)]

    const overlaps: { axis: Vector; overlap: number }[] = []

    // Project vertices onto each axis and check for overlap
    for (const axis of normals) {
      const projection1 = this.projectVertices(axis, vertices1)
      const projection2 = this.projectVertices(axis, vertices2)

      // If there's no overlap on this axis, no collision
      if (projection1.max < projection2.min || projection2.max < projection1.min)
        return null

      // Check for smallest overlap (needed for collision resolution)
      const overlapAmount = Math.min(projection1.max, projection2.max) - Math.max(projection1.min, projection2.min)
      overlaps.push({ axis, overlap: overlapAmount })
    }

    // No collision if there's no overlap on any axis
    if (overlaps.length === 0) return null

    // Calculate the AABB of the collision (Projection of the overlap on the axis)
    const intersectionPoints: Vector[] = []
    
    // Step 1: Check for intersecting edges between the two shapes
    const addIntersectionPoints = (verticesA: Vector[], verticesB: Vector[]) => {
      for (let i = 0; i < verticesA.length; i++) {
        const next = (i + 1) % verticesA.length
        const edgeAStart = verticesA[i]
        const edgeAEnd = verticesA[next]

        for (let j = 0; j < verticesB.length; j++) {
          const nextB = (j + 1) % verticesB.length
          const edgeBStart = verticesB[j]
          const edgeBEnd = verticesB[nextB]

          const intersection = this.findEdgeIntersection(edgeAStart, edgeAEnd, edgeBStart, edgeBEnd)
          if (intersection) {
            intersectionPoints.push(intersection)
          }
        }
      }
    }

    // Add the intersection points between the two sets of vertices
    addIntersectionPoints(vertices1, vertices2)
    addIntersectionPoints(vertices2, vertices1)

    // Step 2: Include all vertices inside the other shape
    const addContainedPoints = (verticesA: Vector[], verticesB: Vector[]) => {
      for (const vertex of verticesA) {
        if (this.isPointInPolygon(vertex, verticesB)) {
          intersectionPoints.push(vertex)
        }
      }
    }

    addContainedPoints(vertices1, vertices2)
    addContainedPoints(vertices2, vertices1)

    // Step 3: Calculate the bounding box around the intersection points
    const collisionMinX = Math.min(...intersectionPoints.map(p => p.x))
    const collisionMaxX = Math.max(...intersectionPoints.map(p => p.x))
    const collisionMinY = Math.min(...intersectionPoints.map(p => p.y))
    const collisionMaxY = Math.max(...intersectionPoints.map(p => p.y))

    const collisionCenter = Vector.of((collisionMinX + collisionMaxX) / 2, (collisionMinY + collisionMaxY) / 2)

    return {
      box: {
        x: collisionMinX,
        y: collisionMinY,
        width: collisionMaxX - collisionMinX,
        height: collisionMaxY - collisionMinY,
      },
      point: { x: collisionCenter.x, y: collisionCenter.y },
    }
  }

  // Check if a point is inside a rotated and scaled box
  spriteBoxPointCollision(sprite: RuntimeSpriteData, transform: Transform, point: Vector): CollisionInfo | null {
    // TODO: Implement this function
  }

  spriteCollision(sprite1: RuntimeSpriteData, transform1: Transform, sprite2: RuntimeSpriteData, transform2: Transform): CollisionInfo | null {
    const boxCollision = this.spriteBoxCollision(sprite1, transform1, sprite2, transform2)
    if (!boxCollision) return null

    // Set up collision canvas
    this.collisionCanvas.width = Math.ceil(boxCollision.box.width)
    this.collisionCanvas.height = Math.ceil(boxCollision.box.height)

    const ctx = this.collisionCanvas.getContext("2d")!
    ctx.clearRect(0, 0, this.collisionCanvas.width, this.collisionCanvas.height)
    ctx.imageSmoothingEnabled = false

    // Offset the sprites to the collision canvas
    ctx.translate(-boxCollision.box.x, -boxCollision.box.y)

    // Draw both sprites on the collision canvas
    for (const [sprite, transform] of [[sprite1, transform1], [sprite2, transform2]] as [RuntimeSpriteData, Transform][]) {
      ctx.save()

      /*// Translate and rotate the canvas
      ctx.translate(transform.x, transform.y)
      ctx.rotate(transform.rotation * Math.PI / 180)

      if (transform.width < 0) ctx.scale(-1, 1)
      if (transform.height < 0) ctx.scale(1, -1)

      // Draw sprite
      ctx.drawImage(sprite.collision_mask, 0, 0, sprite.width * transform.width, sprite.height * transform.height)*/
      
      ctx.restore()
    }

    // Check for any pixel with an alpha value greater than 128 (collision)
    const pixels = ctx.getImageData(0, 0, this.collisionCanvas.width, this.collisionCanvas.height).data
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] > 128) {
        return boxCollision
      }
    }

    return null
  }
}

export interface CollisionInfo {
  game_object?: RuntimeGameObjectData
  box: { x: number, y: number, width: number, height: number }
  point: { x: number, y: number }
}