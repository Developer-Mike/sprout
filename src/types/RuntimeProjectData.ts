import ProgramAST from "@/core/compiler/ast/program-ast"
import { GameObjectData, StageData } from "./ProjectData"

export interface RuntimeProjectData {
  sprites: { [id: string]: string }
  stage: StageData
  gameObjects: { [key: string]: RuntimeGameObjectData }
}

export interface RuntimeGameObjectData extends Omit<GameObjectData, "code"> {
  code: ProgramAST
}