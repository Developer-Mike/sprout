import { useEffect, useRef, useState } from "react"
import { GameObjectData, ProjectData } from "../types/ProjectData"
import FSHelper, { ExtendedFileHandle } from "@/utils/fs-helper"
import DBHelper from "@/utils/db-helper"
import PROJECT_TEMPLATES from "./project-templates/project-templates"
import TransactionInfo, { TransactionCategory, TransactionType } from "@/types/TransactionInfo"
import EngineBuiltins from "./engine/engine-builtins"
import { RuntimeGameObjectData, RuntimeProjectData, RuntimeSpriteData } from "@/types/RuntimeProjectData"
import Compiler from "./compiler/compiler"
import EngineRunner from "./engine/engine-runner"
import { BLANK_IMAGE, MAX_CONSOLE_OUTPUT_LENGTH } from "@/constants"
import ProgramAST from "./compiler/ast/program-ast"
import LanguageBuiltins from "./compiler/language-builtins"
import { KEYWORDS_MAP, TokenType } from "./compiler/token"
import AutocompletionItem, { AutocompletionItemType, getGlobalAutocompletionSuggestions } from "./autocompletion-item"
import { Monaco } from "@monaco-editor/react"
import MemberExprAST from "./compiler/ast/expr/member-expr-ast"
import IdentifierExprAST from "./compiler/ast/expr/identifier-expr-ast"
import LogItem, { LogItemType } from "@/types/LogItem"
import { ExtendedConsole } from "@/types/ExtendedConsole"
import SpriteHelper from "@/utils/sprite-helper"
import utils from "util"
import CallExprAST from "./compiler/ast/expr/call-expr-ast"

