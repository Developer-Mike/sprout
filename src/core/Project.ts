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
    let renderFunctionCode = SproutEngine.generateRenderFunctionCode()
    renderFunctionCode += `render(this.data, canvas)`

    eval(renderFunctionCode)
  }

  // TODO: Return errors
  async run(canvas: HTMLCanvasElement) {
    this.isRunning = true
    
    const code = SproutEngine.generateRunnableCode(this.data)
    eval(code)
  }

  stop(canvas: HTMLCanvasElement) {
    this.isRunning = false

    // Reset canvas
    this.render(canvas)
  }
}

export interface ProjectData {
  title: string
  workspace: WorkspaceData
  stage: StageData
  gameObjects: GameObjectData[]
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