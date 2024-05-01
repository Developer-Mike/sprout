import { ProjectContext } from "@/ProjectContext"
import useTranslation from "next-translate/useTranslation"
import { Translate } from "next-translate"
import styles from "@/components/game_objects_pane/GameObjectsPane.module.scss"
import React, { useCallback, useContext, useEffect, useState } from "react"
import LabeledTextInput from "../labeled_input/LabeledTextInput"
import Icon from "../Icon"
import { BLANK_IMAGE } from "@/constants"
import LabeledBooleanInput from "../labeled_input/LabeledBooleanInput"
import LabeledNumberInput from "../labeled_input/LabeledNumberInput"
import { DialogContext } from "../dialog/Dialog"
import Project from "@/core/Project"

export default function GameObjectsPane() {
  const { t } = useTranslation("common")
  const { showDialog } = useContext(DialogContext)
  const { project } = useContext(ProjectContext)

  const [linkedScalingEnabled, setLinkedScalingEnabled] = useState(true)
  const [aspectRatioCache, setAspectRatioCache] = useState(1)

  useEffect(() => {
    setAspectRatioCache(project.getActiveGameObject().width / Math.max(1, project.getActiveGameObject().height))
  }, [project.data.workspace.selectedGameObject])

  return (
    <>
      <div id={styles.gameObjectProperties}>
        <LabeledTextInput label={t("id")} value={project.getActiveGameObject().id}
          isValidValue={value =>
            value.trim().length > 0 && (
              project.getActiveGameObject().id === value.trim() || 
              project.data.gameObjects.find(gameObject => gameObject.id === value.trim()) === undefined
            )
          }

          onChange={value => project.setData(data => {
            data.workspace.selectedGameObject = value.trim()
            data.gameObjects[project.getActiveGameObjectIndex()].id = value.trim()
          })}
        />

        <LabeledNumberInput label={t("layer")} value={project.getActiveGameObject().layer} precision={0} onChange={value => project.setData(data => {
          data.gameObjects[project.getActiveGameObjectIndex()].layer = value
        })} />

        <LabeledBooleanInput label={t("visible")} value={project.getActiveGameObject().visible} onChange={value => project.setData(data => {
          data.gameObjects[project.getActiveGameObjectIndex()].visible = value
        })} />

        <LabeledNumberInput label={t("x")} value={project.getActiveGameObject().x} precision={0} onChange={value => project.setData(data => {
          data.gameObjects[project.getActiveGameObjectIndex()].x = value
        })} />

        <LabeledNumberInput label={t("y")} value={project.getActiveGameObject().y} precision={0} onChange={value => project.setData(data => {
          data.gameObjects[project.getActiveGameObjectIndex()].y = value
        })} />

        <LabeledNumberInput label={t("rotation")} value={project.getActiveGameObject().rotation} precision={2} onChange={value => project.setData(data => {
          data.gameObjects[project.getActiveGameObjectIndex()].rotation = (value > 0 ? value : 360 + value) % 360
        })} />

        <LabeledNumberInput label={t("width")} value={project.getActiveGameObject().width} precision={2} onChange={newWidth => project.setData(data => {
          if (linkedScalingEnabled) {
            const oldWidth = data.gameObjects[project.getActiveGameObjectIndex()].width
            let newHeight = data.gameObjects[project.getActiveGameObjectIndex()].height

            if (oldWidth == 0) newHeight = newWidth * (1 / aspectRatioCache)
            else newHeight *= newWidth / oldWidth

            data.gameObjects[project.getActiveGameObjectIndex()].height = parseFloat(newHeight.toFixed(2))
          } else if (newWidth > 0) {
            setAspectRatioCache(newWidth / data.gameObjects[project.getActiveGameObjectIndex()].height)
          }

          data.gameObjects[project.getActiveGameObjectIndex()].width = newWidth
        })} />

        <div id={styles.linkedScaling} onClick={() => setLinkedScalingEnabled(!linkedScalingEnabled)}>
          <Icon iconId={linkedScalingEnabled ? "link" : "link_off"} />
        </div>

        <LabeledNumberInput label={t("height")} value={project.getActiveGameObject().height} precision={2} onChange={newHeight => project.setData(data => {
          if (linkedScalingEnabled) {
            const oldHeight = data.gameObjects[project.getActiveGameObjectIndex()].height
            let newWidth = data.gameObjects[project.getActiveGameObjectIndex()].width

            if (oldHeight == 0) newWidth = newHeight * aspectRatioCache
            else newWidth *= newHeight / oldHeight

            data.gameObjects[project.getActiveGameObjectIndex()].width = parseFloat(newWidth.toFixed(2))
          } else if (newHeight > 0) {
            setAspectRatioCache(data.gameObjects[project.getActiveGameObjectIndex()].width / newHeight)
          }

          data.gameObjects[project.getActiveGameObjectIndex()].height = newHeight
        })} />

        <div id={styles.resetScale} onClick={() => project.setData(data => {
          const sprite = new Image()
          sprite.src = data.sprites[data.gameObjects[project.getActiveGameObjectIndex()].sprites[0]]

          const [width, height] = [
            Math.max(sprite.naturalWidth, 32),
            Math.max(sprite.naturalHeight, 32)
          ]

          data.gameObjects[project.getActiveGameObjectIndex()].width = width
          data.gameObjects[project.getActiveGameObjectIndex()].height = height

          setAspectRatioCache(width / height)
        })}>
          <Icon iconId="replay" />
        </div>
      </div>
      
      <DraggableGridView id={styles.gameObjectList}>
        { project.data.gameObjects.map((gameObject, index) => (
          <DraggableObject key={gameObject.id} onDragged={targetIndex => project.setData(data => {
            const temp = data.gameObjects.splice(index, 1)[0]
            data.gameObjects.splice(targetIndex, 0, temp)
          })}>
            <div className={`${styles.gameObject} ${gameObject.id === project.data.workspace.selectedGameObject ? styles.selected : ""}`}
              onClick={() => { project.setData(data => { data.workspace.selectedGameObject = gameObject.id }) }}
            >
              <img className={styles.gameObjectPreview}
                alt={gameObject.id}
                src={project.data.sprites[
                  gameObject.sprites[
                    gameObject.activeSprite
                  ]
                ] ?? BLANK_IMAGE} />
              <span className={styles.gameObjectId}>{gameObject.id}</span>

              <div className={styles.deleteGameObject}
                onClick={(e) => {
                  e.stopPropagation()

                  showDialog({
                    id: "delete-game-object",
                    title: t("delete-game-object-dialog.title"),
                    content: t("delete-game-object-dialog.message", { id: gameObject.id }),
                    actions: [
                      {
                        default: true,
                        element: <button>{t("cancel")}</button>,
                        onClick: hide => hide()
                      },
                      {
                        element: <button className="danger">{t("delete")}</button>,
                        onClick: hide => {
                          hide()
                          
                          project.setData(data => {
                            data.gameObjects.splice(index, 1)
                            data.workspace.selectedGameObject = data.gameObjects[index]?.id 
                              ?? data.gameObjects[index - 1]?.id 
                              ?? data.gameObjects[0]?.id
                          })
                        }
                      }
                    ]
                  })
                }}
              >
                <Icon iconId="delete" />
              </div>
            </div>
          </DraggableObject>
        )) }

        <CreateGameObjectButton t={t} project={project} />
      </DraggableGridView>
    </>
  )
}

function DraggableGridView ({ id, children }: {
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

function DraggableObject({ onDragged, children }: {
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
    className: `${(children as React.ReactElement).props.className} ${isDragging ? styles.dragging : ""}`,
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

function CreateGameObjectButton({ t, project }: {
  t: Translate,
  project: Project
}) {
  return (
    <div id={styles.addGameObject} className={styles.gameObject}
      onClick={() => project.setData(data => {
        const baseId = t("game-object", { count: 1 })
        let newId = baseId

        // Make sure that the new ID is unique
        let i = 1
        while (data.gameObjects.find(gameObject => gameObject.id === newId) !== undefined) {
          newId = `${baseId} ${i}`
          i++
        }

        data.gameObjects.push({
          id: newId,
          visible: true,
          x: 0,
          y: 0,
          layer: 0,
          rotation: 0,
          width: 32,
          height: 32,
          sprites: [],
          activeSprite: 0,
          code: ""
        })

        data.workspace.selectedGameObject = newId
      })}
    >
      <Icon iconId="add" />
    </div>
  )
}