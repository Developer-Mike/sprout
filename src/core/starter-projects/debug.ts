import { ProjectData } from "../Project"

const project = {
  title: "Starter Project",
  workspace: {
    documentationLeafVisible: true
  },
  stage: {
    width: 1920,
    height: 1080
  },
  gameObjects: [
    {
      id: "square1",
      x: 660,
      y: 540,
      rotation: 0,
      width: 250,
      height: 250,
      code: `
        while (true) {
          that.rotation += 1;

          await tick();
        }
      `
    },
    {
      id: "square2",
      x: 1260,
      y: 540,
      rotation: 0,
      width: 250,
      height: 250,
      code: `
        while (true) {
          that.rotation -= 1;

          await tick();
        }
      `
    }
  ]
} as ProjectData

export default project