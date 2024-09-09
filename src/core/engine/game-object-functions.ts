import { RuntimeGameObjectData } from "@/types/ProjectData"

// Only to suppress errors
const time = {
  frame_time: 1
}

export const FUNCTION_MAP: { [path: string]: (...params: any) => any } = {
  "move": move,
  "rotate": rotate
}

function move(game_object: RuntimeGameObjectData, x: number, y: number) {
  game_object.x += x * time.frame_time
  game_object.y += y * time.frame_time
}

function rotate(game_object: RuntimeGameObjectData, angle: number) {
  game_object.rotation += angle * time.frame_time
}