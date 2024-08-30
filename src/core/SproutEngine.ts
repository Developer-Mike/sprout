import { GameObjectData, ProjectData } from "../types/ProjectData"
import * as InbuiltFunctions from "./InbuiltFunctions"

export default class SproutEngine {
  static render(data: ProjectData, canvas: HTMLCanvasElement) {
    InbuiltFunctions.render(data, canvas)
  }

  static async run(data: ProjectData, getIsRunning: () => boolean, canvas: HTMLCanvasElement) {
    // Optimize sprites
    const optimizedSprites = Object.fromEntries(
      Object.entries(data.sprites)
        .filter(([key, _value]) => Object.values(data.gameObjects).some(gameObject => gameObject.sprites.includes(key)))
    )

    // Compile game objects' code
    const compiledGameObjects = Object.values(data.gameObjects).reduce((acc, gameObject) => {
      // TODO: Compilation error handling

      acc[gameObject.id] = {
        ...gameObject,
        code: gameObject.code // TODO: Compile code
      }

      return acc
    }, {} as Record<string, GameObjectData>)


    // Useless but for good for TSLint (Values are required in the eval)
    getIsRunning = getIsRunning
    canvas = canvas

    eval(`
      // Initialize data
      const runningCache = {
        sprites: ${JSON.stringify(optimizedSprites)},
        stage: ${JSON.stringify(data.stage)},
        gameObjects: ${JSON.stringify(compiledGameObjects)}
      }

      // TODO: Add inbuilt functions
      ${ Object.values(InbuiltFunctions).map(value => (
        value.toString()
      )).join("\n") }

      // Run objects' code
      ${ Object.values(compiledGameObjects).map(gameObject => (`
        ;(async () => {
          const that = runningCache.gameObjects["${gameObject.id}"]
          let deltaTime = 0

          ${gameObject.code}
        })()
      `)).join("\n") }

      // Add main loop
      ;(async () => {
        while (true) {
          render(runningCache, canvas)
          await frame()
        }
      })()
    `)
  }
}