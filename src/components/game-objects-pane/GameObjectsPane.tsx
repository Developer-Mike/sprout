import { ProjectContext } from "@/ProjectContext"
import useTranslation from "next-translate/useTranslation"
import { Translate } from "next-translate"
import styles from "@/components/game-objects-pane/GameObjectsPane.module.scss"
import namedSpriteListItemStyles from "@/components/named-sprite-list-item/NamedSpriteListItem.module.scss"
import React, { useContext, useEffect, useState } from "react"
import LabeledTextInput from "../labeled-input/LabeledTextInput"
import Icon from "../Icon"
import { BLANK_IMAGE } from "@/constants"
import LabeledBooleanInput from "../labeled-input/LabeledBooleanInput"
import LabeledNumberInput, { InputType } from "../labeled-input/LabeledNumberInput"
import { DialogContext } from "../dialog/Dialog"
import Project from "@/core/Project"
import TransactionInfo, { TransactionCategory, TransactionType } from "@/types/TransactionInfo"
import NamedSpriteListItem from "../named-sprite-list-item/NamedSpriteListItem"
import DraggableLayout from "../DraggableLayout"
import IdHelper from "@/utils/id-helper"

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
          makeValid={value => IdHelper.makeIdValid(value)}
          isValidValue={value => IdHelper.isValidId(value, project.data.gameObjects.filter(gameObject => project.activeGameObject.id !== gameObject.id).map(gameObject => gameObject.id))}
          onChange={value => {
            const newId = value.trim()
            if (newId === project.activeGameObject.id) return

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

        <LabeledNumberInput label={t("layer")} value={project.activeGameObject.layer} precision={0} onChange={(newLayer, inputType) => project.updateData(
          inputType === InputType.Dragging ? null : new TransactionInfo(TransactionInfo.getType(project.activeGameObject.layer, newLayer), TransactionCategory.GameObjectProperty, project.activeGameObject.id, "layer", inputType === InputType.Dragged),
          data => { data.gameObjects[project.activeGameObjectIndex].layer = newLayer }
        )} />

        <LabeledBooleanInput label={t("visible")} value={project.activeGameObject.visible} onChange={newIsVisible => project.updateData(
          new TransactionInfo(TransactionType.Update, TransactionCategory.GameObjectProperty, project.activeGameObject.id, "visible"),
          data => { data.gameObjects[project.activeGameObjectIndex].visible = newIsVisible }
        )} />

        <LabeledNumberInput label={t("x")} value={project.activeGameObject.x} precision={0} onChange={(newX, inputType) => project.updateData(
          inputType === InputType.Dragging ? null : new TransactionInfo(TransactionInfo.getType(project.activeGameObject.x, newX), TransactionCategory.GameObjectProperty, project.activeGameObject.id, "x", inputType === InputType.Dragged),
          data => { data.gameObjects[project.activeGameObjectIndex].x = newX }
        )} />

        <LabeledNumberInput label={t("y")} value={project.activeGameObject.y} precision={0} onChange={(newY, inputType) => project.updateData(
          inputType === InputType.Dragging ? null : new TransactionInfo(TransactionInfo.getType(project.activeGameObject.y, newY), TransactionCategory.GameObjectProperty, project.activeGameObject.id, "y", inputType === InputType.Dragged),
          data => { data.gameObjects[project.activeGameObjectIndex].y = newY }
        )} />

        <LabeledNumberInput label={t("rotation")} value={project.activeGameObject.rotation} precision={2} onChange={(value, inputType) => {
          const newRotation = inputType === InputType.Dragging ? (value > 0 ? value : 360 + value) % 360 : value

          project.updateData(
            // Use the raw value to calculate the type to avoid the modulo operation
            inputType === InputType.Dragging ? null : new TransactionInfo(TransactionInfo.getType(project.activeGameObject.rotation, value), TransactionCategory.GameObjectProperty, project.activeGameObject.id, "rotation", inputType === InputType.Dragged),
            data => { data.gameObjects[project.activeGameObjectIndex].rotation = newRotation }
          )
        }} />

        <LabeledNumberInput label={t("width")} value={project.activeGameObject.width} precision={2} onChange={(newWidth, inputType) => {
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
            inputType === InputType.Dragging ? null : new TransactionInfo(TransactionInfo.getType(oldWidth, newWidth), TransactionCategory.GameObjectProperty, project.activeGameObject.id, "width", inputType === InputType.Dragged),
            data => {
              data.gameObjects[project.activeGameObjectIndex].width = newWidth
              if (linkedScalingEnabled) data.gameObjects[project.activeGameObjectIndex].height = newHeight
            }
          )
        }} />

        <div id={styles.linkedScaling} onClick={() => setLinkedScalingEnabled(!linkedScalingEnabled)}>
          <Icon iconId={linkedScalingEnabled ? "link" : "link_off"} />
        </div>

        <LabeledNumberInput label={t("height")} value={project.activeGameObject.height} precision={2} onChange={(newHeight, inputType) => {
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
            inputType === InputType.Dragging ? null : new TransactionInfo(TransactionInfo.getType(oldHeight, newHeight), TransactionCategory.GameObjectProperty, project.activeGameObject.id, "height", inputType === InputType.Dragged),
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
              .sprites[project.data.gameObjects[project.activeGameObjectIndex].activeSprite]
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
      
      <DraggableLayout.Root id={styles.gameObjectList}>
        { project.data.gameObjects.map((gameObject, index) => (
          <DraggableLayout.Item key={gameObject.id} onDraggedClassName={namedSpriteListItemStyles.dragging} onDragged={targetIndex => project.updateData(
            new TransactionInfo(TransactionType.Update, TransactionCategory.GameObjectList, gameObject.id, "reorder"),
            data => {
              const temp = data.gameObjects.splice(index, 1)[0]
              data.gameObjects.splice(targetIndex, 0, temp)
            }
          )}>
            <NamedSpriteListItem
              label={gameObject.id}
              src={project.data.sprites[gameObject.sprites[gameObject.activeSprite]] ?? BLANK_IMAGE}
              onClick={() => project.updateData(
                new TransactionInfo(TransactionType.Update, TransactionCategory.GameObjectList, gameObject.id, "select"),
                data => { data.workspace.selectedGameObjectId = gameObject.id }
              )}
              isFocused={project.data.workspace.selectedGameObjectId === gameObject.id}
              onDelete={() => showDialog({
                id: "delete-game-object-dialog",
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
                          gameObject.id, "delete"
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
              })}
            />
          </DraggableLayout.Item>
        )) }

        <CreateGameObjectButton t={t} project={project} />
      </DraggableLayout.Root>
    </>
  )
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
      id: IdHelper.generateId(t("default-game-object-id"), project.data.gameObjects.map(gameObject => gameObject.id)),
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
    <div id={styles.addGameObject} className={namedSpriteListItemStyles.listItem} onClick={() => createNewGameObject()}>
      <Icon iconId="add" />
    </div>
  )
}