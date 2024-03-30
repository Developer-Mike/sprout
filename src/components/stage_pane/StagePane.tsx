import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/stage_pane/StagePane.module.scss"
import { useContext, useEffect, useMemo, useState } from "react"
import Icon from "../Icon"
import useProperty from "@/ReactiveProperty"

export default function StagePane({ canvasRef }: {
  canvasRef?: React.MutableRefObject<HTMLCanvasElement | null>
}) {
  const project = useContext(ProjectContext)
  const [stageWidth, setStageWidth] = useProperty(project.data.stage, "width")
  const [stageHeight, setStageHeight] = useProperty(project.data.stage, "height")

  const [isFullscreen, setFullscreen] = useState(false)

  const updateCanvas = () => {
    const stage = document.getElementById(styles.stage) as HTMLDivElement
    if (!stage) return

    const canvas = document.getElementById(styles.stageCanvas) as HTMLCanvasElement
    if (!canvas) return

    const canvasComputedStyle = getComputedStyle(canvas)
    const paddingHorizontal = parseFloat(canvasComputedStyle.borderLeftWidth) + parseFloat(canvasComputedStyle.borderRightWidth)

    canvas.width = stage.clientWidth - paddingHorizontal
    canvas.height = canvas.width / (stageWidth / stageHeight)

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
  } , [stageWidth, stageHeight])

  useEffect(() => {
    const stageContainer = document.getElementById(styles.stage)?.parentElement
    if (!stageContainer) return

    stageContainer.classList.toggle(styles.expanded, isFullscreen)
  }, [isFullscreen])

  const onInput = (e: React.KeyboardEvent<HTMLInputElement>, setter: (value: number) => void) => {
    if (e.key !== "Enter") return

    const input = e.target as HTMLInputElement
    setter(parseInt(input.value))

    input.blur()
  }

  return (
    <div id={styles.stage} className={isFullscreen ? styles.fullscreen : ""}>
      <div id={styles.controlBar}>
        <input type="number" defaultValue={stageWidth} onKeyDown={(e) => { onInput(e, setStageWidth) }} />
        <input type="number" defaultValue={stageHeight} onKeyDown={(e) => { onInput(e, setStageHeight) }} />

        <button id={styles.fullscreenToggle} onClick={() => { setFullscreen(!isFullscreen) }}><Icon iconId={isFullscreen ? "fullscreen_exit" : "fullscreen"} /></button>
      </div>

      <canvas ref={canvasRef} id={styles.stageCanvas} />
    </div>
  )
}