import { ProjectData } from "../types/ProjectData";

export default class SproutEngine {
  static render(data: ProjectData, canvas: HTMLCanvasElement) {
    let code = this.generateRenderFunctionCode()
    code += `render(data, canvas);`
    eval(code)
  }

  private static generateRenderFunctionCode(): string {
    return `
      const render = (data, canvas) => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set matrix
        ctx.resetTransform();
        ctx.scale(canvas.width / data.stage.width, canvas.height / data.stage.height);
        ctx.save();

        // Clear canvas
        ctx.clearRect(0, 0, data.stage.width, data.stage.height);

        const gameObjects = data.gameObjects
          .filter(gameObject => gameObject.visible)
          .sort((a, b) => a.layer - b.layer);

        gameObjects.forEach(gameObject => {
          // Skip if no sprite or index out of bounds
          if (gameObject.sprites.length === 0 || gameObject.activeSprite >= gameObject.sprites.length)
            return;

          const x = -gameObject.width / 2;
          const y = -gameObject.height / 2;

          // Set matrix
          ctx.translate(gameObject.x, gameObject.y);
          ctx.rotate(gameObject.rotation * Math.PI / 180);

          if (gameObject.width < 0) ctx.scale(-1, 1);
          if (gameObject.height < 0) ctx.scale(1, -1);

          // Draw sprite
          const sprite = new Image();
          sprite.src = data.sprites[gameObject.sprites[gameObject.activeSprite]];
          ctx.drawImage(sprite, x, y, gameObject.width, gameObject.height);

          // Reset matrix
          ctx.restore();
        })
      }
    `
  }

  static run(data: ProjectData, getIsRunning: () => boolean, canvas: HTMLCanvasElement) {
    const code = this.generateRunnableCode(data)
    eval(code)
  }

  private static generateRunnableCode(data: ProjectData): string {
    let code = ""
    
    // Add helper functions
    code += `
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
        const end = performance.now();

        return (end - start) / 1000;
      }
    `

    const optimizedSprites = Object.fromEntries(
      Object.entries(data.sprites)
        .filter(([key, _value]) => data.gameObjects.some(gameObject => gameObject.sprites.includes(key)))
    )

    // Add game objects
    code += `
      const runningCache = {
        sprites: ${JSON.stringify(optimizedSprites)},
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

  static generateExportableHTMLCode(data: ProjectData): string {
    let code = this.generateRunnableCode(data)
    code = `
      const canvas = document.getElementById("canvas");
      if (!canvas) throw new Error("Canvas not found");

      const getIsRunning = () => { return true; }
    ` + code

    code += `
      const onresize = () => {
        const ratio = runningCache.stage.width / runningCache.stage.height;

        if (window.innerWidth / window.innerHeight > ratio) {
          canvas.style.width = window.innerHeight * ratio + "px";
          canvas.style.height = window.innerHeight + "px";
        } else {
          canvas.style.width = window.innerWidth + "px";
          canvas.style.height = window.innerWidth / ratio + "px";
        }

        // Rerender canvas
        render(runningCache, canvas);
      }

      window.onresize = onresize;
      onresize();
    `

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.title}</title>

          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              
              margin: 0;
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          <canvas id="canvas"></canvas>
          <script>
            ${code}
          </script>
        </body>
      </html>
    `

    return html
  }
}