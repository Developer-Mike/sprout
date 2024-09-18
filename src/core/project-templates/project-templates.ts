import { ProjectData } from "@/types/ProjectData"
import { thumbnail as pongThumbnail } from "./pong"

interface ProjectTemplate {
  choosable: boolean
  thumbnail?: string
  description?: string
  data: ProjectData
}

const PROJECT_TEMPLATES: { [key: string]: ProjectTemplate } = {
  empty: {
    choosable: false,
    data: require("@/core/project-templates/empty").default
  },
  pong: {
    choosable: true,
    thumbnail: pongThumbnail,
    description: "A simple pong game",
    data: require("@/core/project-templates/pong").default
  },
}

export default PROJECT_TEMPLATES