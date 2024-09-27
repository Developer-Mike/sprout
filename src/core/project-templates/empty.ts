import { DEFAULT_GAME_OBJECT_SPRITES, DEFAULT_STAGE_SIZE } from "@/constants"
import { ProjectData } from "@/types/ProjectData"

const project: ProjectData = {
  title: "New Project",
  workspace: {
    selectedGameObjectKey: "be3f9532-5c1c-4a54-b97e-667e8a19bd91",
    selectedLibrarySpriteKey: null
  },
  sprites: DEFAULT_GAME_OBJECT_SPRITES,
  stage: DEFAULT_STAGE_SIZE,
  gameObjects: {
    "be3f9532-5c1c-4a54-b97e-667e8a19bd91": {
      id: "player",
      visible: true,
      layer: 0,
      active_sprite: 0,
      sprites: [
        "player"
      ],
      transform: {
        x: 960,
        y: 540,
        rotation: 0,
        width: 1,
        height: 1
      },
      code: ""
    }
  }
}

export default project