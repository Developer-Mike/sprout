import Project from "@/core/Project"

export type ExtendedWindow = typeof window & {
  project: Project | null
}