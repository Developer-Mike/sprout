import { RuntimeGameObjectData, RuntimeProjectData, RuntimeSpriteData } from "@/types/RuntimeProjectData"
import SpriteHelper from "@/utils/sprite-helper"
import AutocompletionItem, { AutocompletionItemType } from "../autocompletion-item"
import ObjectHelper from "@/utils/object-helper"
import { GameObjectData, StageData } from "@/types/ProjectData"
import CollisionEngine, { CollisionInfo } from "./collision-engine"
import Vector from "./vector"

export default class EngineBuiltins {
  private executionContext: any
  private canvas: HTMLCanvasElement
  private readonly builtins: { [key: string]: any } = {
    Vector: Vector,
    sleep: this.sleep.bind(this),
    tick: this.tick.bind(this),
    await_frame: this.awaitFrame.bind(this),
    frame: false,
    time: {
      delta_time: 1, // Default to 1
      get timestamp() { return Date.now() / 1000 },
      start_time: performance.now() / 1000,
      get timer() { return (performance.now() / 1000) - this.start_time }
    },
    input: {
      key: new Proxy({} as Record<string, KeyState>, {
        get: (target: Record<string, KeyState>, key: string) => 
          key in target ? target[key] : { is_down: false, is_pressed: false, is_up: false }
      }),
      mouse: {
        x: 0, y: 0,
        button: new Proxy({} as Record<string, KeyState>, {
          get: (target: Record<string, KeyState>, key: string) => 
            key in target ? target[key] : { is_down: false, is_pressed: false, is_up: false }
        })
      }
    }
  } as const
  private readonly gameObjectsBuiltins: { [path: string]: any } = {
    transform: {
      get_bounds: this.get_bounds.bind(this),
      move: this.move.bind(this),
      rotate: this.rotate.bind(this),
      rotate_to: this.rotate_to.bind(this)
    },
    get_collision_with: this.get_collision_with.bind(this),
    get_box_collision_with: this.get_box_collision_with.bind(this),
    get_collisions: this.get_collisions.bind(this),
    get_box_collisions: this.get_box_collisions.bind(this),
    previous_sprite: this.previous_sprite.bind(this),
    next_sprite: this.next_sprite.bind(this)
  }

  constructor(executionContext: any, canvas: HTMLCanvasElement) {
    this.executionContext = executionContext
    this.canvas = canvas

    // Add builtins to the execution context
    for (const key in this.builtins) {
      this.executionContext[key] = this.builtins[key]
    }

    // Add game object builtins
    for (const gameObjectId in this.executionContext.game_objects) {
      const gameObject = this.executionContext.game_objects[gameObjectId]
      ObjectHelper.deepMerge(gameObject, this.gameObjectsBuiltins, (object, key, value) => {
        Object.defineProperty(object, key, {
          get: () => (...params: any) => value(gameObject, ...params)
        })
      })
    }

    this.setupInputListeners()
  }

