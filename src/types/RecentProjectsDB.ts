import { DBSchema } from "idb"

export interface RecentProjectsDB extends DBSchema {
  projects: {
    key: string
    value: {
      id: string
      title: string
      thumbnail: string
      lastEdited: number
      fileHandle: FileSystemFileHandle
    }
    indexes: { lastEdited: number }
  }
}
