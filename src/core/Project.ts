import SproutEngine from "./SproutEngine"

export const STARTER_PROJECTS = {
  debug: require("./starter-projects/debug").default
}

export default class Project {
  data: ProjectData
  
  private setRunningState: (isRunning: boolean) => void
  private _isRunning: boolean = false
  get isRunning() { return this._isRunning }
  set isRunning(value: boolean) {
    this._isRunning = value
    this.setRunningState(value)
  }

  constructor(data: ProjectData, setIsRunningState: (isRunning: boolean) => void) {
    this.data = data
    this.setRunningState = setIsRunningState
  }

  render(canvas: HTMLCanvasElement) {
    SproutEngine.render(this.data, canvas)
  }

  // TODO: Return errors
  async run(canvas: HTMLCanvasElement) {
    this.isRunning = true
    
    SproutEngine.run(this.data, () => this.isRunning, canvas)
  }

  stop(canvas: HTMLCanvasElement) {
    this.isRunning = false

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
  stage: StageData
  gameObjects: GameObjectData[]

  advanced?: boolean
}

export interface WorkspaceData {
  documentationLeafVisible: boolean
  // leafsFlex: number[]
}

export interface StageData {
  width: number
  height: number
}

export interface GameObjectData {
  id: string

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