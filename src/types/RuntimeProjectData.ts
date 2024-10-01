import ProgramAST from "@/core/compiler/ast/program-ast"
import { GameObjectData, SpriteData, StageData } from "./ProjectData"

export interface RuntimeProjectData {
  stage: StageData
  sprites: { [id: string]: RuntimeSpriteData }
  gameObjects: { [key: string]: RuntimeGameObjectData }
}

export interface RuntimeSpriteData extends SpriteData {
  collision_mask: ImageData
}

export interface RuntimeGameObjectData extends Omit<GameObjectData, "code"> {
  code: ProgramAST
  on: { condition: () => boolean, callback: () => Promise<any> }[]
}