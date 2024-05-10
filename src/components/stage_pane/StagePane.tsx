import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/stage_pane/StagePane.module.scss"
import { useContext, useEffect, useState } from "react"
import Icon from "../Icon"

export default function StagePane({ canvasRef }: {
  canvasRef?: React.MutableRefObject<HTMLCanvasElement | null>
}) {
  const { project } = useContext(ProjectContext)

  const [isEnlarged, setEnlarged] = useState(false)

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

    const selectedGameObject = project.getActiveGameObject()

    const scale = project.data.stage.width / canvas.width
    const [width, height] = [selectedGameObject.width / scale, selectedGameObject.height / scale]
    const [x, y] = [selectedGameObject.x / scale - width / 2, selectedGameObject.y / scale - height / 2]

    highlighter.style.top = `${y}px`
    highlighter.style.left = `${x}px`
    highlighter.style.width = `${width}px`
    highlighter.style.height = `${height}px`

    highlighter.classList.add(styles.show)
    highlighter.addEventListener("transitionend", () => { highlighter.classList.remove(styles.show) }, { once: true })
  }

  const setSelectClickedGameObject = (e: MouseEvent) => {
    const canvas = document.getElementById(styles.stageCanvas) as HTMLCanvasElement
    if (!canvas) return

    const scale = project.data.stage.width / canvas.width
    const mouseX = e.offsetX * scale
    const mouseY = e.offsetY * scale

    const gameObject = project.data.gameObjects.find(gameObject => {
      const bounds = { 
        minX: gameObject.x - gameObject.width / 2, 
        minY: gameObject.y - gameObject.height / 2, 
        maxX: gameObject.x + gameObject.width / 2, 
        maxY: gameObject.y + gameObject.height / 2
      }

      return mouseX >= bounds.minX && mouseX <= bounds.maxX && mouseY >= bounds.minY && mouseY <= bounds.maxY
    })

    if (!gameObject) return

    // Still show the highlighter if the same object is clicked
    if (project.data.workspace.selectedGameObject === gameObject.id) highlightBlink()
    else project.setData(data => { data.workspace.selectedGameObject = gameObject.id })
  }

  useEffect(() => {
    const stage = document.getElementById(styles.stage) as HTMLDivElement
    if (!stage) return

    const canvas = document.getElementById(styles.stageCanvas) as HTMLCanvasElement
    if (!canvas) return

    canvas.addEventListener("click", setSelectClickedGameObject)

    const resizeObserver = new ResizeObserver(() => { updateCanvas() })
    resizeObserver.observe(stage)

    return () => { 
      canvas.removeEventListener("click", setSelectClickedGameObject)
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
  }, [project.data.workspace.selectedGameObject])

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
          onInput(e, (value) => { project.setData(data => { data.stage.width = value }) })
        }} disabled={!project.data.workspace.advanced} />
        <span>x</span>
        <input type="number" defaultValue={project.data.stage.height} onKeyDown={(e) => {
          onInput(e, (value) => { project.setData(data => { data.stage.height = value }) })
        }} disabled={!project.data.workspace.advanced} />

        <button id={styles.fullscreenToggle} onClick={() => { setEnlarged(!isEnlarged) }}><Icon iconId={isEnlarged ? "fullscreen_exit" : "fullscreen"} /></button>
      </div>

      <div id={styles.canvasContainer}>
        <canvas ref={canvasRef} id={styles.stageCanvas} />
        <div id={styles.gameObjectSelectionHighlighter} />
      </div>
    </div>
  )
}