  addAutocompletionItems(suggestions: Record<string, AutocompletionItem>) {
    suggestions["sleep"] = { type: AutocompletionItemType.FUNCTION, children: {} }
    suggestions["tick"] = { type: AutocompletionItemType.FUNCTION, children: {} }
    suggestions["await_frame"] = { type: AutocompletionItemType.FUNCTION, children: {} }
    suggestions["time"] = { 
      type: AutocompletionItemType.CONSTANT, 
      children: {
        "delta_time": { type: AutocompletionItemType.CONSTANT, children: {} },
        "timestamp": { type: AutocompletionItemType.CONSTANT, children: {} },
        "start_time": { type: AutocompletionItemType.CONSTANT, children: {} },
        "timer": { type: AutocompletionItemType.CONSTANT, children: {} }
      }
    }
    suggestions["input"] = {
      type: AutocompletionItemType.CONSTANT,
      children: {
        "key": {
          type: AutocompletionItemType.CONSTANT,
          children: {
            "*": { 
              type: AutocompletionItemType.CONSTANT, 
              children: {
                "is_down": { type: AutocompletionItemType.CONSTANT, children: {} },
                "is_pressed": { type: AutocompletionItemType.CONSTANT, children: {} },
                "is_up": { type: AutocompletionItemType.CONSTANT, children: {} }
              }
            }
          }
        },
        "mouse": {
          type: AutocompletionItemType.CONSTANT,
          children: {
            "x": { type: AutocompletionItemType.CONSTANT, children: {} },
            "y": { type: AutocompletionItemType.CONSTANT, children: {} },
            "button": {
              type: AutocompletionItemType.CONSTANT,
              children: {
                "*": { 
                  type: AutocompletionItemType.CONSTANT, 
                  children: {
                    "is_down": { type: AutocompletionItemType.CONSTANT, children: {} },
                    "is_pressed": { type: AutocompletionItemType.CONSTANT, children: {} },
                    "is_up": { type: AutocompletionItemType.CONSTANT, children: {} }
                  }
                },

                "left": { type: AutocompletionItemType.CONSTANT, children: {} },
                "middle": { type: AutocompletionItemType.CONSTANT, children: {} },
                "right": { type: AutocompletionItemType.CONSTANT, children: {} }
              }
            }
          }
        }
      }
    }
  }

  addGameObjectsAutocompletionItems(gameObjectSuggestions: Record<string, AutocompletionItem>) {
    gameObjectSuggestions["transform"] = {
      ...gameObjectSuggestions["transform"],

      type: AutocompletionItemType.CONSTANT,
      children: {
        ...gameObjectSuggestions["transform"].children,

        "get_bounds": { 
          type: AutocompletionItemType.FUNCTION, 
          children: {
            "max_y": { type: AutocompletionItemType.FUNCTION, children: {} },
            "min_y": { type: AutocompletionItemType.FUNCTION, children: {} },
            "max_x": { type: AutocompletionItemType.FUNCTION, children: {} },
            "min_x": { type: AutocompletionItemType.FUNCTION, children: {} }
          }
        },
        
        "move": { type: AutocompletionItemType.FUNCTION, children: {} },
        "rotate": { type: AutocompletionItemType.FUNCTION, children: {} },
        "rotate_to": { type: AutocompletionItemType.FUNCTION, children: {} }
      }
    }

    gameObjectSuggestions["get_collision_with"] = { type: AutocompletionItemType.FUNCTION, children: {} }
    gameObjectSuggestions["get_box_collision_with"] = { type: AutocompletionItemType.FUNCTION, children: {} }
    gameObjectSuggestions["get_collisions"] = { type: AutocompletionItemType.FUNCTION, children: {} }
    gameObjectSuggestions["get_box_collisions"] = { type: AutocompletionItemType.FUNCTION, children: {} }

    gameObjectSuggestions["previous_sprite"] = { type: AutocompletionItemType.FUNCTION, children: {} }
    gameObjectSuggestions["next_sprite"] = { type: AutocompletionItemType.FUNCTION, children: {} }
  }

