import { GameObjectData, ProjectData, RuntimeGameObjectData } from "../types/ProjectData"
import Compiler from "./compiler/compiler"
import * as EngineDefinitions from "./engine/engine-definitions"
import * as EngineRunner from "./engine/engine-runner"

export default class SproutEngine {
  static render(data: ProjectData, canvas: HTMLCanvasElement) {
    EngineDefinitions.render(data, canvas)
  }

  static async run(data: ProjectData, isStopped: () => boolean, canvas: HTMLCanvasElement, setDebugInfo?: (key: string, value: any) => void) {
    // Optimize sprites
    const optimizedSprites = Object.fromEntries(
      Object.entries(data.sprites)
        .filter(([key, _value]) => Object.values(data.gameObjects).some(gameObject => gameObject.sprites.includes(key)))
    )

    // Create compiler instance
    const compiler = new Compiler()

    // Compile game objects' code
    const compiledGameObjects = Object.values(data.gameObjects).reduce((acc, gameObject) => {
      // TODO: Compilation error handling
      const compiledCode = compiler.compile(gameObject.code)

      // Set debug info
      if (setDebugInfo) setDebugInfo(gameObject.id, compiledCode)

      acc[gameObject.id] = {
        ...gameObject,
        code: compiledCode
      }

      return acc
    }, {} as Record<string, RuntimeGameObjectData>)

    // Useless, but for good for TSLint (Values are required in the eval)
    isStopped = isStopped
    canvas = canvas

    // TODO: Change to eval
    console.log(`
      // Inbuilt language functions
       ${ Object.values(Compiler.getInbuiltFunctions()).map(value => (
        value.toString()
      )).join("\n") }

      // Initialize data
      const _sprites = ${JSON.stringify(optimizedSprites)}
      const _stage = ${JSON.stringify(data.stage)}
      const game_objects = ${JSON.stringify(compiledGameObjects)}

      // Inbuilt engine definitions
      ${ Object.values(EngineDefinitions).map(value => (
        value.toString()
      )).join("\n") }

      // Initialize game objects
      ${ Object.values(compiledGameObjects).map(value => (`
      ;(() => {
        const game_object = game_objects["${value.id}"]

        ${ /* TODO
          // Link inbuilt engine functions to game_object
          // Mappings in InbuiltEngineFunctions:
          // { "transform.rotate_to": rotate_to }
          Object.defineProperty(game_objects["id"]["transform"], 'rotate_to', {
            get: (...params) => rotate_to(game_objects["id"], ...params)
          })*/ ""
        }

        // Compiled code
        ${value.code}

        // Register global scope vars/functions
        ${ value.code.getGlobalDeclarations().map(declaration => (`
        Object.defineProperty(game_object, '${declaration.name}', {
          get: () => ${declaration.name},
          ${ declaration.readonly ? "" : `set: (value) => ${declaration.name} = value` }
        })
        `)).join("\n") }
      })()
      `)).join("\n") }

      // Engine runner
      ${ Object.values(EngineRunner).map(value => (
        `;(${value.toString()})()`
      )).join("\n") }
    `)
  }
}