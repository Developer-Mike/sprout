import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/stage_pane/StagePane.module.scss"
import { useContext, useEffect, useMemo } from "react"

export default function StagePane({ canvasRef }: {
  canvasRef?: React.MutableRefObject<HTMLCanvasElement | null>
}) {
  const project = useContext(ProjectContext)
  const ratio = useMemo(() => 
    project.data.stage.width / project.data.stage.height, 
  [project.data.stage.width, project.data.stage.height])

  useEffect(() => {
    const stage = document.getElementById(styles.stage) as HTMLDivElement
    if (!stage) return

    const canvas = document.getElementById(styles.stageCanvas) as HTMLCanvasElement
    if (!canvas) return

    const resizeObserver = new ResizeObserver(() => {
      const canvasComputedStyle = getComputedStyle(canvas)
      const paddingHorizontal = parseFloat(canvasComputedStyle.borderLeftWidth) + parseFloat(canvasComputedStyle.borderRightWidth)

      canvas.width = stage.clientWidth - paddingHorizontal
      canvas.height = canvas.width / ratio

      // Request a redraw
      project.render(canvas)
    })
    resizeObserver.observe(stage)

    return () => { resizeObserver.disconnect() }
  } , [])

  return (
    <div id={styles.stage}>
      <canvas ref={canvasRef} id={styles.stageCanvas} width="0" height="0" />
    </div>
  )
}