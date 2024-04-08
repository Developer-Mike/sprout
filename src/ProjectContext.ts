import { createContext } from "react"
import Project, { ProjectData } from "./core/Project"

export const ProjectContext = createContext<{
  project: Project
  setProjectData: (transaction: (data: ProjectData) => void) => void
}>(null as any)