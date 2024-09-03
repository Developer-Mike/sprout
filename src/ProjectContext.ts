import { createContext } from "react"
import Project from "./core/Project"

export const ProjectContext = createContext<{
  project: Project
  debugInfo: { [key: string]: any }
  setDebugInfo: (key: string, value: any) => void
}>(null as any)