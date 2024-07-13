import { RecentProjectsDB } from "@/types/RecentProjectsDB"
import { IDBPDatabase, openDB, StoreValue } from "idb"

export default class DBHelper {
  static RECENT_PROJECTS_DB_NAME = "recent-projects"
  static RECENT_PROJECTS_DB_VERSION = 1

  static async openRecentProjectsDB(): Promise<IDBPDatabase<RecentProjectsDB>> {
    return await openDB<RecentProjectsDB>(this.RECENT_PROJECTS_DB_NAME, this.RECENT_PROJECTS_DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("projects")) {
          db.createObjectStore("projects", {
            keyPath: "path"
          })
        }
      }
    })
  }

  static async getRecentProjects(): Promise<StoreValue<RecentProjectsDB, "projects">[]> {
    const db = await this.openRecentProjectsDB()
    return db.getAll("projects")
  }

  static async getHandlerForRecentProject(path: string): Promise<FileSystemFileHandle | null> {
    const db = await this.openRecentProjectsDB()
    const project = await db.get("projects", path)

    return project?.fileHandle ?? null
  }

  static async addRecentProject(path: string, title: string, thumbnail: string, fileHandle: FileSystemFileHandle) {
    const db = await this.openRecentProjectsDB()
    db.put("projects", { path, title, thumbnail, fileHandle })
  }

  static async removeRecentProject(path: string) {
    const db = await this.openRecentProjectsDB()
    db.delete("projects", path)
  }
}