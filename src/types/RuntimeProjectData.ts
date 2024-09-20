import ProgramAST from "@/core/compiler/ast/program-ast"
import { GameObjectData, SpriteData, StageData } from "./ProjectData"

export interface RuntimeProjectData {
  stage: StageData
  sprites: { [id: string]: SpriteData }
  gameObjects: { [key: string]: RuntimeGameObjectData }
}

export interface RuntimeGameObjectData extends Omit<GameObjectData, "code"> {
  code: ProgramAST
}