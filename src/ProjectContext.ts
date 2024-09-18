import { createContext } from "react"
import Project from "./core/Project"

export const ProjectContext = createContext<{
  project: Project
}>(null as any)