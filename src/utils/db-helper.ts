import { RecentProjectsDB } from "@/types/RecentProjectsDB"
import { IDBPDatabase, openDB, StoreValue } from "idb"

const EMPTY_THUMBNAIL = "/empty-thumbnail.svg"

export default class DBHelper {
  static RECENT_PROJECTS_DB_NAME = "recent-projects"
  static RECENT_PROJECTS_DB_VERSION = 1

  static async openRecentProjectsDB(): Promise<IDBPDatabase<RecentProjectsDB>> {
    return await openDB<RecentProjectsDB>(this.RECENT_PROJECTS_DB_NAME, this.RECENT_PROJECTS_DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("projects")) {
          const store = db.createObjectStore("projects", {
            keyPath: "path"
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

  static async getHandlerForRecentProject(path: string): Promise<FileSystemFileHandle | null> {
    const db = await this.openRecentProjectsDB()
    const project = await db.get("projects", path)

    return project?.fileHandle ?? null
  }

  // Update project's title, thumbnail and lastEdited
  static async updateRecentProject(path: string, title: string, thumbnail: string | null) {
    const db = await this.openRecentProjectsDB()
    const project = await db.get("projects", path)

    if (project) {
      project.title = title
      if (thumbnail) project.thumbnail = thumbnail
      project.lastEdited = Date.now()
      db.put("projects", project)
    }
  }

  static async addRecentProject(path: string, title: string, fileHandle: FileSystemFileHandle) {
    const db = await this.openRecentProjectsDB()
    db.put("projects", { 
      path, 
      title, 
      thumbnail: EMPTY_THUMBNAIL, 
      lastEdited: Date.now(), 
      fileHandle 
    })
  }

  static async removeRecentProject(path: string) {
    const db = await this.openRecentProjectsDB()
    db.delete("projects", path)
  }
}