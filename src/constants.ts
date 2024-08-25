import { GameObjectData } from "./types/ProjectData"

export const BLANK_IMAGE = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
export const DEFAULT_GAME_OBJECT_SIZE = 32
export const DEFAULT_GAME_OBJECT: GameObjectData = {
  id: "",
  visible: true,
  x: 0,
  y: 0,
  layer: 0,
  rotation: 0,
  width: DEFAULT_GAME_OBJECT_SIZE,
  height: DEFAULT_GAME_OBJECT_SIZE,
  sprites: [],
  activeSprite: 0,
  code: ""
}