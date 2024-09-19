import ExecutionHelper from '@/utils/execution-helper'
import Compiler from '../compiler/compiler'
import { RuntimeProjectData } from '@/types/RuntimeProjectData'
import EngineBuiltins from './engine-builtins'

export default class EngineRunner {
  static run(readonlyData: RuntimeProjectData, isStopped: () => boolean, canvas: HTMLCanvasElement) {
    const data = JSON.parse(JSON.stringify(readonlyData)) as RuntimeProjectData
    const engineBuiltins = new EngineBuiltins()

    const executionContext = {
      stage: data.stage,
      sprites: data.sprites,
      game_objects: data.gameObjects,
      ...Compiler.getBuiltins(),
      ...engineBuiltins.GLOBAL,
    }

    for (const gameObject of Object.values(data.gameObjects)) {
      const gameObjectExecutionContext = {
        ...executionContext,
        game_object: gameObject,
      }

      // Add builtin functions to game object
      for (const key in engineBuiltins.GAME_OBJECT_BUILTINS) {
        const path = key.split(".")
        let target: any = gameObjectExecutionContext
        while (path.length > 1) target = target[path.shift() as string]

        Object.defineProperty(target, path[0], {
          get: () => engineBuiltins.GAME_OBJECT_BUILTINS[key](gameObject)
        })
      }

      // Run game object code
      ExecutionHelper.scopedEval(`        
        ${gameObject.code.toJavaScript()}

        // Add getters (and setters) for game_object's global properties
        ${gameObject.code.getGlobalDeclarations().map(declaration => `
        Object.defineProperty(game_object, "${declaration.identifier.name}", {
          get: () => { return ${declaration.identifier.name} },
          ${declaration.readonly ? "" : `set: (value) => { ${declaration.identifier.name} = value }`}
        })
        `).join("\n")}
      `, gameObjectExecutionContext)
    }

    // Render loop
    ;(async () => {
      while (!isStopped()) {
        await executionContext.await_frame()

        engineBuiltins.render(data, canvas)
        engineBuiltins.frame = true
      }
    })()

    // Main loop
    ;(async () => {
      while (!isStopped()) {
        // TODO: Handle input

        await executionContext.tick()
        engineBuiltins.frame = false
      }
    })()
  }
}