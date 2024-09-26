import ExecutionHelper from '@/utils/execution-helper'
import { RuntimeGameObjectData, RuntimeProjectData } from '@/types/RuntimeProjectData'
import EngineBuiltins from './engine-builtins'
import LanguageBuiltins from '../compiler/language-builtins'

export default class EngineRunner {
  static run(data: RuntimeProjectData, isStopped: () => boolean, canvas: HTMLCanvasElement) {
    const executionContext = {
      is_stopped: isStopped,
      stage: data.stage,
      sprites: data.sprites,
      game_objects: data.gameObjects
    } as any

    // Add builtins to the execution context
    new LanguageBuiltins(executionContext)
    const engineBuiltins = new EngineBuiltins(executionContext, canvas)

    for (const gameObject of Object.values(data.gameObjects)) {
      // Run game object code
      ExecutionHelper.scopedEval(`
        const game_object = game_objects["${gameObject.id}"]

        ${gameObject.code.toJavaScript()}

        ${ /* Add getters (and setters) for game_object's global properties */ "" }
        ${gameObject.code.getGlobalDeclarations().map(declaration => `
        Object.defineProperty(game_object, "${declaration.identifier.name}", {
          get: () => { return ${declaration.identifier.name} },
          ${declaration.readonly ? "" : `set: (value) => { ${declaration.identifier.name} = value }`}
        })
        `).join("\n")}
      `, executionContext)
    }

    // Render loop
    ;(async () => {
      while (!isStopped()) {
        await engineBuiltins.awaitFrame()

        engineBuiltins.render(data, canvas)
        executionContext.frame = true
      }
    })()

    // Main loop
    ;(async () => {
      while (!isStopped()) {
        // Run game loop
        for (const gameObject of Object.values(executionContext.game_objects) as RuntimeGameObjectData[]) {
          for (const listener of gameObject.on) {
            if (listener.condition()) {
              listener.callback().then(unsubscribe => {
                if (unsubscribe !== true) return
                gameObject.on = gameObject.on.filter(l => l !== listener)
              })
            }
          }
        }
        executionContext.frame = false
        engineBuiltins.updateInput()

        await executionContext.tick()
      }
    })()
  }
}