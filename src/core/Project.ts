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

  fileHandler: FileSystemFileHandle | null = null

  get data() { return Project.dataState }
  setData: (transaction: (data: ProjectData) => void, callback?: (data: ProjectData) => void) => void

  get isRunning() {
    return this.data.workspace.runningInstanceId !== null
  }

  constructor(data: ProjectData, fileHandler: FileSystemFileHandle | null = null) {
    this.fileHandler = fileHandler
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

  static loadFromTemplate(id: keyof typeof STARTER_PROJECTS) {
    return new Project(STARTER_PROJECTS[id])
  }

  static async selectFSLocation(window: Window, open: Boolean = true, projectName?: string): Promise<FileSystemFileHandle | null> {
    const fileOptions = { 
      excludeAcceptAllOption: true, 
      suggestedName: projectName ? `${projectName}.sprout` : undefined,
      types: [{ description: "Sprout project", accept: { "application/sprout": [".sprout"] } }] 
    }

    try {
      const fileHandle = await (open ? (window as any).showOpenFilePicker(fileOptions) : (window as any).showSaveFilePicker(fileOptions))
      return open ? fileHandle[0] : fileHandle
    } catch (e: any) {
      if (e.name != "AbortError") console.error(e)
      return null
    }
  }

  static async loadFromFS(window: Window): Promise<Project | null> {
    const fileHandle = await this.selectFSLocation(window)
    if (!fileHandle) return null // User cancelled

    const file = await fileHandle.getFile()
    const data = JSON.parse(await file.text())

    return new Project(data, fileHandle)
  }

  async saveToFS() {
    if (!this.fileHandler) this.fileHandler = await Project.selectFSLocation(window, false, this.data.title)
    if (!this.fileHandler) return // User cancelled

    const writable = await this.fileHandler.createWritable()
    await writable.write(JSON.stringify(this.data))
    await writable.close()
  }

  exportAsHTML() {
    const html = SproutEngine.generateExportableHTMLCode(this.data)
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `${this.data.title}.html`
    a.click()
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