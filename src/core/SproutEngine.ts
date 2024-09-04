import { GameObjectData, ProjectData } from "../types/ProjectData"
import Compiler from "./compiler/compiler"
import * as EngineFunctions from "./EngineFunctions"

export default class SproutEngine {
  static render(data: ProjectData, canvas: HTMLCanvasElement) {
    EngineFunctions.render(data, canvas)
  }

  static async run(data: ProjectData, getIsRunning: () => boolean, canvas: HTMLCanvasElement, setDebugInfo?: (key: string, value: any) => void) {
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

    // Create compiler instance
    const compiler = new Compiler()

    eval(`
      // Initialize data
      const runningCache = {
        sprites: ${JSON.stringify(optimizedSprites)},
        stage: ${JSON.stringify(data.stage)},
        gameObjects: ${JSON.stringify(compiledGameObjects)}
      }

      // Add inbuilt functions
      ${ Object.values(EngineFunctions).map(value => (
        value.toString()
      )).join("\n") }

      ${ compiler.compile(data) }

      // Run objects' code
      ${ Object.values(compiledGameObjects).map(gameObject => (`
        // TODO: Global object properties

        ;(async () => {
          const go = runningCache.gameObjects["${gameObject.id}"]
          let deltaTime = 0

          ${compiler.compile(gameObject.code, Object.entries(data.gameObjects).find(([key, _]) => key === data.workspace.selectedGameObjectKey)![1].id === gameObject.id ? setDebugInfo : undefined)}
        })()
      `)).join("\n") }

      // Add main loop
      ;(async () => {
        while (true) {
          render(runningCache, canvas)
          await wait_frame()
        }
      })()
    `)
  }
}