import { useEffect, useRef, useState } from "react"
import { GameObjectData, ProjectData } from "../types/ProjectData"
import FSHelper, { ExtendedFileHandle } from "@/utils/fs-helper"
import DBHelper from "@/utils/db-helper"
import PROJECT_TEMPLATES from "./project-templates/project-templates"
import TransactionInfo, { TransactionCategory, TransactionType } from "@/types/TransactionInfo"
import EngineBuiltins from "./engine/engine-builtins"
import { RuntimeGameObjectData, RuntimeProjectData } from "@/types/RuntimeProjectData"
import Compiler from "./compiler/compiler"
import EngineRunner from "./engine/engine-runner"
import { BLANK_IMAGE } from "@/constants"
import ProgramAST from "./compiler/ast/program-ast"
import LanguageBuiltins from "./compiler/language-builtins"
import { KEYWORDS_MAP } from "./compiler/token"
import AutocompletionItem, { AutocompletionItemKind } from "./autocompletion-item"
import { Monaco } from "@monaco-editor/react"

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

  static compiledASTs: Record<string, ProgramAST>
  private static setCompiledASTs: (value: Record<string, ProgramAST>) => Promise<Record<string, ProgramAST>>

  static runningInstanceId: string | null
  private static setRunningInstanceId: (id: string | null) => Promise<string | null>

  static consoleOutput: string[]
  private static setConsoleOutput: (value: string[]) => void
  
  static registerHooks() {
    // Loading state
    ;[this.isLoading, this.setIsLoading] = useState(true)

    // Saving state
    ;[this.isSaving, this.setIsSaving] = useState(false)

    // Unsaved changes state
    ;[this.unsavedChanges, this.setUnsavedChanges] = useState(false)

    // Project data state
    const [projectDataState, setProjectDataState] = useState<ProjectData>(null as any)
    const projectDataCallbackRef = useRef<(data: ProjectData) => void>()

    useEffect(() => {
      if (!projectDataCallbackRef.current) return
      projectDataCallbackRef.current(projectDataState)
    }, [projectDataState])

    this.data = projectDataState
    this.setData = (data: ProjectData) => new Promise(resolve => {
      projectDataCallbackRef.current = resolve
      setProjectDataState(data)
    })
    this.updateData = async (transaction: (data: ProjectData) => void) => {
      const newData: ProjectData = JSON.parse(JSON.stringify(this.data))
      transaction(newData)

      return Project.setData(newData)
    }

    // Runtime data state
    const [compiledASTsState, setCompiledASTsState] = useState<Record<string, ProgramAST>>({})
    const compiledASTsCallbackRef = useRef<(data: Record<string, ProgramAST>) => void>()

    useEffect(() => {
      if (!compiledASTsCallbackRef.current) return
      compiledASTsCallbackRef.current(compiledASTsState)
    }, [compiledASTsState])

    this.compiledASTs = compiledASTsState
    this.setCompiledASTs = (data: Record<string, ProgramAST>) => new Promise(resolve => {
      compiledASTsCallbackRef.current = resolve
      setCompiledASTsState(data)
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

    // Console output state
    ;[this.consoleOutput, this.setConsoleOutput] = useState<string[]>([])
  }

  static registerWindowCallbacks(window: Window) {
    // Console output state
    window.onerror = (message, _source, _lineno, _colno, _error) => {
      if (Project.runningInstanceId !== null) Project.setConsoleOutput([...Project.consoleOutput, message.toString()])
    }

    const oldConsoleLog = (window as any).console.log
    ;(window as any).console.log = (message: string) => {
      if (Project.runningInstanceId !== null) Project.setConsoleOutput([...Project.consoleOutput, message.toString()])
      oldConsoleLog(message)
    }
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

  get compiledASTs() { return Project.compiledASTs }
  private setCompiledASTs = Project.setCompiledASTs

  get runningInstanceId(): string | null { return Project.runningInstanceId }
  private setRunningInstanceId = Project.setRunningInstanceId
  get isRunning() { return this.runningInstanceId !== null }

  get consoleOutput() { return Project.consoleOutput }
  private setConsoleOutput = Project.setConsoleOutput
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

  getActiveSprite(gameObject: GameObjectData) {
    return this.data.sprites[gameObject.sprites[gameObject.active_sprite]] ?? {
      src: BLANK_IMAGE,
      width: 1,
      height: 1
    }
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

  //#region Autocompletion provider
  private builtins = {}
  private languageBuiltins = new LanguageBuiltins(this.builtins)
  private engineBuiltins = new EngineBuiltins(this.builtins)
  getAutocompletionProvider(monaco: Monaco) {
    const suggestions: AutocompletionItem[] = []

    // Add keywords
    for (const keyword of Object.keys(KEYWORDS_MAP)) {
      suggestions.push({
        label: keyword,
        kind: AutocompletionItemKind.Keyword,
        insertText: keyword
      })
    }

    return {
      provideCompletionItems: (_model: any, position: any, _context: any, _token: any): any => {
        // TODO: Filter suggestions based on position
        const specificSuggestions = suggestions.map(suggestion => ({
          ...suggestion,
          kind: (() => {
            switch (suggestion.kind) {
              case AutocompletionItemKind.Keyword: return monaco.languages.CompletionItemKind.Keyword
              case AutocompletionItemKind.Identifier: return monaco.languages.CompletionItemKind.Variable
              case AutocompletionItemKind.Function: return monaco.languages.CompletionItemKind.Function
            }
          })()
        }))

        return { suggestions: specificSuggestions }
      }
    }
  }
  //#endregion

  //#region compiler and engine-runner integration
  render(canvas: HTMLCanvasElement) {
    this.engineBuiltins.render(this.data as any, canvas)
  }

  private compiler = new Compiler()
  async compileAST(gameObjectKey?: string) {
    if (gameObjectKey && !this.data.gameObjects[gameObjectKey]) return console.error("Game object not found")

    const gameObjectKeys = gameObjectKey ? [gameObjectKey] : Object.keys(this.data.gameObjects)
    const newASTs = {} as Record<string, ProgramAST>

    for (const key of gameObjectKeys) {
      newASTs[key] = this.compiler.compile(this.data.gameObjects[key].code)
    }

    await this.setCompiledASTs(newASTs)
  }

  async run(canvas?: HTMLCanvasElement | null) {
    if (!canvas) return
    if (this.isRunning) await this.stop(canvas)
    
    // Set running instance id
    const instanceId = Math.random().toString(36).substring(7)
    await this.setRunningInstanceId(instanceId)

    // Clear console
    this.setConsoleOutput([])

    // Create RuntimeProjectData
    let newRuntimeProjectData: RuntimeProjectData = {} as RuntimeProjectData

    // Copy stage data
    newRuntimeProjectData.stage = JSON.parse(JSON.stringify(this.data.stage))

    // Optimize sprites
    newRuntimeProjectData.sprites = JSON.parse(JSON.stringify(Object.fromEntries(
      Object.entries(this.data.sprites)
        .filter(([key, _value]) => Object.values(this.data.gameObjects).some(gameObject => gameObject.sprites.includes(key)))
    )))

    // Compile codes
    await this.compileAST()

    // Add game objects with id as key and compiled code
    newRuntimeProjectData.gameObjects = Object.entries(this.data.gameObjects).reduce((acc, [gameObjectKey, gameObject]) => {      
      acc[gameObject.id] = {
        ...JSON.parse(JSON.stringify(gameObject)),
        code: this.compiledASTs[gameObjectKey]
      }

      return acc
    }, {} as Record<string, RuntimeGameObjectData>)

    // Execute code
    EngineRunner.run(newRuntimeProjectData, () => this.runningInstanceId !== instanceId, canvas)
  }

  async stop(canvas?: HTMLCanvasElement | null) {
    if (!canvas || !this.isRunning) return

    await this.setRunningInstanceId(null)

    await new Promise(resolve => setTimeout(resolve, 100))

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
  //#endregion
}