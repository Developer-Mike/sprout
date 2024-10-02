import { GameObjectData } from "./types/ProjectData"

export const DEBUG = process.env.NODE_ENV === "development"
export const DEBUG_BYPASS_SAVE_ALERT = DEBUG && true

export const SPROUT_LANGUAGE_KEY = "sproutscript"
export const SPROUT_THEME_KEY = "sprouttheme"

export const MAX_CONSOLE_OUTPUT_LENGTH = 200

export const BLANK_IMAGE = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
export const DEFAULT_STAGE_SIZE = { width: 1920, height: 1080 } as const
export const DEFAULT_NEW_GAME_OBJECT: GameObjectData = {
  id: "",
  visible: true,
  layer: 0,
  active_sprite: 0,
  sprites: [],
  transform: {
    x: 0,
    y: 0,
    rotation: 0,
    width: 1,
    height: 1
  },
  code: ""
} as const