import ProgramAST from "@/core/compiler/ast/program-ast"

export interface ProjectData {
  title: string
  workspace: WorkspaceData

  sprites: { [id: string]: string }

  stage: StageData
  gameObjects: { [key: string]: GameObjectData }
}

export interface WorkspaceData {
  selectedGameObjectKey: string
  selectedLibrarySpriteKey: string | null

  advanced?: boolean
}

export interface StageData {
  width: number
  height: number
}

export interface GameObjectData {
  id: string

  transform: {
    x: number
    y: number
    rotation: number
    width: number
    height_scale: number
  }

  visible: boolean
  layer: number
  sprites: string[]
  active_sprite: number

  code: string
}

export interface RuntimeGameObjectData extends Omit<GameObjectData, "code"> {
  code: ProgramAST
}
