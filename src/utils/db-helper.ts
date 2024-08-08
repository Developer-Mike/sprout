import { RecentProjectsDB } from "@/types/RecentProjectsDB"
import { IDBPDatabase, openDB, StoreValue } from "idb"

// /public/empty-thumbnail.svg
const EMPTY_THUMBNAIL = "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjE5MjAiIGhlaWdodD0iMTA4MCIgdmlld0JveD0iMCAwIDE5MiAxMDgiPgogICAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzE5MWYxOSIvPgogICAgPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYjRkOGJiIiBzdHJva2Utd2lkdGg9IjVweCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHlsZT0idHJhbnNmb3JtLW9yaWdpbjogY2VudGVyOyB0cmFuc2Zvcm06IHNjYWxlKDEpIHRyYW5zbGF0ZSg0NnB4LCA0cHgpOyIKICAgICAgICBkPSJNIDUwIDc5IEwgNTAgNjEgQyA1MCA0MiA0MSAzNyAyMCAzNyBDIDIwIDUyIDI5IDU4IDQ5IDU4IE0gNTYgNTIgQyA2NyA1MSA3NiA0MiA3NiAyOCBDIDYwIDI4IDU0IDMzIDUwIDM5IiAvPgo8L3N2Zz4="

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
  static async updateRecentProject(title: string, thumbnail: string | null) {
    const db = await this.openRecentProjectsDB()
    const project = await db.get("projects", title)

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