import { useEffect, useRef, useState } from "react"
import SproutEngine from "./SproutEngine"
import { ProjectData } from "../types/ProjectData"

export const STARTER_PROJECTS = {
  empty: require("./starter-projects/empty").default,
  debug: require("./starter-projects/debug").default
}

export default class Project {
  //#region Static React States
  static data: ProjectData
  static setData: (data: ProjectData) => void
  static updateData: (transaction: (data: ProjectData) => void) => Promise<ProjectData>

  static runningInstanceId: string | null
  static setRunningInstanceId: (id: string | null) => Promise<string | null>
  
  static registerHooks() {
    [Project.data, Project.setData] = useState<ProjectData>(null as any)
    const projectDataCallbackRef = useRef<(data: ProjectData) => void>()

    useEffect(() => {
      if (!projectDataCallbackRef.current) return
      projectDataCallbackRef.current(Project.data)
    }, [Project.data])

    Project.updateData = async (transaction: (data: ProjectData) => void) => new Promise(resolve => {
      projectDataCallbackRef.current = resolve

      const newData = JSON.parse(JSON.stringify(this.data))
      transaction(newData)

      Project.setData(newData)
    })

    // Running instance
    const [runningInstanceIdState, setRunningInstanceIdState] = useState<string | null>(null)
    const runningInstanceIdCallbackRef = useRef<(id: string | null) => void>()

    useEffect(() => {
      if (!runningInstanceIdCallbackRef.current) return
      runningInstanceIdCallbackRef.current(runningInstanceIdState)
    }, [runningInstanceIdState])

    this.runningInstanceId = runningInstanceIdState
    this.setRunningInstanceId = async (id: string | null) => new Promise(resolve => {
      runningInstanceIdCallbackRef.current = resolve
      setRunningInstanceIdState(id)
    })
  }
  //#endregion

  //#region Easy access to static states
  get data() { return Project.data }
  updateData = async (transaction: (data: ProjectData) => void, saveHistory: boolean = true) => {
    await Project.updateData(transaction)
    if (saveHistory) this.saveHistory()
  }

  getGameObjectIndex(id: string) { return this.data.gameObjects.findIndex(gameObject => gameObject.id === id) }
  get activeGameObjectIndex() { return this.getGameObjectIndex(this.data.workspace.selectedGameObjectId) }
  get activeGameObject() {
    return this.data.gameObjects[this.activeGameObjectIndex]
      ?? this.data.gameObjects[0]
  }

  get runningInstanceId(): string | null { return Project.runningInstanceId }
  setRunningInstanceId = Project.setRunningInstanceId
  get isRunning() { return this.runningInstanceId !== null }
  //#endregion

  //#region Static factory methods
  static async loadFromFS(window: Window): Promise<Project | null> {
    const fileHandle = await this.selectFSLocation(window)
    if (!fileHandle) return null // User cancelled

    const file = await fileHandle.getFile()
    const data = JSON.parse(await file.text())

    return new Project(data, fileHandle)
  }

  static loadFromTemplate(id: keyof typeof STARTER_PROJECTS) {
    return new Project(STARTER_PROJECTS[id])
  }
  //#endregion

  constructor(data: ProjectData, fileHandler: FileSystemFileHandle | null = null) {
    // Create link to fs file and copy data
    this.fileHandler = fileHandler
    Project.setData(data)
  }

  //#region History methods
  readonly MAX_HISTORY_LENGTH = 50
  historyIndex = 0
  history: ProjectData[] = []

  async saveHistory() {
    if (this.historyIndex < this.history.length - 1) this.history = this.history.slice(0, this.historyIndex + 1)
    this.history.push(JSON.parse(JSON.stringify(this.data)))
    this.historyIndex = this.history.length - 1

    // Limit history size
    if (this.history.length > this.MAX_HISTORY_LENGTH) this.history.shift()

    // Autosave
    await this.saveToFS(false)

    console.log(this.history)
  }

  undo() {
    if (this.historyIndex === 0) return
    Project.setData(this.history[--this.historyIndex])
  }

  redo() {
    if (this.historyIndex === this.history.length - 1) return
    Project.setData(this.history[++this.historyIndex])
  }
  //#endregion

  //#region SproutEngine integration
  render(canvas: HTMLCanvasElement) { SproutEngine.render(this.data, canvas) }

  // TODO: Return errors
  async run(canvas?: HTMLCanvasElement | null) {
    if (!canvas) return
    if (this.isRunning) await this.stop(canvas)
    
    const instanceId = Math.random().toString(36).substring(7)
    await this.setRunningInstanceId(instanceId)

    SproutEngine.run(this.data, () => this.runningInstanceId === instanceId, canvas)
  }

  async stop(canvas?: HTMLCanvasElement | null) {
    if (!canvas || !this.isRunning) return

    await this.setRunningInstanceId(null)

    // Reset canvas
    this.render(canvas)
  }
  //#endregion

  //#region Save and export methods
  fileHandler: FileSystemFileHandle | null = null

  async saveToFS(force: boolean = true) {
    if (!this.fileHandler && force) this.fileHandler = await Project.selectFSLocation(window, false, this.data.title)
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
  //#endregion
}