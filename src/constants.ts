import { GameObjectData } from "./types/ProjectData"

export const DEBUG = process.env.NODE_ENV === "development"
export const DEBUG_BYPASS_SAVE_ALERT = DEBUG && true

export const BLANK_IMAGE = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
export const DEFAULT_GAME_OBJECT_SIZE = 32
export const DEFAULT_GAME_OBJECT: GameObjectData = {
  id: "",
  visible: true,
  layer: 0,
  active_sprite: 0,
  sprites: [],
  transform: {
    x: 0,
    y: 0,
    rotation: 0,
    width: DEFAULT_GAME_OBJECT_SIZE,
    height_scale: 1
  },
  code: ""
}

export const SPROUT_LANGUAGE_KEY = "javascript" // TODO: Change to sproutscript