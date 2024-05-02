import { useState } from "react"
import SproutEngine from "./SproutEngine"

export const STARTER_PROJECTS = {
  debug: require("./starter-projects/debug").default
}

export default class Project {
  static dataState: ProjectData
  static setDataState: (data: ProjectData) => void
  static createStates() {
    const [dataState, setDataState] = useState<ProjectData>(null as any)
    Project.dataState = dataState
    Project.setDataState = setDataState
  }

  get data() { return Project.dataState }
  setData: (transaction: (data: ProjectData) => void) => void

  constructor(data: ProjectData) {
    Project.setDataState(data)

    this.setData = (transaction: (data: ProjectData) => void) => {
      const newData = JSON.parse(JSON.stringify(this.data))
      transaction(newData)

      Project.setDataState(newData)
    }
  }

  getGameObjectIndex(id: string) {
    return this.data.gameObjects.findIndex(gameObject => gameObject.id === id)
  }

  getActiveGameObjectIndex() {
    return this.getGameObjectIndex(this.data.workspace.selectedGameObject)
  }

  getActiveGameObject() {
    return this.data.gameObjects[this.getActiveGameObjectIndex()]
      ?? this.data.gameObjects[0]
  }

  render(canvas: HTMLCanvasElement) {
    SproutEngine.render(this.data, canvas)
  }

  // TODO: Return errors
  async run(canvas: HTMLCanvasElement) {
    this.setData(data => { data.workspace.isRunning = true })

    SproutEngine.run(this.data, () => this.data.workspace.isRunning, canvas)
  }

  stop(canvas: HTMLCanvasElement) {
    this.setData(data => { data.workspace.isRunning = false })

    // Reset canvas
    this.render(canvas)
  }

  export() {
    return JSON.stringify(this.data)
  }

  exportAsHTML() {
    return SproutEngine.generateExportableHTMLCode(this.data)
  }
}

export interface ProjectData {
  title: string
  workspace: WorkspaceData

  sprites: { [id: string]: string }

  stage: StageData
  gameObjects: GameObjectData[]
}

export interface WorkspaceData {
  isRunning: boolean

  selectedGameObject: string

  advanced?: boolean
}

export interface StageData {
  width: number
  height: number
}

export interface GameObjectData {
  id: string

  visible: boolean
  x: number
  y: number
  layer: number
  rotation: number
  width: number
  height: number

  sprites: string[]
  activeSprite: number

  code: string
}