import { createContext } from "react"
import Project, { ProjectData } from "./core/Project"

export const ProjectContext = createContext<{
  project: Project
}>(null as any)