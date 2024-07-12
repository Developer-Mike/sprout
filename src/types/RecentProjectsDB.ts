import { DBSchema } from "idb"

export interface RecentProjectsDB extends DBSchema {
  projects: {
    key: string
    value: {
      path: string
      title: string
      thumbnail: string
      fileHandle: FileSystemFileHandle
    }
  }
}
