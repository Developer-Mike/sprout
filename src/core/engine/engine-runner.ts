import { StageData } from '@/types/ProjectData'
import { tick } from './engine-definitions'
import { render } from './engine-definitions'

// Only to suppress the error
const isStopped = () => false
const canvas = null as unknown as HTMLCanvasElement
const _sprites = {}
const _stage = {} as unknown as StageData
const game_objects: { [key: string]: any } = {}
let frame = false

export const renderer = async () => {
  while (!isStopped()) {
    await tick()

    render(game_objects, _sprites, _stage, canvas)
    frame = true
  }
}

export const mainloop = async () => {
  while (!isStopped()) {
    for (const game_object of Object.values(game_objects)) {
      for (const on_listener of game_object.on) {
        if (on_listener.condition) on_listener.callback()
      }
    }
  
    if (frame) frame = false
    await tick()
  }
}