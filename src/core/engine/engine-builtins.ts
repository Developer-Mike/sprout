import { RuntimeGameObjectData, RuntimeProjectData } from "@/types/RuntimeProjectData"

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
    "transform.rotate_to": this.rotate_to
  }

  move(game_object: RuntimeGameObjectData, x: number, y: number) {
    game_object.transform.x += x * this.executionContext.time.delta_time
    game_object.transform.y += y * this.executionContext.time.delta_time
  }

  rotate(game_object: RuntimeGameObjectData, angle: number) {
    game_object.transform.rotation += angle * this.executionContext.time.delta_time
  }

  rotate_to(game_object: RuntimeGameObjectData, target_game_object_or_x: any, target_y?: number) {
    const x = typeof target_game_object_or_x === "number" ? target_game_object_or_x : target_game_object_or_x.transform.x as number
    target_y = typeof target_game_object_or_x === "number" ? target_y as number : target_game_object_or_x.transform.y as number

    const angle = Math.atan2(target_y - game_object.transform.y, x - game_object.transform.x) * 180 / Math.PI
    game_object.transform.rotation = angle

    return angle
  }
  //#endregion

  //#region Private builtins
  private imageCache: { [src: string]: HTMLImageElement } = {}
  async render(data: RuntimeProjectData, canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Update image cache
    const newCache: { [src: string]: HTMLImageElement } = {}
    for (const sprite of Object.values(data.sprites)) {
      if (this.imageCache[sprite.src]) newCache[sprite.src] = this.imageCache[sprite.src]
      else {
        const image = new Image()
        image.src = sprite.src
        newCache[sprite.src] = image
      }
    }
    await Promise.all(Object.values(newCache).map(image => new Promise(resolve => {
      if (image.complete) resolve(void 0)
      else image.onload = resolve
    })))
    this.imageCache = newCache

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
      ctx.translate(gameObject.transform.x, gameObject.transform.y)
      ctx.rotate(gameObject.transform.rotation * Math.PI / 180)

      if (gameObject.transform.width < 0) ctx.scale(-1, 1)
      if (gameObject.transform.height < 0) ctx.scale(1, -1)

      // Draw sprite
      ctx.drawImage(this.imageCache[sprite.src], x, y, width, height)

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