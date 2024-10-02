import { Transform } from "@/types/ProjectData"
import Vector from "./vector"
import { RuntimeGameObjectData, RuntimeSpriteData } from "@/types/RuntimeProjectData"

export default class CollisionEngine {
  private collisionCanvas: HTMLCanvasElement

  constructor() {
    this.collisionCanvas = document.createElement("canvas")
  }

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
    for (let i = 0; i < vertices1.length; i++) {
      const next = (i + 1) % vertices1.length
      const edgeAStart = vertices1[i]
      const edgeAEnd = vertices1[next]

      for (let j = 0; j < vertices2.length; j++) {
        const nextB = (j + 1) % vertices2.length
        const edgeBStart = vertices2[j]
        const edgeBEnd = vertices2[nextB]

        const intersection = this.findEdgeIntersection(edgeAStart, edgeAEnd, edgeBStart, edgeBEnd)
        if (intersection) intersectionPoints.push(intersection)
      }
    }

    // Step 2: Include all vertices inside the other shape
    for (const [vertices, polygon] of [[vertices1, vertices2], [vertices2, vertices1]] as [Vector[], Vector[]][]) {
      for (const vertex of vertices) {
        if (!this.isPointInPolygon(vertex, polygon)) continue

        intersectionPoints.push(vertex)
      }
    }

    // Step 3: Calculate the bounding box around the intersection points
    const minX = Math.min(...intersectionPoints.map(p => p.x))
    const maxX = Math.max(...intersectionPoints.map(p => p.x))
    const minY = Math.min(...intersectionPoints.map(p => p.y))
    const maxY = Math.max(...intersectionPoints.map(p => p.y))
    const center = Vector.of(minX + maxX, minY + maxY).divide(2)

    return {
      box: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      },
      point: { x: center.x, y: center.y },
    }
  }

  // Check if a point is inside a rotated and scaled box
  spriteBoxPointCollision(sprite: RuntimeSpriteData, transform: Transform, point: Vector): CollisionInfo | null {
    // Get the vertices of the rectangle
    const vertices = this.getVertices(transform, sprite)

    // Check if the point is inside the polygon
    if (!this.isPointInPolygon(point, vertices)) return null

    return {
      box: {
        x: point.x,
        y: point.y,
        width: 1,
        height: 1,
      },
      point: { x: point.x, y: point.y },
    }
  }

  private renderCollisionCanvas(box: Box, objects: [RuntimeSpriteData, Transform][]): CanvasRenderingContext2D {
    // Set up collision canvas
    this.collisionCanvas.width = Math.ceil(box.width)
    this.collisionCanvas.height = Math.ceil(box.height)

    const ctx = this.collisionCanvas.getContext("2d")!
    ctx.imageSmoothingEnabled = false

    // Invert the Y-axis and offset the canvas
    ctx.resetTransform()
    ctx.translate(-box.x, -box.y)
    ctx.save()

    // Clear the canvas
    ctx.clearRect(0, 0, this.collisionCanvas.width, this.collisionCanvas.height)

    // Draw both sprites on the collision canvas
    for (const [sprite, transform] of objects) {
      const width = transform.width * sprite.width
      const height = transform.height * sprite.height

      const x = -width / 2
      const y = -height / 2

      // Translate and rotate the canvas
      ctx.translate(transform.x, transform.y)
      ctx.rotate(transform.rotation * Math.PI / 180)

      if (transform.width < 0) ctx.scale(-1, 1)
      if (transform.height > 0) ctx.scale(1, -1)

      // Draw sprite
      ctx.drawImage(sprite.collision_mask, x, y, width, height)
      
      // Reset matrix
      ctx.restore()
      ctx.save()
    }

    return ctx
  }

  spriteCollision(sprite1: RuntimeSpriteData, transform1: Transform, sprite2: RuntimeSpriteData, transform2: Transform): CollisionInfo | null {
    const boxCollision = this.spriteBoxCollision(sprite1, transform1, sprite2, transform2)
    if (!boxCollision) return null

    // Render sprites on the collision canvas
    const ctx = this.renderCollisionCanvas(boxCollision.box, [[sprite1, transform1], [sprite2, transform2]])

    // Check for any pixel with an alpha value greater than 128 (collision)
    const pixels = ctx.getImageData(0, 0, this.collisionCanvas.width, this.collisionCanvas.height).data
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] > 128) return boxCollision
    }

    return null
  }

  spritePointCollision(sprite: RuntimeSpriteData, transform: Transform, point: Vector): CollisionInfo | null {
    const boxCollision = this.spriteBoxPointCollision(sprite, transform, point)
    if (!boxCollision) return null

    // Render sprites on the collision canvas
    const ctx = this.renderCollisionCanvas(boxCollision.box, [[sprite, transform]])

    // Check for any pixel with an alpha value greater than 128 0 (collision)
    const pixels = ctx.getImageData(0, 0, this.collisionCanvas.width, this.collisionCanvas.height).data
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] > 0) return boxCollision
    }

    return null
  }
}

export interface CollisionInfo {
  game_object?: RuntimeGameObjectData
  box: Box
  point: { x: number, y: number }
}

export interface Box {
  x: number
  y: number
  width: number
  height: number
}