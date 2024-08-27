import { RecentProjectsDB } from "@/types/RecentProjectsDB"
import { IDBPDatabase, openDB, StoreValue } from "idb"
import FSHelper from "./fs-helper"

const EMPTY_THUMBNAIL = "/empty-thumbnail.svg"

export default class DBHelper {
  static RECENT_PROJECTS_DB_NAME = "recent-projects"
  static RECENT_PROJECTS_DB_VERSION = 1

  static async openRecentProjectsDB(): Promise<IDBPDatabase<RecentProjectsDB>> {
    return await openDB<RecentProjectsDB>(this.RECENT_PROJECTS_DB_NAME, this.RECENT_PROJECTS_DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("projects")) {
          const store = db.createObjectStore("projects", {
            keyPath: "id"
          })
          
          // Create an index on the lastEdited property
          store.createIndex("lastEdited", "lastEdited")
        }
      }
    })
  }

  // Get all recent projects sorted by lastEdited
  static async getRecentProjects(): Promise<StoreValue<RecentProjectsDB, "projects">[]> {
    const db = await this.openRecentProjectsDB()
    const projects = await db.getAllFromIndex("projects", "lastEdited")
    return projects.reverse()
  }

  static async getHandlerForRecentProject(id: string): Promise<FileSystemFileHandle | null> {
    const db = await this.openRecentProjectsDB()
    const project = await db.get("projects", id)

    return project?.fileHandle ?? null
  }

  // Update project's title, thumbnail and lastEdited
  static async updateRecentProject(id: string, title: string, thumbnail: string | null) {
    const db = await this.openRecentProjectsDB()
    const project = await db.get("projects", id)

    if (project) {
      project.title = title
      if (thumbnail) project.thumbnail = thumbnail
      project.lastEdited = Date.now()
      db.put("projects", project)
    }
  }
  
  static async addToRecentFromFS(): Promise<string | null> {
    const fileHandle = await FSHelper.openFile(window, [FSHelper.SPROUT_PROJECT_TYPE])
    if (!fileHandle) return null

    const file = await fileHandle.getFile()
    const data = JSON.parse(await file.text())

    return DBHelper.addRecentProject(data.title, fileHandle)
  }

  static async addRecentProject(title: string, fileHandle: FileSystemFileHandle): Promise<string> {
    const id = crypto.randomUUID()

    const db = await this.openRecentProjectsDB()
    await db.put("projects", { 
      id, 
      title, 
      thumbnail: EMPTY_THUMBNAIL, 
      lastEdited: Date.now(), 
      fileHandle 
    })

    return id
  }

  static async removeRecentProject(id: string) {
    const db = await this.openRecentProjectsDB()
    db.delete("projects", id)
  }
}