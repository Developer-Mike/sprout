import { RuntimeGameObjectData, RuntimeProjectData } from "@/types/RuntimeProjectData"
import SpriteHelper from "@/utils/sprite-helper"
import AutocompletionItem from "../autocompletion-item"

export default class EngineBuiltins {
  private executionContext: any
  private canvas: HTMLCanvasElement

  constructor(executionContext: any, canvas: HTMLCanvasElement) {
    this.executionContext = executionContext
    this.canvas = canvas

    // Add builtins to the execution context
    this.executionContext.sleep = this.sleep.bind(this)
    this.executionContext.tick = this.tick.bind(this)
    this.executionContext.await_frame = this.awaitFrame.bind(this)

    this.setupFrameValue()
    this.setupTimeValue()
    this.setupInputValue()

    // Add game object builtins
    for (const gameObjectId in this.executionContext.game_objects) {
      const gameObject = this.executionContext.game_objects[gameObjectId]

      for (const key in this.GAME_OBJECT_BUILTINS) {
        const path = key.split(".")
        let target: any = gameObject
        while (path.length > 1) {
          const subpath = path.shift() as string

          if (!target[subpath]) target[subpath] = {}
          target = target[subpath]
        }

        Object.defineProperty(target, path[0], {
          get: () => (...params: any) => this.GAME_OBJECT_BUILTINS[key].call(this, gameObject, ...params)
        })
      }
    }
  }

  addAutocompletionItems(suggestions: AutocompletionItem[]) {
    // TODO: Add builtins autocompletion items
  }

  addGameObjectsAutocompletionItems(suggestions: AutocompletionItem[]) {
    // TODO: Add game objects autocompletion items
  }

  private setupFrameValue() {
    this.executionContext.frame = false
  }

  private setupTimeValue() {
    this.executionContext.time = {
      delta_time: 1, // Default to 1
      get timestamp() { return Date.now() / 1000 },
      start_time: performance.now() / 1000,
      get timer() { return (performance.now() / 1000) - this.start_time }
    }
  }

