import { useEffect, useRef, useState } from "react"
import SproutEngine from "./SproutEngine"
import { GameObjectData, ProjectData } from "../types/ProjectData"
import FSHelper, { ExtendedFileHandle } from "@/utils/fs-helper"
import DBHelper from "@/utils/db-helper"
import PROJECT_TEMPLATES from "./project-templates/project-templates"
import TransactionInfo, { TransactionCategory, TransactionType } from "@/types/TransactionInfo"

export default class Project {
  //#region Static React States
  static isLoading: boolean
  private static setIsLoading: (value: boolean) => void

  static isSaving: boolean
  private static setIsSaving: (value: boolean) => void

  static unsavedChanges: boolean
  private static setUnsavedChanges: (value: boolean) => void

  static data: ProjectData
  private static setData: (data: ProjectData) => Promise<ProjectData>
  static updateData: (transaction: (data: ProjectData) => void) => Promise<ProjectData>

  static runningInstanceId: string | null
  private static setRunningInstanceId: (id: string | null) => Promise<string | null>
  
  static registerHooks() {
    // Loading state
    ;[this.isLoading, this.setIsLoading] = useState(true)

    // Saving state
    ;[this.isSaving, this.setIsSaving] = useState(false)

    // Unsaved changes state
    ;[this.unsavedChanges, this.setUnsavedChanges] = useState(false)

    // Data state
    const [dataState, setDataState] = useState<ProjectData>(null as any)
    const projectDataCallbackRef = useRef<(data: ProjectData) => void>()

    useEffect(() => {
      if (!projectDataCallbackRef.current) return
      projectDataCallbackRef.current(dataState)
    }, [dataState])

    this.data = dataState
    this.setData = (data: ProjectData) => new Promise(resolve => {
      projectDataCallbackRef.current = resolve
      setDataState(data)
    })
    this.updateData = async (transaction: (data: ProjectData) => void) => {
      const newData: ProjectData = JSON.parse(JSON.stringify(this.data))
      transaction(newData)

      return Project.setData(newData)
    }

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
  get isLoading() { return Project.isLoading }
  private setIsLoading = Project.setIsLoading

  get isSaving() { return Project.isSaving }
  private setIsSaving = Project.setIsSaving

  get unsavedChanges() { return Project.unsavedChanges }
  setUnsavedChanges = Project.setUnsavedChanges

  get data() { return Project.data }
  updateData = async (transactionInfo: TransactionInfo | null, transaction: (data: ProjectData) => void) => {
    // Update data
    await Project.updateData(transaction)
    this.setUnsavedChanges(true)

    // Add to history
    if (!transactionInfo) return
    this.addToHistory(transactionInfo)
  }

  get selectedGameObjectKey(): string { 
    return this.data.workspace.selectedGameObjectKey 
  }
  get selectedGameObject(): GameObjectData {
    return this.data.gameObjects[this.selectedGameObjectKey]
  }

  get runningInstanceId(): string | null { return Project.runningInstanceId }
  private setRunningInstanceId = Project.setRunningInstanceId
  get isRunning() { return this.runningInstanceId !== null }
  //#endregion

  //#region Static factory methods
  static async refreshPermissionOfRecentProject(id: string): Promise<Boolean> {
    const fileHandle = await DBHelper.getHandlerForRecentProject(id)
    if (!fileHandle) return false
    
    const permissionStatus = await (fileHandle as ExtendedFileHandle).requestPermission({ mode: "readwrite" })
    return permissionStatus === "granted"
  }

  static async loadFromRecent(projectId: string): Promise<Project | null> {
    const fileHandle = await DBHelper.getHandlerForRecentProject(projectId)
    if (!fileHandle) return null

    let data: ProjectData
    try {
      const file = await fileHandle.getFile()
      data = JSON.parse(await file.text())
    } catch (e: any) {
      if (e.name !== "NotAllowedError") console.error(e)
      return null
    }

    return new Project(data, projectId, fileHandle)
  }

  static loadFromTemplate(id: keyof typeof PROJECT_TEMPLATES): Project | null {
    const template = PROJECT_TEMPLATES[id]
    if (!template) return null

    return new Project(template.data)
  }
  //#endregion

  constructor(data: ProjectData, projectId: string | null = null, fileHandler: FileSystemFileHandle | null = null) {
    // Create link to fs file and copy data
    this.projectId = projectId
    this.fileHandler = fileHandler
    this.setUnsavedChanges(!this.fileHandler)

    // Set loading and saving states
    this.setIsLoading(true)
    this.setIsSaving(false)

    // Set data and save history
    const promise = Project.setData(data)

    // Save history after data is set
    promise.then(() => this.history = [{
      transactionInfo: new TransactionInfo(TransactionType.Add, TransactionCategory.ProjectSettings, null, "initialization"),
      data: JSON.parse(JSON.stringify(data))
    }])

    // Set loading state to false after data is set
    promise.finally(() => Project.setIsLoading(false))
  }

  getNewGameObjectKey() {
    let key: string | null = null

    while (!key || key in this.data.gameObjects) {
      key = crypto.randomUUID()
    }

    return key
  }

  //#region History methods
  readonly MAX_HISTORY_LENGTH = 100
  historyIndex = 0
  history: { transactionInfo: TransactionInfo, data: ProjectData }[] = []

  async addToHistory(transactionInfo: TransactionInfo) {
    const lastTransaction = this.history[this.historyIndex]

    // Only combine if not in the middle of history -> Would lead to weird combining
    if (this.historyIndex === this.history.length - 1 && lastTransaction?.transactionInfo.canBeCombined(transactionInfo)) {
      lastTransaction.data = JSON.parse(JSON.stringify(this.data))
      return
    }

    // Pop all transactions after historyIndex (rewriting the future)
    if (this.historyIndex < this.history.length - 1) this.history = this.history.slice(0, this.historyIndex + 1)
    
    // Add new transaction
    this.history.push({
      transactionInfo,
      data: JSON.parse(JSON.stringify(this.data))
    })

    // Limit history size
    if (this.history.length > this.MAX_HISTORY_LENGTH) this.history.shift()

    // Update history index
    this.historyIndex = this.history.length - 1
  }

  // Don't change data of the CodeEditor (It has its own undo/redo system)
  private transferCodeValues(data: ProjectData) {
    const newData = data

    for (const key of Object.keys(newData.gameObjects)) {
      const oldCode = this.data.gameObjects[key]?.code
      if (!oldCode) continue

      newData.gameObjects[key].code = oldCode
    }

    return newData
  }

  undo() {
    if (this.historyIndex === 0) return
    this.historyIndex--

    let newData = this.history[this.historyIndex].data
    newData = this.transferCodeValues(newData)

    Project.setData(newData)
  }

  redo() {
    if (this.historyIndex === this.history.length - 1) return
    this.historyIndex++

    let newData = this.history[this.historyIndex].data
    newData = this.transferCodeValues(newData)

    Project.setData(newData)
  }
  //#endregion

  //#region SproutEngine integration
  render(canvas: HTMLCanvasElement) { SproutEngine.render(this.data, canvas) }

  // TODO: Return errors
  async run(canvas?: HTMLCanvasElement | null, setDebugInfo?: (key: string, value: any) => void) {
    if (!canvas) return
    if (this.isRunning) await this.stop(canvas)
    
    const instanceId = Math.random().toString(36).substring(7)
    await this.setRunningInstanceId(instanceId)
    
    SproutEngine.run(this.data, () => this.runningInstanceId !== instanceId, canvas, setDebugInfo)
  }

  async stop(canvas?: HTMLCanvasElement | null) {
    if (!canvas || !this.isRunning) return

    await this.setRunningInstanceId(null)

    // Reset canvas
    this.render(canvas)
  }
  //#endregion

  //#region Save and export methods
  projectId: string | null = null
  fileHandler: FileSystemFileHandle | null = null

  createAutosaveInterval(canvasRef: React.MutableRefObject<HTMLCanvasElement | null>) {
    const interval = setInterval(async () => {
      if (!this.unsavedChanges) return

      await Promise.all([
        this.saveToFS(canvasRef.current, true)
      ])
    }, 1000 * 10) // 10 seconds

    return () => clearInterval(interval)
  }

  async saveToFS(canvas: HTMLCanvasElement | null, isAutosave: boolean = false) {
    // If fileHandler is null and this is not an autosave, prompt user to save
    if (!this.fileHandler && !isAutosave) {
      this.fileHandler = await FSHelper.saveFile(window, this.data.title, [FSHelper.SPROUT_PROJECT_TYPE])

      if (!this.fileHandler) return
      DBHelper.addRecentProject(this.data.title, this.fileHandler).then(id => this.projectId = id)
    } else if (this.fileHandler) {
      // Update recent project entry
      if (!this.projectId) return
      DBHelper.updateRecentProject(this.projectId, this.data.title, canvas?.toDataURL() ?? null)
    }

    // If autosave and no fileHandler, don't save
    if (!this.fileHandler) return

    // fileHandler is now guaranteed to be non-null
    this.setIsSaving(true)

    // Write data to fs
    const writable = await this.fileHandler.createWritable()
    await writable.write(JSON.stringify(this.data))
    await writable.close()

    this.setUnsavedChanges(false)
    this.setIsSaving(false)
  }

  exportAsHTML() {
    const html = "" //TODO: SproutEngine.generateExportableHTMLCode(this.data)
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `${this.data.title}.html`
    a.click()
  }
  //#endregion
}