import ExecutionHelper from '@/utils/execution-helper'
import { RuntimeGameObjectData, RuntimeProjectData } from '@/types/RuntimeProjectData'
import EngineBuiltins from './engine-builtins'
import LanguageBuiltins from '../compiler/language-builtins'
import { AutocompletionItemType } from '../autocompletion-item'

export default class EngineRunner {
  static runGameObjectCode(gameObject: RuntimeGameObjectData, executionContext: any) {
    ExecutionHelper.scopedEval(`
      const game_object = game_objects["${gameObject.id}"]
      const sleep = (...params) => _sleep(...params, game_object)
      const await_frame = () => _await_frame(game_object)

      ${gameObject.code.toJavaScript()}

      ${ /* Add getters (and setters) for game_object's global properties */ "" }
      ${Object.entries(gameObject.code.getGlobalDeclarations()).map(([name, info]) => `
      Object.defineProperty(game_object, "${name}", {
        get: () => { return ${name} },
        ${info.type === AutocompletionItemType.VARIABLE ? `set: (value) => { ${name} = value }` : ""}
      })
      `).join("\n")}
    `, executionContext, error => executionContext._on_error(gameObject.id, error))
  }

  static run(data: RuntimeProjectData, isStopped: () => boolean, canvas: HTMLCanvasElement, onError: (gameObjectId: string, error: Error) => void) {
    const executionContext = {
      _on_error: onError,
      is_stopped: isStopped,
      stage: data.stage,
      sprites: data.sprites,
      game_objects: data.gameObjects
    } as any

    // Add builtins to the execution context
    new LanguageBuiltins(executionContext)
    const engineBuiltins = new EngineBuiltins(executionContext, canvas)

    for (const gameObject of Object.values(data.gameObjects))
      EngineRunner.runGameObjectCode(gameObject, executionContext)

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
        executionContext.time.delta_time = await executionContext.tick()

        // Run game loop
        for (const gameObject of Object.values(executionContext.game_objects) as RuntimeGameObjectData[]) {
          for (const listener of gameObject.on) {
            let condition = false
            try { condition = listener.condition() } catch (error: any) { executionContext._on_error(gameObject.id, error) }
            
            if (condition) {
              listener.callback().then(unsubscribe => {
                if (executionContext.is_stopped()) return
                if (unsubscribe !== true) return
                
                gameObject.on = gameObject.on.filter(l => l !== listener)
              }).catch(error => executionContext._on_error(gameObject.id, error))
            }
          }
        }

        executionContext.frame = false
        engineBuiltins.updateInput()
      }
    })()
  }
}