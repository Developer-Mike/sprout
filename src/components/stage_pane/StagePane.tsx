import styles from "@/components/stage_pane/StagePane.module.scss"
import { useEffect } from "react"

export default function StagePane({ ratio }: {
  ratio: number
}) {
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
    })
    resizeObserver.observe(stage)

    return () => { resizeObserver.disconnect() }
  } , [])

  return (
    <div id={styles.stage}>
      <canvas id={styles.stageCanvas} width="0" height="0" />
    </div>
  )
}