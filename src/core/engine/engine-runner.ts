import { StageData } from '@/types/ProjectData'
import { tick } from './engine-definitions'
import { render } from './engine-definitions'

// Only to suppress errors
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
  // Handle input

  while (!isStopped()) {
    if (frame) frame = false
    await tick()
  }
}