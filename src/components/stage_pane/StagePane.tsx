import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/stage_pane/StagePane.module.scss"
import { useContext, useEffect, useState } from "react"
import Icon from "../Icon"

export default function StagePane({ canvasRef }: {
  canvasRef?: React.MutableRefObject<HTMLCanvasElement | null>
}) {
  const { project, setProjectData } = useContext(ProjectContext)

  const [isFullscreen, setFullscreen] = useState(false)

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
    project.render(canvas)
  }

  useEffect(() => {
    const stage = document.getElementById(styles.stage) as HTMLDivElement
    if (!stage) return

    const resizeObserver = new ResizeObserver(() => { updateCanvas() })
    resizeObserver.observe(stage)

    updateCanvas()

    return () => { resizeObserver.disconnect() }
  } , [project.data.stage.width, project.data.stage.height])

  useEffect(() => {
    const stageContainer = document.getElementById(styles.stage)?.parentElement
    if (!stageContainer) return

    stageContainer.classList.toggle(styles.expanded, isFullscreen)
  }, [isFullscreen])

  const onInput = (e: React.KeyboardEvent<HTMLInputElement>, setter: (value: number) => void) => {
    if (e.key !== "Enter") return

    const input = e.target as HTMLInputElement
    const value = Math.min(Math.max(parseInt(input.value), 1), 9999)

    input.value = value.toString()
    setter(value)

    input.blur()
  }

  return (
    <div id={styles.stage} className={isFullscreen ? styles.fullscreen : ""}>
      <div id={styles.controlBar}>
        <input type="number" defaultValue={project.data.stage.width} onKeyDown={(e) => { 
          onInput(e, (value) => { setProjectData((data) => { data.stage.width = value }) })
        }} disabled={!project.data.workspace.advanced} />
        <span>x</span>
        <input type="number" defaultValue={project.data.stage.height} onKeyDown={(e) => {
          onInput(e, (value) => { setProjectData((data) => { data.stage.height = value }) })
        }} disabled={!project.data.workspace.advanced} />

        <button id={styles.fullscreenToggle} onClick={() => { setFullscreen(!isFullscreen) }}><Icon iconId={isFullscreen ? "fullscreen_exit" : "fullscreen"} /></button>
      </div>

      <canvas ref={canvasRef} id={styles.stageCanvas} />
    </div>
  )
}