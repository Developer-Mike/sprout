import { useEffect, useRef, useState } from "react"
import SproutEngine from "./SproutEngine"

export const STARTER_PROJECTS = {
  empty: require("./starter-projects/empty").default,
  debug: require("./starter-projects/debug").default
}

export default class Project {
  static dataState: ProjectData
  static setDataState: (data: ProjectData, callback?: (data: ProjectData) => void) => void
  static registerHooks() {
    const [dataState, setDataState] = useState<ProjectData>(null as any)
    const callbackRef = useRef<(data: ProjectData) => void>()

    useEffect(() => {
      if (callbackRef.current) callbackRef.current(dataState)
    }, [dataState])

    Project.dataState = dataState
    Project.setDataState = (data: ProjectData, callback?: (data: ProjectData) => void) => {
      callbackRef.current = callback
      setDataState(data)
    }
  }

  get data() { return Project.dataState }
  setData: (transaction: (data: ProjectData) => void, callback?: (data: ProjectData) => void) => void

  get isRunning() {
    return this.data.workspace.runningInstanceId !== null
  }

  static fromTemplate(id: keyof typeof STARTER_PROJECTS) {
    return new Project(STARTER_PROJECTS[id])
  }

  constructor(data: ProjectData) {
    Project.setDataState(data)

    this.setData = (transaction: (data: ProjectData) => void, callback?: (data: ProjectData) => void) => {
      const newData = JSON.parse(JSON.stringify(this.data))
      transaction(newData)

      Project.setDataState(newData, callback)
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
  async run(canvas?: HTMLCanvasElement | null) {
    if (!canvas) return
    if (this.isRunning) await this.stop(canvas)
    
    const instanceId = Math.random().toString(36).substring(7)

    await new Promise(resolve =>
      this.setData(
        data => { data.workspace.runningInstanceId = instanceId },
        resolve
      )
    )

    SproutEngine.run(this.data, () => this.data.workspace.runningInstanceId === instanceId, canvas)
  }

  async stop(canvas?: HTMLCanvasElement | null) {
    if (!canvas || !this.isRunning) return

    await new Promise(resolve => 
      this.setData(
        data => { data.workspace.runningInstanceId = null },
        resolve
      )
    )

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
  runningInstanceId: string | null

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