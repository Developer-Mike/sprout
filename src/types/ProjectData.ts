export interface ProjectData {
  title: string
  workspace: WorkspaceData

  stage: StageData
  sprites: { [id: string]: SpriteData }
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

export interface SpriteData {
  src: string
  collision_mask: boolean[][]
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
    height: number
  }

  visible: boolean
  layer: number
  sprites: string[]
  active_sprite: number

  code: string
}