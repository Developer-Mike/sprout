import { ProjectData } from "./Project";

export default class SproutEngine {
  static generateRenderFunctionCode(): string {
    return `
      const render = (data, canvas) => {
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.resetTransform()
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        data.gameObjects.forEach(gameObject => {
          // Set matrix
          ctx.resetTransform()
          ctx.scale(canvas.width / data.stage.width, canvas.height / data.stage.height)
          ctx.translate(gameObject.x, gameObject.y)
          ctx.rotate(gameObject.rotation * Math.PI / 180)

          ctx.fillRect(-gameObject.width / 2, -gameObject.height / 2, gameObject.width, gameObject.height)
        })
      }
    `
  }

  static generateRunnableCode(data: ProjectData): string {
    let code = ""
    
    // Add helper functions
    code += `
      const getIsRunning = () => {
        return this.isRunning ?? true;
      }

      const frame = () => {
        return new Promise((resolve, reject) => {
          requestAnimationFrame(() => (
            getIsRunning() ? resolve() : reject("Game stopped")
          ));
        });
      }

      const sleep = (ms) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => (
            getIsRunning() ? resolve() : reject("Game stopped")
          ), ms);
        });
      }

      const tick = async () => {
        const start = performance.now();
        await sleep(0);

        return performance.now() - start;
      }
    `

    // Add game objects
    code += `
      const runningCache = {
        stage: ${JSON.stringify(data.stage)},
        gameObjects: ${JSON.stringify(data.gameObjects)}
      };
    `

    // Add game objects' code
    data.gameObjects.forEach(gameObject => {
      // TODO: Add tick when while loop

      code += `
        (async () => {
          const that = runningCache.gameObjects.find(gameObject => gameObject.id === "${gameObject.id}");
          let deltaTime = 0;

          ${gameObject.code}
        })();
      `
    })

    // Add render function
    code += this.generateRenderFunctionCode()

    // Add main loop
    code += `
      (async () => {
        while (true) {
          render(runningCache, canvas);
          await frame();
        }
      })();
    `

    return code
  }
}