  private setupInputValue() {
    this.executionContext.input = {
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

    const getKeyName = (key: string) => {
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
      let y = Math.min(Math.max(e.clientY - rect.top, 0), this.canvas.height)

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
  readonly GAME_OBJECT_BUILTINS: { [path: string]: (...params: any) => any } = {
    "transform.move": this.move,
    "transform.rotate": this.rotate,
    "transform.rotate_to": this.rotate_to,
    "get_collision_with": this.get_collision_with,
    "get_box_collision_with": this.get_box_collision_with,
    "get_collisions": this.get_collisions,
    "get_box_collisions": this.get_box_collisions
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

  get_bounding_box(game_object: RuntimeGameObjectData): BoundingBox {
    const sprite = this.executionContext.sprites[game_object.sprites[game_object.active_sprite]]
    const width = game_object.transform.width * (sprite?.width ?? 0)
    const height = game_object.transform.height * (sprite?.height ?? 0)

    return {
      min_x: game_object.transform.x - width / 2,
      min_y: game_object.transform.y - height / 2,
      max_x: game_object.transform.x + width / 2,
      max_y: game_object.transform.y + height / 2
    }
  }

  rotate_to(game_object: RuntimeGameObjectData, target_game_object_or_x: any, target_y?: number): number {
    const x = typeof target_game_object_or_x === "number" ? target_game_object_or_x : target_game_object_or_x.transform.x as number
    target_y = typeof target_game_object_or_x === "number" ? target_y as number : target_game_object_or_x.transform.y as number

    const angle = Math.atan2(target_y - game_object.transform.y, x - game_object.transform.x) * 180 / Math.PI
    game_object.transform.rotation = angle

    return angle
  }

  get_collision_with(game_object: RuntimeGameObjectData, target_game_object_or_x: any, target_y?: number): Collision | null {
    const box_collision = this.get_box_collision_with(game_object, target_game_object_or_x, target_y)
    if (!box_collision) return null // Not even box collision

    const game_object_collision_mask = this.executionContext.sprites[game_object.sprites[game_object.active_sprite]].collision_mask

    if (typeof target_game_object_or_x === "object") {
      const target_game_object = target_game_object_or_x

      const target_collision_mask = this.executionContext.sprites[target_game_object.sprites[target_game_object.active_sprite]].COLLISION_MASK_SIZE

      for (let y = box_collision.bounding_box.min_y; y < box_collision.bounding_box.max_y; y++) {
        for (let x = box_collision.bounding_box.min_x; x < box_collision.bounding_box.max_x; x++) {
          const local_x = x - target_game_object.transform.x
          const local_y = y - target_game_object.transform.y

          if (local_x < 0 || local_x >= target_collision_mask[0].length) continue
          if (local_y < 0 || local_y >= target_collision_mask.length) continue

          if (target_collision_mask[local_y][local_x] && game_object_collision_mask[y][x])
            return { game_object: target_game_object, bounding_box: box_collision.bounding_box }
        }
      }
    } else {
      const local_x = target_game_object_or_x as number - game_object.transform.x
      const local_y = target_y as number - game_object.transform.y

      if (local_x < 0 || local_x >= game_object_collision_mask[0].length) return null
      if (local_y < 0 || local_y >= game_object_collision_mask.length) return null

      if (game_object_collision_mask[local_y][local_x])
        return { game_object: null, bounding_box: box_collision.bounding_box }
    }

    return null
  }

  get_box_collision_with(game_object: RuntimeGameObjectData, target_game_object_or_x: any, target_y?: number): Collision | null {
    const game_object_bounding_box = this.get_bounding_box(game_object)
    const target_bounding_box = target_y === undefined ?
      this.get_bounding_box(target_game_object_or_x) :
      { min_x: target_game_object_or_x, min_y: target_y, max_x: target_game_object_or_x, max_y: target_y }

    if (
      game_object_bounding_box.min_x <= target_bounding_box.max_x &&
      game_object_bounding_box.max_x >= target_bounding_box.min_x &&
      game_object_bounding_box.min_y <= target_bounding_box.max_y &&
      game_object_bounding_box.max_y >= target_bounding_box.min_y
    ) {
      const target_game_object = typeof target_game_object_or_x === "object" ? target_game_object_or_x : null
      const collision_bounding_box = {
        min_x: Math.max(game_object_bounding_box.min_x, target_bounding_box.min_x),
        min_y: Math.max(game_object_bounding_box.min_y, target_bounding_box.min_y),
        max_x: Math.min(game_object_bounding_box.max_x, target_bounding_box.max_x),
        max_y: Math.min(game_object_bounding_box.max_y, target_bounding_box.max_y)
      }

      return { game_object: target_game_object, bounding_box: collision_bounding_box }
    }

    return null
  }

  get_collisions(game_object: RuntimeGameObjectData): Collision[] {
    const boxCollisions = this.get_box_collisions(game_object) // Get box collisions first
    const collisions: Collision[] = []

    for (const boxCollision of boxCollisions) {
      const collision = this.get_collision_with(game_object, boxCollision.game_object)
      if (collision) collisions.push(collision)
    }

    return collisions
  }

  get_box_collisions(game_object: RuntimeGameObjectData): Collision[] {
    const collisions: Collision[] = []

    for (const other_game_object of Object.values(this.executionContext.game_objects)) {
      if (other_game_object === game_object) continue // Skip self

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
    ctx.scale(canvas.width / data.stage.width, canvas.height / data.stage.height)
    ctx.save()

    // Clear canvas
    ctx.clearRect(0, 0, data.stage.width, data.stage.height)

    const orderedGameObjects = Object.values(data.gameObjects)
      .sort((a, b) => a.layer - b.layer)

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
      ctx.translate(gameObject.transform.x, data.stage.height - gameObject.transform.y)
      ctx.rotate(gameObject.transform.rotation * Math.PI / 180)

      if (gameObject.transform.width < 0) ctx.scale(-1, 1)
      if (gameObject.transform.height < 0) ctx.scale(1, -1)

      // Draw sprite
      ctx.drawImage(this.spritesCache[sprite.src], x, y, width, height)

      // Reset matrix
      ctx.restore()
      ctx.save()
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

export interface Collision {
  game_object: RuntimeGameObjectData | null
  bounding_box: BoundingBox
}

export interface BoundingBox {
  min_x: number
  min_y: number
  max_x: number
  max_y: number
}