import ExecutionHelper from "@/utils/execution-helper"
import { GameObjectData, ProjectData, RuntimeGameObjectData } from "../types/ProjectData"
import Compiler from "./compiler/compiler"
import * as EngineDefinitions from "./engine/engine-definitions"
import * as EngineRunner from "./engine/engine-runner"
import * as GameObjectFunctions from "./engine/game-object-functions"
import ProgramAST from "./compiler/ast/program-ast"

export default class ProjectRunner {
  static render(data: ProjectData, canvas: HTMLCanvasElement) {
    EngineDefinitions.render(data.gameObjects, data.sprites, data.stage, canvas)
  }

  static async run(data: ProjectData, isStopped: () => boolean, canvas: HTMLCanvasElement, setDebugInfo?: (key: string, value: any) => void) {
    // Optimize sprites
    const optimizedSprites = Object.fromEntries(
      Object.entries(data.sprites)
        .filter(([key, _value]) => Object.values(data.gameObjects).some(gameObject => gameObject.sprites.includes(key)))
    )

    // Compile code
    const compiler = new Compiler()
    const compiledCodes = Object.values(data.gameObjects).reduce((acc, gameObject) => {
      // TODO: Handle errors
      const compiledCode = compiler.compile(gameObject.code)

      // Set debug info
      if (setDebugInfo) setDebugInfo(gameObject.id, compiledCode)

      acc[gameObject.id] = compiledCode

      return acc
    }, {} as Record<string, ProgramAST>)

    // Compile game objects' code
    const runtimeGameObjects = Object.values(data.gameObjects).reduce((acc, gameObject) => {
      const runtimeGameObject = { ...gameObject } as any

      // Shrink output
      delete runtimeGameObject.code

      acc[gameObject.id] = runtimeGameObject as RuntimeGameObjectData

      return acc
    }, {} as Record<string, RuntimeGameObjectData>)

    // DEBUG
    for (const compiledCode of Object.values(compiledCodes)) {
      console.log(compiledCode.toJavaScript())
    }
    return

    // Execution relevant code starts here ------------------------------------------------
    const executionContext = {
      isStopped,
      canvas,
    }

    ExecutionHelper.scopedEval(`
      // Inbuilt language functions
      ${ Object.values(Compiler.getInbuiltFunctions()).map(value => (
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