export function useProjectHooks(): Record<string, any> {
  const hooks = {} as Record<string, any>

  // Loading state
  ;[hooks.isLoading, hooks.setIsLoading] = useState(true)

  // Saving state
  ;[hooks.isSaving, hooks.setIsSaving] = useState(false)

  // Unsaved changes state
  ;[hooks.unsavedChanges, hooks.setUnsavedChanges] = useState(false)

  // Project data state
  const [projectDataState, setProjectDataState] = useState<ProjectData>(null as any)
  const projectDataCallbackRef = useRef<(data: ProjectData) => void>()

  useEffect(() => {
    if (!projectDataCallbackRef.current) return
    projectDataCallbackRef.current(projectDataState)
  }, [projectDataState])

  hooks.data = projectDataState
  hooks.setData = (data: ProjectData) => new Promise(resolve => {
    projectDataCallbackRef.current = resolve
    setProjectDataState(data)
  })
  hooks.updateData = async (transaction: (data: ProjectData) => void) => {
    const newData: ProjectData = JSON.parse(JSON.stringify(hooks.data))
    transaction(newData)

    return hooks.setData(newData)
  }

  // Runtime data state
  const [compiledASTsState, setCompiledASTsState] = useState<Record<string, ProgramAST>>({})
  const compiledASTsCallbackRef = useRef<(data: Record<string, ProgramAST>) => void>()

  useEffect(() => {
    if (!compiledASTsCallbackRef.current) return
    compiledASTsCallbackRef.current(compiledASTsState)
  }, [compiledASTsState])

  hooks.compiledASTs = compiledASTsState
  hooks.setCompiledASTs = (data: Record<string, ProgramAST>) => new Promise(resolve => {
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

  hooks.runningInstanceId = runningInstanceIdState
  hooks.setRunningInstanceId = async (id: string | null) => new Promise(resolve => {
    runningInstanceIdCallbackRef.current = resolve
    setRunningInstanceIdState(id)
  })

  // Console output state
  hooks.consoleOutputUnreactive = []
  const [consoleOutputState, setConsoleOutputState] = useState<LogItem[]>([])
  hooks.consoleOutput = consoleOutputState

  hooks.clearConsoleOutput = () => {
    hooks.consoleOutputUnreactive = []
    setConsoleOutputState([...hooks.consoleOutputUnreactive])
  }
  hooks.addConsoleOutput = (gameObjectId: string | null, message: string, type: LogItemType = LogItemType.INFO) => {
    hooks.consoleOutputUnreactive.push({
      gameObjectId: gameObjectId,
      message: message,
      type: type
    })

    // Limit console output length
    if (hooks.consoleOutputUnreactive.length > MAX_CONSOLE_OUTPUT_LENGTH)
      hooks.consoleOutputUnreactive.shift()

    setConsoleOutputState([...hooks.consoleOutputUnreactive])
  }

  // Add runtimeLog to console object
  ;(console as ExtendedConsole).runtimeLog = (...params: any) => {
    if (Project.runningInstanceId === null) return

    const stringifiedParams = params.map((param: any) => 
      typeof param === "object" ? utils.inspect(param) : (
        param === null ? "null" : (
          param === undefined ? "undefined" : param.toString()
        )
      )
    )

    hooks.addConsoleOutput(null, stringifiedParams.join(" "))
    console.log(...params)
  }

  return hooks
}

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

  static consoleOutput: LogItem[] = []
  private static clearConsoleOutput: () => void
  private static addConsoleOutput: (gameObjectId: string | null, message: string, type?: LogItemType) => void
  
  static registerHooks(hooks: Record<string, any>) {
    this.isLoading = hooks.isLoading
    this.setIsLoading = hooks.setIsLoading

    this.isSaving = hooks.isSaving
    this.setIsSaving = hooks.setIsSaving

    this.unsavedChanges = hooks.unsavedChanges
    this.setUnsavedChanges = hooks.setUnsavedChanges

    this.data = hooks.data
    this.setData = hooks.setData
    this.updateData = hooks.updateData

    this.compiledASTs = hooks.compiledASTs
    this.setCompiledASTs = hooks.setCompiledASTs

    this.runningInstanceId = hooks.runningInstanceId
    this.setRunningInstanceId = hooks.setRunningInstanceId

    this.consoleOutput = hooks.consoleOutput
    this.clearConsoleOutput = hooks.clearConsoleOutput
    this.addConsoleOutput = hooks.addConsoleOutput
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
  private clearConsoleOutput = Project.clearConsoleOutput
  private addConsoleOutput = Project.addConsoleOutput
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

    // Reset console output
    this.clearConsoleOutput()

    // Set data and save history
    const promise = Project.setData(data)

    // Save history after data is set
    promise.then(() => this.history = [{
      transactionInfo: new TransactionInfo(TransactionType.Add, TransactionCategory.ProjectSettings, null, "initialization"),
      data: JSON.parse(JSON.stringify(data))
    }])

    promise.then(() => {
      this.compileAST() // Compile ASTs
      Project.setIsLoading(false) // Set loading state to false after data is set
    })
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
  private engineBuiltins = new EngineBuiltins(this.builtins, document.createElement("canvas"))
  getAutocompletionProvider(monaco: Monaco) {
    const keywordSuggestions = Object.keys(KEYWORDS_MAP).reduce((acc, keyword) => ({
      ...acc,
      [keyword]: {
        value: keyword,
        type: AutocompletionItemType.KEYWORD,
        children: {}
      }
    }), {} as Record<string, AutocompletionItem>)

    return {
      provideCompletionItems: (model: any, position: any, _context: any, _token: any): any => {
        // Runtime data suggestions
        let suggestions = getGlobalAutocompletionSuggestions(this.data)

        // Add keyword suggestions
        for (const keyword in keywordSuggestions)
          suggestions[keyword] = keywordSuggestions[keyword]

        // Add game_objects global declarations suggestions
        for (const gameObjectKey in this.compiledASTs) {
          const gameObjectId = this.data.gameObjects[gameObjectKey]?.id
          const globalDeclarations = this.compiledASTs[gameObjectKey]?.getGlobalDeclarations() ?? {}

          suggestions.game_objects.children[gameObjectId].children = {
            ...suggestions.game_objects.children[gameObjectId].children ?? {},
            ...globalDeclarations
          }
        }

        // Add game_object suggestions
        suggestions["game_object"] = {
          type: AutocompletionItemType.CONSTANT,
          children: suggestions.game_objects?.children[this.selectedGameObject.id]?.children ?? {}
        }
    
        this.languageBuiltins.addAutocompletionItems(suggestions)
        this.engineBuiltins.addAutocompletionItems(suggestions)

        for (const gameObject of Object.values(suggestions.game_objects.children))
          this.engineBuiltins.addGameObjectsAutocompletionItems(gameObject.children)

        // Filter suggestions based on previous members

        // Get previous members of the current line
        const offsetPosition = model.getOffsetAt({ lineNumber: position.lineNumber, column: position.column }) as number

        // Find last member expression
        let sourceLocationASTs = this.compiledASTs[this.selectedGameObjectKey]?.getASTsFromSourceLocation(offsetPosition)
        let memberAST: MemberExprAST | IdentifierExprAST | undefined  = sourceLocationASTs.findLast(ast => ast instanceof MemberExprAST) as MemberExprAST | undefined

        // If no member expression found, check if there is a member expression before a dot
        if (!memberAST) {
          let previousTokens = this.compiledASTs[this.selectedGameObjectKey]?.tokens.filter(token => token.location.end <= offsetPosition)
          if (previousTokens[previousTokens.length - 1].type === TokenType.EOF) previousTokens.pop() // Fix if EOF is directly after the cursor
          previousTokens = previousTokens.splice(-2) // Get last two tokens

          if (previousTokens.length === 2 && previousTokens[1].type === TokenType.PUNCTUATOR) {
            const previousASTs = this.compiledASTs[this.selectedGameObjectKey]?.getASTsFromSourceLocation(previousTokens[0].location.end)

            let lastMemberExprAST: MemberExprAST | IdentifierExprAST | undefined = previousASTs.findLast(ast => ast instanceof MemberExprAST) as MemberExprAST | undefined
            if (!lastMemberExprAST) lastMemberExprAST = previousASTs.findLast(ast => ast instanceof IdentifierExprAST) as IdentifierExprAST | undefined

            if (lastMemberExprAST) memberAST = new MemberExprAST(lastMemberExprAST, new IdentifierExprAST("", lastMemberExprAST.sourceLocation), false, lastMemberExprAST.sourceLocation)
          }
        }

        // Filter suggestions based on previous members
        if (memberAST) {
          const previousIdentifiers = []
          while (memberAST instanceof MemberExprAST) {
            previousIdentifiers.push(memberAST.property)
            memberAST = memberAST.object as MemberExprAST | IdentifierExprAST
          }
          previousIdentifiers.push(memberAST)
          previousIdentifiers.reverse()
          previousIdentifiers.pop() // Remove the last identifier (the place where the cursor is)

          for (const identifier of previousIdentifiers) {
            let identifierString = identifier.toJavaScript()
            const functionCall = identifier instanceof CallExprAST
            if (functionCall) identifierString = identifierString.substring(0, identifierString.indexOf("("))

            let objectSuggestions: AutocompletionItem | undefined = suggestions[identifierString]

            // If found suggestion for function child but it's not a function call, don't show suggestions
            if (objectSuggestions?.type === AutocompletionItemType.FUNCTION && !functionCall)
              objectSuggestions = undefined

            suggestions = {
              ...suggestions["*"]?.children ?? {}, // Add wildcard suggestions
              ...objectSuggestions?.children ?? {}
            }
          }
        }

        // Remove Wildcard suggestions (else a * would be shown in the autocompletion)
        delete suggestions["*"]

        return { suggestions: Object.entries(suggestions).map(([key, suggestion]) => ({
          label: key,
          insertText: key,
          kind: {
            [AutocompletionItemType.KEYWORD]: monaco.languages.CompletionItemKind.Keyword,
            [AutocompletionItemType.CONSTANT]: monaco.languages.CompletionItemKind.Constant,
            [AutocompletionItemType.VARIABLE]: monaco.languages.CompletionItemKind.Variable,
            [AutocompletionItemType.FUNCTION]: monaco.languages.CompletionItemKind.Function
          }[suggestion.type],
          detail: suggestion.description
        })) }
      }
    }
  }
  //#endregion

  //#region compiler and engine-runner integration
  render(canvas: HTMLCanvasElement) {
    this.engineBuiltins.render(this.data as any, canvas, true)
  }

  private compiler = new Compiler()
  async compileAST(gameObjectKey?: string) {
    if (gameObjectKey && !this.data.gameObjects[gameObjectKey]) return console.error("Game object not found")

    const gameObjectKeys = gameObjectKey ? [gameObjectKey] : Object.keys(this.data.gameObjects)
    const newASTs = { ...this.compiledASTs }

    for (const key of gameObjectKeys) {
      newASTs[key] = this.compiler.compile(this.data.gameObjects[key].code)
    }

    await this.setCompiledASTs(newASTs)
  }

  async run(canvas?: HTMLCanvasElement | null) {
    if (!canvas) return

    // Clear console
    this.clearConsoleOutput()

    // Create RuntimeProjectData
    let newRuntimeProjectData: RuntimeProjectData = {} as RuntimeProjectData

    // Copy stage data
    newRuntimeProjectData.stage = JSON.parse(JSON.stringify(this.data.stage))

    // Optimize sprites
    const spritesCopy = JSON.parse(JSON.stringify(this.data.sprites))
    for (const spriteKey in spritesCopy) {
      // Check if sprite is used in any game object
      if (!Object.values(this.data.gameObjects).some(gameObject => gameObject.sprites.includes(spriteKey))) {
        delete spritesCopy[spriteKey]
        continue
      }

      const sprite = spritesCopy[spriteKey] as RuntimeSpriteData
      sprite.collision_mask = await SpriteHelper.getCollisionMask(sprite.src)
    }
    newRuntimeProjectData.sprites = spritesCopy

    // Compile codes
    await this.compileAST()

    // Add game objects with id as key, compiled code and empty on listeners
    newRuntimeProjectData.gameObjects = Object.entries(this.data.gameObjects).reduce((acc, [gameObjectKey, gameObject]) => {      
      acc[gameObject.id] = {
        ...JSON.parse(JSON.stringify(gameObject)),
        is_clone: false,
        destroyed: false,
        code: this.compiledASTs[gameObjectKey],
        on: []
      }

      return acc
    }, {} as Record<string, RuntimeGameObjectData>)

    // Check if there are any compilation errors
    let hasCompilationErrors = false
    for (const [gameObjectKey, ast] of Object.entries(this.compiledASTs)) {
      for (const error of ast.errors) {
        this.addConsoleOutput(this.data.gameObjects[gameObjectKey]?.id, error.message, LogItemType.ERROR)
        hasCompilationErrors = true
      }
    }
    if (hasCompilationErrors) return

    // Stop running instance if running
    if (this.isRunning) await this.stop(canvas)
    
    // Set running instance id
    const instanceId = Math.random().toString(36).substring(7)
    await this.setRunningInstanceId(instanceId)

    // Execute code
    EngineRunner.run(newRuntimeProjectData, () => this.runningInstanceId !== instanceId, canvas, (gameObjectId, error) => {
      if (!error.message) return
      this.addConsoleOutput(gameObjectId, error.message, LogItemType.ERROR)
    })
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