  private setupInputListeners() {
    const getKeyName = (key: string) => {
      if (!key) return "unknown"
      
      if (key === " ") return "space"
      return key.replace(/(?<!^)[A-Z]/g, letter => `_${letter.toLowerCase()}`).toLowerCase()
    }

    window.addEventListener("keydown", e => {
      if (e.repeat) return // Skip if key is being held down
      if (e.key === "Meta") return // Skip if meta key is pressed

      const key = getKeyName(e.key)
      this.executionContext.input.key[key] = { is_down: true, is_pressed: true, is_up: false }
    })
    window.addEventListener("keyup", e => {
      const key = getKeyName(e.key)
      this.executionContext.input.key[key] = { is_down: false, is_pressed: false, is_up: true }
    })

    const getButtonName = (button: number) => {
      switch (button) {
        case 0: return "left"
        case 1: return "middle"
        case 2: return "right"
        default: return `button_${button}`
      }
    }

    window.addEventListener("mousemove", e => {
      const rect = this.canvas.getBoundingClientRect()

      let x = Math.min(Math.max(e.clientX - rect.left, 0), this.canvas.width)
      let y = Math.min(Math.max(this.canvas.height - (e.clientY - rect.top), 0), this.canvas.height)

      x = x / this.canvas.width * this.executionContext.stage?.width ?? 0
      y = y / this.canvas.height * this.executionContext.stage?.height ?? 0
      
      this.executionContext.input.mouse.x = x
      this.executionContext.input.mouse.y = y
    })

    window.addEventListener("mousedown", e => {
      const button = getButtonName(e.button)
      this.executionContext.input.mouse.button[button] = { is_down: true, is_pressed: true, is_up: false }
    })
    window.addEventListener("mouseup", e => {
      const button = getButtonName(e.button)
      this.executionContext.input.mouse.button[button] = { is_down: false, is_pressed: false, is_up: true }
    })
  }

  //#region Global Builtins
  async sleep(ms: number) {
    await new Promise((resolve, reject) => {
      setTimeout(() => (
        this.executionContext.is_stopped() ? reject("Stopped") : resolve(null)
      ), ms)
    })
  }

  async tick() {
    const start = performance.now()
    await this.sleep(0)
    const end = performance.now()

    return (end - start) / 1000
  }

  async awaitFrame() {
    return new Promise((resolve, reject) => {
      requestAnimationFrame(() => (
        this.executionContext.is_stopped() ? reject("Stopped") : resolve(null)
      ))
    })
  }
  //#endregion

  //#region Game Object Functions
  // Get bounds (min_x, max_x, min_y, max_y) for the game object regarding its rotation
  get_bounds(game_object: RuntimeGameObjectData) {
    const sprite = this.executionContext.sprites[game_object.sprites[game_object.active_sprite]]
    const transform = game_object.transform

    const width = transform.width * sprite.width
    const height = transform.height * sprite.height

    const x = -width / 2
    const y = -height / 2

    const rotation = transform.rotation * Math.PI / 180
    const cos = Math.cos(rotation)
    const sin = Math.sin(rotation)

    const points = [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height }
    ]

    const bounds = points.map(point => ({
      x: transform.x + (point.x * cos - point.y * sin),
      y: transform.y + (point.x * sin + point.y * cos)
    }))
    const min_x = Math.min(...bounds.map(point => point.x))
    const max_x = Math.max(...bounds.map(point => point.x))
    const min_y = Math.min(...bounds.map(point => point.y))
    const max_y = Math.max(...bounds.map(point => point.y))

