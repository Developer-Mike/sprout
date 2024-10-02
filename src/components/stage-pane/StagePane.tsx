import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/stage-pane/StagePane.module.scss"
import { useContext, useEffect, useState } from "react"
import Icon from "../Icon"
import TransactionInfo, { TransactionCategory, TransactionType } from "@/types/TransactionInfo"

export default function StagePane({ canvasRef }: {
  canvasRef?: React.MutableRefObject<HTMLCanvasElement | null>
}) {
  const { project } = useContext(ProjectContext)

  const [isEnlarged, setEnlarged] = useState(false)

  const enableFullscreen = () => {
    if (document.fullscreenElement) return

    const stage = document.getElementById(styles.stageCanvas) as HTMLCanvasElement
    if (!stage) return

    stage.requestFullscreen()
  }

  const updateCanvas = () => {
    const stage = document.getElementById(styles.stage) as HTMLDivElement
    if (!stage) return

    const canvas = document.getElementById(styles.stageCanvas) as HTMLCanvasElement
    if (!canvas) return

    const canvasComputedStyle = getComputedStyle(canvas)
    const paddingHorizontal = parseFloat(canvasComputedStyle.borderLeftWidth) + parseFloat(canvasComputedStyle.borderRightWidth)

    canvas.width = stage.clientWidth - paddingHorizontal
    canvas.height = canvas.width / (project.data.stage.width / project.data.stage.height)

    // Request a redraw
    if (!project.isRunning) project.render(canvas)
  }

  const highlightBlink = () => {
    const canvas = document.getElementById(styles.stageCanvas) as HTMLCanvasElement
    if (!canvas) return

    const highlighter = document.getElementById(styles.gameObjectSelectionHighlighter) as HTMLDivElement
    if (!highlighter) return

    const scale = canvas.width / project.data.stage.width

    const activeGameObject = project.selectedGameObject
    const sprite = project.getActiveSprite(activeGameObject)

    const width = Math.abs(activeGameObject.transform.width * sprite.width * scale)
    const height = Math.abs(activeGameObject.transform.height * sprite.height * scale)

    const x = activeGameObject.transform.x * scale - width / 2
    const y = activeGameObject.transform.y * scale - height / 2

    highlighter.style.bottom = `${y}px`
    highlighter.style.left = `${x}px`
    highlighter.style.width = `${width}px`
    highlighter.style.height = `${height}px`
    highlighter.style.transform = `rotate(${-activeGameObject.transform.rotation}deg)`

    highlighter.classList.add(styles.show)
    highlighter.addEventListener("transitionend", () => { highlighter.classList.remove(styles.show) }, { once: true })
  }

  const selectGameObjectOnClick = (e: MouseEvent) => {
    if (project.isRunning) return

    const canvas = document.getElementById(styles.stageCanvas) as HTMLCanvasElement
    if (!canvas) return

    const scale = project.data.stage.width / canvas.width
    const mouseX = e.offsetX * scale
    const mouseY = (canvas.height - e.offsetY) * scale

    const clickedGameObjectKey = Object.entries(project.data.gameObjects)
      .sort(([_, gameObject]) => gameObject.layer)
      .findLast(([_, gameObject]) => {
        const sprite = project.getActiveSprite(gameObject)
        const width = gameObject.transform.width * sprite.width
        const height = gameObject.transform.height * sprite.height

        const bounds = {
          minX: gameObject.transform.x - width / 2,
          minY: gameObject.transform.y - height / 2,
          maxX: gameObject.transform.x + width / 2,
          maxY: gameObject.transform.y + height / 2
        }

        return mouseX >= bounds.minX && mouseX <= bounds.maxX && mouseY >= bounds.minY && mouseY <= bounds.maxY
      })?.[0]
    
    if (!clickedGameObjectKey) return

    // Still show the highlighter if the same object is clicked
    if (project.selectedGameObjectKey === clickedGameObjectKey) highlightBlink()
    else project.updateData(
      new TransactionInfo(TransactionType.Update, TransactionCategory.GameObjectList, clickedGameObjectKey, "select"),
      data => { data.workspace.selectedGameObjectKey = clickedGameObjectKey }
    )
  }

  useEffect(() => {
    const stage = document.getElementById(styles.stage) as HTMLDivElement
    if (!stage) return

    const canvas = document.getElementById(styles.stageCanvas) as HTMLCanvasElement
    if (!canvas) return

    canvas.addEventListener("click", selectGameObjectOnClick)

    const resizeObserver = new ResizeObserver(() => { updateCanvas() })
    resizeObserver.observe(stage)

    return () => { 
      canvas.removeEventListener("click", selectGameObjectOnClick)
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    updateCanvas()
  } , [project.data])

  useEffect(() => {
    const stageContainer = document.getElementById(styles.stage)?.parentElement
    if (!stageContainer) return

    stageContainer.classList.toggle(styles.expanded, isEnlarged)
  }, [isEnlarged])

  useEffect(() => {
    highlightBlink()
  }, [project.data.workspace.selectedGameObjectKey])

  const onInput = (e: React.KeyboardEvent<HTMLInputElement>, setter: (value: number) => void) => {
    if (e.key !== "Enter") return

    const input = e.target as HTMLInputElement
    const value = Math.min(Math.max(parseInt(input.value), 1), 9999)

    input.value = value.toString()
    setter(value)

    input.blur()
  }

  return (
    <div id={styles.stage} className={isEnlarged ? styles.fullscreen : ""}>
      <div id={styles.controlBar}>
        <input type="number" defaultValue={project.data.stage.width} onKeyDown={(e) => { 
          onInput(e, (newWidth) => { project.updateData(
            new TransactionInfo(
              TransactionInfo.getType(project.data.stage.width, newWidth),
              TransactionCategory.ProjectSettings, 
              null, "stageWidth"
            ),
            data => { data.stage.width = newWidth }
          ) })
        }} disabled={!project.data.workspace.advanced} />
        <span>x</span>
        <input type="number" defaultValue={project.data.stage.height} onKeyDown={(e) => {
          onInput(e, (newHeight) => { project.updateData(
            new TransactionInfo(
              TransactionInfo.getType(project.data.stage.height, newHeight),
              TransactionCategory.ProjectSettings, 
              null, "stageHeight"
            ),
            data => { data.stage.height = newHeight }
          ) })
        }} disabled={!project.data.workspace.advanced} />

        <button id={styles.fullscreenToggle} onClick={() => enableFullscreen()}><Icon iconId="fit_screen" /></button>
        <button onClick={() => setEnlarged(!isEnlarged)}><Icon iconId={isEnlarged ? "fullscreen_exit" : "fullscreen"} /></button>
      </div>

      <div id={styles.canvasContainer}>
        <canvas ref={canvasRef} id={styles.stageCanvas} onContextMenu={e => e.preventDefault()} />
        <div id={styles.gameObjectSelectionHighlighter} />
      </div>
    </div>
  )
}