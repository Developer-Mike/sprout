import ProgramAST from "@/core/compiler/ast/program-ast"
import { GameObjectData, SpriteData, StageData } from "./ProjectData"

export interface RuntimeProjectData {
  stage: StageData
  sprites: { [id: string]: RuntimeSpriteData }
  gameObjects: { [key: string]: RuntimeGameObjectData }
}

export interface RuntimeSpriteData extends SpriteData {
  collision_mask: CanvasImageSource
}

export interface RuntimeGameObjectData extends Omit<GameObjectData, "code"> {
  is_clone: boolean
  destroyed: boolean
  code: ProgramAST
  on: { condition: () => boolean, callback: () => Promise<any> }[]
}