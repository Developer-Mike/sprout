import ExecutionHelper from '@/utils/execution-helper'
import Compiler from '../compiler/compiler'
import { RuntimeProjectData } from '@/types/RuntimeProjectData'
import EngineBuiltins from './engine-builtins'

export default class EngineRunner {
  static run(data: RuntimeProjectData, isStopped: () => boolean, canvas: HTMLCanvasElement) {
    const engineBuiltins = new EngineBuiltins()

    const executionContext = {
      get Object() { return Object },
      get is_stopped() { return isStopped },
      ...Compiler.getBuiltins(),
      ...engineBuiltins.GLOBAL,
      stage: data.stage,
      sprites: data.sprites,
      game_objects: data.gameObjects,
    }

    for (const gameObject of Object.values(data.gameObjects)) {
      const gameObjectExecutionContext = {
        ...executionContext,
        game_object: gameObject,
      }

      // Add builtin functions to game object
      for (const key in engineBuiltins.GAME_OBJECT_BUILTINS) {
        const path = key.split(".")
        let target: any = gameObjectExecutionContext.game_object
        while (path.length > 1) {
          const subpath = path.shift() as string

          if (!target[subpath]) target[subpath] = {}
          target = target[subpath]
        }

        Object.defineProperty(target, path[0], {
          get: () => (...params: any) => engineBuiltins.GAME_OBJECT_BUILTINS[key].call(engineBuiltins, gameObject, ...params)
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