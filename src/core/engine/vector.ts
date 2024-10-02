export default class Vector {
  static of(x: number, y: number): Vector {
    return new Vector(x, y)
  }

  static get zero(): Vector {
    return new Vector(0, 0)
  }

  static get one(): Vector {
    return new Vector(1, 1)
  }

  static get up(): Vector {
    return new Vector(0, 1)
  }

  static get down(): Vector {
    return new Vector(0, -1)
  }

  static get left(): Vector {
    return new Vector(-1, 0)
  }

  static get right(): Vector {
    return new Vector(1, 0)
  }

  constructor(public x: number, public y: number) {}

  add(other: Vector): Vector {
    return new Vector(this.x + other.x, this.y + other.y)
  }

  subtract(other: Vector): Vector {
    return new Vector(this.x - other.x, this.y - other.y)
  }

  multiply(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar)
  }

  divide(scalar: number): Vector {
    return new Vector(this.x / scalar, this.y / scalar)
  }

  get magnitude(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  get normalized(): Vector {
    return this.divide(this.magnitude)
  }

  get perpendicular(): Vector {
    return new Vector(-this.y, this.x)
  }

  dot(other: Vector): number {
    return this.x * other.x + this.y * other.y
  }

  cross(other: Vector): number {
    return this.x * other.y - this.y * other.x
  }

  angle(other: Vector): number {
    return Math.acos(this.dot(other) / (this.magnitude * other.magnitude))
  }

  project(other: Vector): Vector {
    return other.multiply(this.dot(other) / other.magnitude ** 2)
  }

  reflect(normal: Vector): Vector {
    return this.subtract(normal.multiply(2 * this.dot(normal)))
  }

  rotate(angle: number): Vector {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    return new Vector(this.x * cos - this.y * sin, this.x * sin + this.y * cos)
  }

  equals(other: Vector): boolean {
    return this.x === other.x && this.y === other.y
  }

  toString(): string {
    return `(${this.x}, ${this.y})`
  }
}