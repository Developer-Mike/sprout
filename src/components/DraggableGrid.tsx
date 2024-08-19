import React from "react"
import { useCallback, useState } from "react"

export default class DraggableGrid {
  static Root({ id, children }: {
    id: string,
    children: React.ReactNode
  }) {
    return (
      <div id={id}
        onDragOver={e => {
          e.preventDefault()
          e.dataTransfer.dropEffect = "move"
        }}
      >
        { children }
      </div>
    )
  }

  static Item({ onDraggedClassName, onDragged, children }: {
    onDraggedClassName?: string
    onDragged: (index: number) => void
    children: React.ReactNode
  }) {
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

    const getTargetIndex = useCallback((e: React.DragEvent) => {
      const mousePos = { x: e.clientX, y: e.clientY }

      const items = Array.from((e.currentTarget.parentElement as HTMLElement).children)
        .filter(child => child.getAttribute("draggable") === "true")

      let lastMiddle = -1
      let lastBottom = -1
      for (let i = 0; i < items.length; i++) {
        const rect = items[i].getBoundingClientRect()
        const middleX = rect.left + rect.width / 2

        if (mousePos.y < rect.bottom) { // If on the correct row
          if (middleX < lastMiddle) { // If new row
            if (mousePos.x < middleX) return i // If mouse is more to the left
            else if (mousePos.y < lastBottom) return Math.max(0, i - 1) // If mouse was more to the right
          } else {
            if (mousePos.x > lastMiddle && mousePos.x < rect.left) return Math.max(0, i - 1) // If mouse was over the middle of the last item but not over the current item
            else if (mousePos.x < middleX) return i // If mouse is more left to the middle of the current item
          }
        }

        lastMiddle = middleX
        lastBottom = rect.bottom
      }

      return items.length - 1
    }, [dragOffset])

    return React.cloneElement(children as React.ReactElement, { 
      draggable: true,
      className: `${(children as React.ReactElement).props.className ?? ""} ${isDragging ? onDraggedClassName ?? "" : ""}`,
      onDragStart: (e: React.DragEvent) => {
        setIsDragging(true)
        setDragOffset({
          x: e.clientX - e.currentTarget.getBoundingClientRect().left,
          y: e.clientY - e.currentTarget.getBoundingClientRect().top
        })
      },
      onDragEnd: (e: React.DragEvent) => {
        setIsDragging(false)
        onDragged(getTargetIndex(e))
      }
    })
  }
}