import { ProjectData } from "@/types/ProjectData"

const project: ProjectData = {
  title: "New Project",
  workspace: {
    selectedGameObjectId: "player",
    selectedLibrarySpriteId: null
  },
  sprites: {
    "player": "data:image/png;base64,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",
  },
  stage: {
    width: 1920,
    height: 1080
  },
  gameObjects: [
    {
      id: "player",
      visible: true,
      x: 960,
      y: 540,
      layer: 0,
      rotation: 0,
      width: 200,
      height: 274,
      sprites: [
        "player"
      ],
      activeSprite: 0,
      code: ""
    }
  ]
}

export default project