import { ProjectData } from "@/types/ProjectData"

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
  debug: {
    choosable: false,
    data: require("@/core/project-templates/debug").default
  },
  pong: { // TODO: Polish this template
    choosable: true,
    thumbnail: "data:image/png;base64,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",
    description: "A simple pong game",
    data: require("@/core/project-templates/pong").default
  },
}

export default PROJECT_TEMPLATES