import { ProjectContext } from "@/ProjectContext"
import useTranslation from "next-translate/useTranslation"
import { Translate } from "next-translate"
import styles from "@/components/game-objects-pane/GameObjectsPane.module.scss"
import React, { useCallback, useContext, useEffect, useState } from "react"
import LabeledTextInput from "../labeled-input/LabeledTextInput"
import Icon from "../Icon"
import { BLANK_IMAGE } from "@/constants"
import LabeledBooleanInput from "../labeled-input/LabeledBooleanInput"
import LabeledNumberInput from "../labeled-input/LabeledNumberInput"
import { DialogContext } from "../dialog/Dialog"
import Project from "@/core/Project"
import TransactionInfo, { TransactionCategory, TransactionType } from "@/types/TransactionInfo"

export default function GameObjectsPane() {
  const { t } = useTranslation("common")
  const { showDialog } = useContext(DialogContext)
  const { project } = useContext(ProjectContext)

  const [linkedScalingEnabled, setLinkedScalingEnabled] = useState(true)
  const [aspectRatioCache, setAspectRatioCache] = useState(1)

  useEffect(() => {
    setAspectRatioCache(project.activeGameObject.width / Math.max(1, project.activeGameObject.height))
  }, [project.data.workspace.selectedGameObjectId])

  return (
    <>
      <div id={styles.gameObjectProperties}>
        <LabeledTextInput label={t("id")} value={project.activeGameObject.id}
          isValidValue={value =>
            value.trim().length > 0 && (
              project.activeGameObject.id === value.trim() || 
              project.data.gameObjects.find(gameObject => gameObject.id === value.trim()) === undefined
            )
          }
          onChange={value => {
            const newId = value.trim()

            project.updateData(
              new TransactionInfo(
                TransactionInfo.getType(project.activeGameObject.id, newId),
                TransactionCategory.GameObjectProperty,
                project.activeGameObject.id, "id"
              ),
              data => {
                data.workspace.selectedGameObjectId = newId
                data.gameObjects[project.activeGameObjectIndex].id = newId
              }
            )
          }}
        />

        <LabeledNumberInput label={t("layer")} value={project.activeGameObject.layer} precision={0} onChange={newLayer => project.updateData(
          new TransactionInfo(TransactionInfo.getType(project.activeGameObject.layer, newLayer), TransactionCategory.GameObjectProperty, project.activeGameObject.id, "layer"),
          data => { data.gameObjects[project.activeGameObjectIndex].layer = newLayer }
        )} />

        <LabeledBooleanInput label={t("visible")} value={project.activeGameObject.visible} onChange={newIsVisible => project.updateData(
          new TransactionInfo(TransactionType.Update, TransactionCategory.GameObjectProperty, project.activeGameObject.id, "visible"),
          data => { data.gameObjects[project.activeGameObjectIndex].visible = newIsVisible }
        )} />

        <LabeledNumberInput label={t("x")} value={project.activeGameObject.x} precision={0} onChange={newX => project.updateData(
          new TransactionInfo(TransactionInfo.getType(project.activeGameObject.x, newX), TransactionCategory.GameObjectProperty, project.activeGameObject.id, "x"),
          data => { data.gameObjects[project.activeGameObjectIndex].x = newX }
        )} />

        <LabeledNumberInput label={t("y")} value={project.activeGameObject.y} precision={0} onChange={newY => project.updateData(
          new TransactionInfo(TransactionInfo.getType(project.activeGameObject.y, newY), TransactionCategory.GameObjectProperty, project.activeGameObject.id, "y"),
          data => { data.gameObjects[project.activeGameObjectIndex].y = newY }
        )} />

        <LabeledNumberInput label={t("rotation")} value={project.activeGameObject.rotation} precision={2} onChange={value => {
          const newRotation = (value > 0 ? value : 360 + value) % 360

          project.updateData(
            // Use the raw value to calculate the type to avoid the modulo operation
            new TransactionInfo(TransactionInfo.getType(project.activeGameObject.rotation, value), TransactionCategory.GameObjectProperty, project.activeGameObject.id, "rotation"),
            data => { data.gameObjects[project.activeGameObjectIndex].rotation = newRotation }
          )
        }} />

        <LabeledNumberInput label={t("width")} value={project.activeGameObject.width} precision={2} onChange={newWidth => {
          const oldWidth = project.data.gameObjects[project.activeGameObjectIndex].width
          const oldHeight = project.data.gameObjects[project.activeGameObjectIndex].height
          let newHeight = project.data.gameObjects[project.activeGameObjectIndex].height

           if (linkedScalingEnabled) {
            if (oldWidth == 0) newHeight = newWidth * (1 / aspectRatioCache)
            else newHeight *= newWidth / oldWidth

            newHeight = parseFloat(newHeight.toFixed(2))
          } else if (newWidth > 0) {
            setAspectRatioCache(newWidth / oldHeight)
          }

          project.updateData(
            new TransactionInfo(TransactionInfo.getType(oldWidth, newWidth), TransactionCategory.GameObjectProperty, project.activeGameObject.id, "width"),
            data => {
              data.gameObjects[project.activeGameObjectIndex].width = newWidth
              if (linkedScalingEnabled) data.gameObjects[project.activeGameObjectIndex].height = newHeight
            }
          )
        }} />

        <div id={styles.linkedScaling} onClick={() => setLinkedScalingEnabled(!linkedScalingEnabled)}>
          <Icon iconId={linkedScalingEnabled ? "link" : "link_off"} />
        </div>

        <LabeledNumberInput label={t("height")} value={project.activeGameObject.height} precision={2} onChange={newHeight => {
          const oldHeight = project.data.gameObjects[project.activeGameObjectIndex].height
          const oldWidth = project.data.gameObjects[project.activeGameObjectIndex].width
          let newWidth = project.data.gameObjects[project.activeGameObjectIndex].width

          if (linkedScalingEnabled) {
            if (oldHeight == 0) newWidth = newHeight * aspectRatioCache
            else newWidth *= newHeight / oldHeight

            newWidth = parseFloat(newWidth.toFixed(2))
          } else if (newHeight > 0) {
            setAspectRatioCache(oldWidth / newHeight)
          }

          project.updateData(
            new TransactionInfo(TransactionInfo.getType(oldHeight, newHeight), TransactionCategory.GameObjectProperty, project.activeGameObject.id, "height"),
            data => {
              data.gameObjects[project.activeGameObjectIndex].height = newHeight
              if (linkedScalingEnabled) data.gameObjects[project.activeGameObjectIndex].width = newWidth
            }
          )
        }} />

        <div id={styles.resetScale} onClick={() => {
          const sprite = new Image()
          sprite.src = project.data.sprites[
            project.data.gameObjects[project.activeGameObjectIndex]
              .sprites[0]
          ]

          const [newWidth, newHeight] = [
            Math.max(sprite.naturalWidth, 32),
            Math.max(sprite.naturalHeight, 32)
          ]

          setAspectRatioCache(newWidth / newHeight)

          project.updateData(
            new TransactionInfo(
              TransactionType.Update, 
              TransactionCategory.GameObjectProperty, 
              project.activeGameObject.id, "reset-scale"
            ),
            data => {
              data.gameObjects[project.activeGameObjectIndex].width = newWidth
              data.gameObjects[project.activeGameObjectIndex].height = newHeight
            }
          )
        }}>
          <Icon iconId="replay" />
        </div>
      </div>
      
      <DraggableGridView id={styles.gameObjectList}>
        { project.data.gameObjects.map((gameObject, index) => (
          <DraggableObject key={gameObject.id} onDragged={targetIndex => project.updateData(
            new TransactionInfo(TransactionType.Update, TransactionCategory.GameObjectList, gameObject.id, "reorder"),
            data => {
              const temp = data.gameObjects.splice(index, 1)[0]
              data.gameObjects.splice(targetIndex, 0, temp)
            }
          )}>
            <div className={`${styles.gameObject} ${gameObject.id === project.data.workspace.selectedGameObjectId ? styles.selected : ""}`}
              onClick={() => { project.updateData(
                new TransactionInfo(TransactionType.Update, TransactionCategory.GameObjectList, gameObject.id, "select"),
                data => { data.workspace.selectedGameObjectId = gameObject.id }
              ) }}
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
                          
                          project.updateData(
                            new TransactionInfo(
                              TransactionType.Remove,
                              TransactionCategory.GameObjectList,
                              gameObject.id, ""
                            ),
                            data => {
                              data.gameObjects.splice(index, 1)
                              data.workspace.selectedGameObjectId = data.gameObjects[index]?.id 
                                ?? data.gameObjects[index - 1]?.id 
                                ?? data.gameObjects[0]?.id
                            }
                          )
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
  const createNewGameObject = () => {
    const baseId = t("game-object", { count: 1 })
    let newId = baseId

    // Make sure that the new ID is unique
    let i = 1
    while (project.data.gameObjects.find(gameObject => gameObject.id === newId) !== undefined) {
      newId = `${baseId} ${i}`
      i++
    }

    const newGameObject = {
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
    }

    project.updateData(
      new TransactionInfo(
        TransactionType.Add,
        TransactionCategory.GameObjectList,
        newId, "create"
      ),
      data => {
        data.gameObjects.push(newGameObject)
        data.workspace.selectedGameObjectId = newId
      }
    )
  }

  return (
    <div id={styles.addGameObject} className={styles.gameObject} onClick={() => createNewGameObject()}>
      <Icon iconId="add" />
    </div>
  )
}