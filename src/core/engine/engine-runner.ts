import ExecutionHelper from '@/utils/execution-helper'
import Compiler from '../compiler/compiler'
import { RuntimeProjectData } from '@/types/RuntimeProjectData'

/* TODO: Migrate this
export const renderer = async () => {
  while (!isStopped()) {
    await tick()

    render(game_objects, _sprites, _stage, canvas)
    frame = true
  }
}

export const mainloop = async () => {
  // Handle input

  while (!isStopped()) {
    if (frame) frame = false
    await tick()
  }
} */

export default class EngineRunner {
  static run(data: RuntimeProjectData, isStopped: () => boolean, canvas: HTMLCanvasElement) {
    const sprites = data.sprites
    const stage = data.stage
    const gameObjects = data.gameObjects

    const executionContext = {
      isStopped,
      canvas,
    }

    ExecutionHelper.scopedEval(`
      // Inbuilt language functions
      ${ Object.values(Compiler.getBuiltins()).map(value => (
        value.toString()
      )).join("\n") }

      // Initialize data
      const _sprites = ${ JSON.stringify(optimizedSprites) }
      const _stage = ${ JSON.stringify(data.stage) }
      const game_objects = ${ JSON.stringify(runtimeGameObjects) }

      // Inbuilt engine definitions
      ${ Object.values(EngineDefinitions).map(value => (
        value.toString()
      )).join("\n") }

      // Inbuilt game object functions
      ${ Object.values(GameObjectFunctions).map(value => (
        value.toString()
      )).join("\n") }

      // Initialize game objects
      ${ Object.values(runtimeGameObjects).map(value => (`
      ;(() => {
        const game_object = game_objects["${value.id}"]

        // Link inbuilt engine functions to game_object
        // Mappings in InbuiltEngineFunctions:
        // { "transform.rotate_to": rotate_to }
        ${ Object.keys(GameObjectFunctions.FUNCTION_MAP).map(path => {
          const splitPath = path.split(".")
          const last = splitPath.pop() as string

          return `Object.defineProperty(game_object${splitPath.map(segment => `[${segment}]`)}, '${last}', {
            get: (...params) => ${last}(game_object, ...params)
          })`
        }).join("\n") }

        // Compiled code
        ${ compiledCodes[value.id].toJavaScript() }

        // Register global scope vars/functions
        ${ compiledCodes[value.id].getGlobalDeclarations().map(declaration => (`
        Object.defineProperty(game_object, '${declaration.name}', {
          get: () => ${declaration.name.toJavaScript()},
          ${ declaration.readonly ? "" : `set: (value) => ${declaration.name} = value` }
        })
        `)).join("\n") }
      })()
      `)).join("\n") }

      // Engine runner
      ${ Object.values(EngineRunner).map(value => (
        `;(${value.toString()})()`
      )).join("\n") }
    `, executionContext)
  }
}