    return { min_x, max_x, min_y, max_y }
  }

  move(game_object: RuntimeGameObjectData, x: number, y: number): null {
    game_object.transform.x += x * this.executionContext.time.delta_time
    game_object.transform.y += y * this.executionContext.time.delta_time

    return null
  }

  rotate(game_object: RuntimeGameObjectData, angle: number): null {
    game_object.transform.rotation += angle * this.executionContext.time.delta_time

    return null
  }

  rotate_to(game_object: RuntimeGameObjectData, target_game_object_or_x: any, target_y?: number): number {
    const x = typeof target_game_object_or_x === "number" ? target_game_object_or_x : target_game_object_or_x.transform.x as number
    target_y = typeof target_game_object_or_x === "number" ? target_y as number : target_game_object_or_x.transform.y as number

    const angle = Math.atan2(target_y - game_object.transform.y, x - game_object.transform.x) * 180 / Math.PI
    game_object.transform.rotation = angle

    return angle
  }

  previous_sprite(game_object: RuntimeGameObjectData) {
    game_object.active_sprite = (game_object.active_sprite - 1 + game_object.sprites.length) % game_object.sprites.length
  }

  next_sprite(game_object: RuntimeGameObjectData) {
    game_object.active_sprite = (game_object.active_sprite + 1) % game_object.sprites.length
  }

  private collisionEngine = new CollisionEngine()
  get_collision_with(game_object: RuntimeGameObjectData, target_game_object_or_x: any, target_y?: number): CollisionInfo | null {
    const collision = target_y !== undefined ?
      this.collisionEngine.spritePointCollision(
        this.executionContext.sprites[game_object.sprites[game_object.active_sprite]], game_object.transform, 
        new Vector(target_game_object_or_x, target_y)
      ) :
      this.collisionEngine.spriteCollision(
        this.executionContext.sprites[game_object.sprites[game_object.active_sprite]], game_object.transform,
        this.executionContext.sprites[target_game_object_or_x.sprites[target_game_object_or_x.active_sprite]], target_game_object_or_x.transform
      )

    if (collision) collision.game_object = target_game_object_or_x

    return collision
  }

  get_box_collision_with(game_object: RuntimeGameObjectData, target_game_object_or_x: any, target_y?: number): CollisionInfo | null {
    const collision = target_y !== undefined ?
      this.collisionEngine.spriteBoxPointCollision(
        this.executionContext.sprites[game_object.sprites[game_object.active_sprite]], game_object.transform,
        new Vector(target_game_object_or_x, target_y)
      ) :
      this.collisionEngine.spriteBoxCollision(
        this.executionContext.sprites[game_object.sprites[game_object.active_sprite]], game_object.transform,
        this.executionContext.sprites[target_game_object_or_x.sprites[target_game_object_or_x.active_sprite]], target_game_object_or_x.transform
      )

    if (collision) collision.game_object = target_game_object_or_x

    return collision
  }

  get_collisions(game_object: RuntimeGameObjectData, layers?: number[]): CollisionInfo[] {
    const boxCollisions = this.get_box_collisions(game_object, layers) // Get box collisions first
    const collisions: CollisionInfo[] = []

    for (const boxCollision of boxCollisions) {
      const collision = this.get_collision_with(game_object, boxCollision.game_object)

      if (collision) {
        collision.game_object = boxCollision.game_object
        collisions.push(collision)
      }
    }

    return collisions
  }

  get_box_collisions(game_object: RuntimeGameObjectData, layers?: number[]): CollisionInfo[] {
    const collisions: CollisionInfo[] = []

    for (const other_game_object of Object.values(this.executionContext.game_objects) as RuntimeGameObjectData[]) {
      if (other_game_object === game_object) continue // Skip self
      if (layers && !layers.includes(other_game_object.layer)) continue // Skip if not in layer

      const collision = this.get_box_collision_with(game_object, other_game_object)
      if (collision) collisions.push(collision)
    }

    return collisions
  }
  //#endregion

  //#region Private builtins
  private spritesCache: { [src: string]: HTMLImageElement } = {}
  async render(data: RuntimeProjectData, canvas: HTMLCanvasElement, clearCache: boolean = false) {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Disable image smoothing
    ctx.imageSmoothingEnabled = false

    // Update image cache
    if (clearCache) {
      for (const cachedSprite in this.spritesCache) {
        if (data.sprites[cachedSprite] === undefined) delete this.spritesCache[cachedSprite]
      }
    }

    // Load new sprites
    const loadingPromises: Promise<HTMLImageElement>[] = []
    for (const sprite of Object.values(data.sprites)) {
      if (this.spritesCache[sprite.src]) continue

      loadingPromises.push(
        SpriteHelper.loadFromBase64(sprite.src)
          .then(image => this.spritesCache[sprite.src] = image)
      )
    }
    await Promise.all(loadingPromises)

    // Set matrix
    ctx.resetTransform()
    ctx.translate(0, canvas.height)
    ctx.scale(canvas.width / data.stage.width, -canvas.height / data.stage.height)
    ctx.save()

    // Clear canvas
    ctx.clearRect(0, 0, data.stage.width, data.stage.height)

    // Order game objects by layer
    const orderedGameObjects = Object.values(data.gameObjects)
      .sort((a, b) => a.layer - b.layer)

    // Draw game objects
    for (const gameObject of orderedGameObjects) {
      if (!gameObject.visible) continue

      // Skip if no sprite or index out of bounds
      const sprite = data.sprites[gameObject.sprites[gameObject.active_sprite]]
      if (!sprite) continue

      const width = gameObject.transform.width * sprite.width
      const height = gameObject.transform.height * sprite.height

      const x = -width / 2
      const y = -height / 2

      // Set matrix
      ctx.translate(gameObject.transform.x, gameObject.transform.y)
      ctx.rotate(gameObject.transform.rotation * Math.PI / 180)

      if (gameObject.transform.width < 0) ctx.scale(-1, 1)
      if (gameObject.transform.height > 0) ctx.scale(1, -1)

      // Draw sprite
      ctx.drawImage(this.spritesCache[sprite.src], x, y, width, height)

      // Reset matrix
      ctx.restore()
      ctx.save()

      if (gameObject?.debug?.show_bounding_box)
        this.renderDebugInfo(data, gameObject, ctx)
    }
  }

  renderDebugInfo(data: RuntimeProjectData, gameObject: RuntimeGameObjectData, ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "orange"
    ctx.lineWidth = 5

    const corners = this.collisionEngine.getVertices(gameObject.transform, data.sprites[gameObject.sprites[gameObject.active_sprite]])
    for (const corner of corners) {
      ctx.beginPath()
      ctx.arc(corner.x, corner.y, 10, 0, 2 * Math.PI)
      ctx.stroke()
    }

    // Draw edges
    for (let i = 0; i < corners.length; i++) {
      const next = corners[(i + 1) % corners.length]

      ctx.beginPath()
      ctx.moveTo(corners[i].x, corners[i].y)
      ctx.lineTo(next.x, next.y)
      ctx.stroke()
    }

    // Draw edges
    if (this.executionContext.sprites !== undefined) {
      // Draw bounding box
      ctx.strokeStyle = "blue"
      ctx.lineWidth = 5

      const bounds = this.get_bounds(gameObject)
      ctx.strokeRect(bounds.min_x, bounds.min_y, bounds.max_x - bounds.min_x, bounds.max_y - bounds.min_y)
    }

    // Draw collisions with first game object
    const firstGameObject = Object.values(data.gameObjects)[0]
    if (gameObject !== firstGameObject) {
      ctx.strokeStyle = "green"
      ctx.lineWidth = 5

      const collision = this.collisionEngine.spriteBoxCollision(
        data.sprites[gameObject.sprites[gameObject.active_sprite]], gameObject.transform, 
        data.sprites[firstGameObject.sprites[firstGameObject.active_sprite]], firstGameObject.transform
      )

      if (collision) {
        ctx.strokeRect(collision.box.x, collision.box.y, collision.box.width, collision.box.height)
        ctx.beginPath()
        ctx.arc(collision.point.x, collision.point.y, 10, 0, 2 * Math.PI)
        ctx.stroke()
      }
    }
  }

  updateInput() {
    for (const key in this.executionContext.input.key) {
      const state = this.executionContext.input.key[key]

      if (state.is_down) state.is_down = false
      if (state.is_up) delete this.executionContext.input.key[key]
    }

    for (const button in this.executionContext.input.mouse.button) {
      const state = this.executionContext.input.mouse.button[button]

      if (state.is_down) state.is_down = false
      if (state.is_up) delete this.executionContext.input.mouse.button[button]
    }
  }
  //#endregion
}

export interface KeyState {
  is_down: boolean
  is_pressed: boolean
  is_up: boolean
}