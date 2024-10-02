import { ProjectContext } from "@/ProjectContext"
import useTranslation from "next-translate/useTranslation"
import styles from "@/components/game-objects-pane/GameObjectsPane.module.scss"
import namedSpriteListItemStyles from "@/components/named-sprite-list-item/NamedSpriteListItem.module.scss"
import React, { useContext, useEffect, useState } from "react"
import LabeledTextInput from "../labeled-input/LabeledTextInput"
import Icon from "../Icon"
import { DEFAULT_NEW_GAME_OBJECT } from "@/constants"
import LabeledBooleanInput from "../labeled-input/LabeledBooleanInput"
import LabeledNumberInput, { InputType } from "../labeled-input/LabeledNumberInput"
import { DialogContext } from "../dialog/Dialog"
import TransactionInfo, { TransactionCategory, TransactionType } from "@/types/TransactionInfo"
import NamedSpriteListItem from "../named-sprite-list-item/NamedSpriteListItem"
import DraggableLayout from "../DraggableLayout"
import IdHelper from "@/utils/id-helper"
import { GameObjectData } from "@/types/ProjectData"
import ObjectHelper from "@/utils/object-helper"

export default function GameObjectsPane() {
  const { t } = useTranslation("common")
  const { showDialog } = useContext(DialogContext)
  const { project } = useContext(ProjectContext)

  const [contextMenu, setContextMenu] = useState<{ gameObjectKey: string, x: number, y: number } | null>(null)
  const [linkedScalingEnabled, setLinkedScalingEnabled] = useState(true)
  const [aspectRatioCache, setAspectRatioCache] = useState(1)

  const createNewGameObject = async () => {
    const newGameObjectKey = project.getNewGameObjectKey()

    await project.updateData(
      new TransactionInfo(
        TransactionType.Add,
        TransactionCategory.GameObjectList,
        newGameObjectKey, "create"
      ),
      data => {
        const newGameObject = DEFAULT_NEW_GAME_OBJECT
        newGameObject.id = IdHelper.generateId(
          t("default-game-object-id"),
          Object.values(data.gameObjects).map(gameObject => gameObject.id)
        )

        data.gameObjects[newGameObjectKey] = newGameObject
        data.workspace.selectedGameObjectKey = newGameObjectKey
      }
    )
  }

  const cloneGameObject = (gameObjectKey: string) => {
    project.updateData(
      new TransactionInfo(
        TransactionType.Add,
        TransactionCategory.GameObjectList,
        gameObjectKey, "clone"
      ),
      data => {
        const newGameObjectKey = project.getNewGameObjectKey()

        const gameObject = ObjectHelper.deepClone(data.gameObjects[gameObjectKey])
        gameObject.id = IdHelper.generateId(
          gameObject.id,
          Object.values(data.gameObjects).map(gameObject => gameObject.id)
        )

        data.gameObjects[newGameObjectKey] = gameObject
        data.workspace.selectedGameObjectKey = newGameObjectKey
      }
    )
  }

  const showDeleteGameObjectDialog = (gameObjectKey: string) => {
    showDialog({
      id: "delete-game-object-dialog",
      title: t("delete-game-object-dialog.title"),
      content: t("delete-game-object-dialog.message", { id: project.data.gameObjects[gameObjectKey].id }),
      actions: [
        {
          default: true,
          element: <button>{t("cancel")}</button>,
          onClick: hide => hide()
        },
        {
          element: <button className="danger">{t("delete")}</button>,
          onClick: async hide => {
            hide()

            // Ensure there is always at least one game object
            if (Object.entries(project.data.gameObjects).length === 1) await createNewGameObject()

            project.updateData(
              new TransactionInfo(
                TransactionType.Remove,
                TransactionCategory.GameObjectList,
                gameObjectKey, "delete"
              ),
              data => {
                const gameObjectKeys = Object.keys(data.gameObjects)
                const selectionIndex = gameObjectKeys.indexOf(gameObjectKey)
                gameObjectKeys.splice(selectionIndex, 1)

                delete data.gameObjects[gameObjectKey]

                if (data.workspace.selectedGameObjectKey === gameObjectKey) {
                  data.workspace.selectedGameObjectKey = gameObjectKeys[selectionIndex] ?? 
                    gameObjectKeys[selectionIndex - 1] ?? 
                    gameObjectKeys[0] 
                    ?? null
                }
              }
            )
          }
        }
      ]
    })
  }

  useEffect(() => {
    setLinkedScalingEnabled(true)
    setAspectRatioCache(project.selectedGameObject.transform.width / Math.max(1, project.selectedGameObject.transform.height))

    const onClickListener = () => setContextMenu(null)
    window.addEventListener("click", onClickListener)
    return () => window.removeEventListener("click", onClickListener)
  }, [project.data.workspace.selectedGameObjectKey])

  return (
    <>
      <div id={styles.gameObjectProperties}>
        <LabeledTextInput label={t("id")} value={project.selectedGameObject.id}
          makeValid={value => IdHelper.makeIdValid(value)}
          isValidValue={value => IdHelper.isValidId(value, Object.values(project.data.gameObjects).map(gameObject => gameObject.id).filter(id => id !== project.selectedGameObject.id))}
          onChange={value => {
            const newId = value.trim()
            if (newId === project.selectedGameObject.id) return

            project.updateData(
              new TransactionInfo(
                TransactionInfo.getType(project.selectedGameObject.id, newId),
                TransactionCategory.GameObjectProperty,
                project.selectedGameObjectKey, "id"
              ),
              data => { data.gameObjects[project.selectedGameObjectKey].id = newId }
            )
          }}
        />

        <LabeledNumberInput label={t("layer")} value={project.selectedGameObject.layer} precision={0} onChange={(newLayer, inputType) => project.updateData(
          inputType === InputType.Dragging ? null : new TransactionInfo(inputType === InputType.Dragged ? TransactionType.Unique : TransactionInfo.getType(project.selectedGameObject.layer, newLayer), TransactionCategory.GameObjectProperty, project.selectedGameObjectKey, "layer"),
          data => { data.gameObjects[project.selectedGameObjectKey].layer = newLayer }
        )} />

        <LabeledBooleanInput label={t("visible")} value={project.selectedGameObject.visible} onChange={newIsVisible => project.updateData(
          new TransactionInfo(TransactionType.Update, TransactionCategory.GameObjectProperty, project.selectedGameObject.id, "visible"),
          data => { data.gameObjects[project.selectedGameObjectKey].visible = newIsVisible }
        )} />

        <LabeledNumberInput label={t("x")} value={project.selectedGameObject.transform.x} precision={0} onChange={(newX, inputType) => project.updateData(
          inputType === InputType.Dragging ? null : new TransactionInfo(inputType === InputType.Dragged ? TransactionType.Unique : TransactionInfo.getType(project.selectedGameObject.transform.x, newX), TransactionCategory.GameObjectProperty, project.selectedGameObjectKey, "x"),
          data => { data.gameObjects[project.selectedGameObjectKey].transform.x = newX }
        )} />

        <LabeledNumberInput label={t("y")} value={project.selectedGameObject.transform.y} precision={0} onChange={(newY, inputType) => project.updateData(
          inputType === InputType.Dragging ? null : new TransactionInfo(inputType === InputType.Dragged ? TransactionType.Unique : TransactionInfo.getType(project.selectedGameObject.transform.y, newY), TransactionCategory.GameObjectProperty, project.selectedGameObjectKey, "y"),
          data => { data.gameObjects[project.selectedGameObjectKey].transform.y = newY }
        )} />

        <LabeledNumberInput label={t("rotation")} value={project.selectedGameObject.transform.rotation} precision={2} onChange={(value, inputType) => {
          const newRotation = inputType === InputType.Dragging ? (value > 0 ? value : 360 + value) % 360 : value

          project.updateData(
            // Use the raw value to calculate the type to avoid the modulo operation
            inputType === InputType.Dragging ? null : new TransactionInfo(inputType === InputType.Dragged ? TransactionType.Unique : TransactionInfo.getType(project.selectedGameObject.transform.rotation, value), TransactionCategory.GameObjectProperty, project.selectedGameObjectKey, "rotation"),
            data => { data.gameObjects[project.selectedGameObjectKey].transform.rotation = newRotation }
          )
        }} />

        <LabeledNumberInput label={t("width")} value={project.selectedGameObject.transform.width} precision={3} dragSensitivity={0.01} onChange={(newWidth, inputType) => {
          const oldWidth = project.selectedGameObject.transform.width
          const oldHeight = project.selectedGameObject.transform.height
          let newHeight = project.selectedGameObject.transform.height

           if (linkedScalingEnabled) {
            if (oldWidth == 0) newHeight = newWidth * (1 / aspectRatioCache)
            else newHeight *= newWidth / oldWidth

            newHeight = parseFloat(newHeight.toFixed(2))
          } else if (newWidth > 0) {
            setAspectRatioCache(newWidth / oldHeight)
          }

          project.updateData(
            inputType === InputType.Dragging ? null : new TransactionInfo(inputType === InputType.Dragged ? TransactionType.Unique : TransactionInfo.getType(oldWidth, newWidth), TransactionCategory.GameObjectProperty, project.selectedGameObjectKey, "width"),
            data => {
              data.gameObjects[project.selectedGameObjectKey].transform.width = newWidth
              if (linkedScalingEnabled) data.gameObjects[project.selectedGameObjectKey].transform.height = newHeight
            }
          )
        }} />

        <div id={styles.linkedScaling} onClick={() => setLinkedScalingEnabled(!linkedScalingEnabled)}>
          <Icon iconId={linkedScalingEnabled ? "link" : "link_off"} />
        </div>

        <LabeledNumberInput label={t("height")} value={project.selectedGameObject.transform.height} precision={3} dragSensitivity={0.01} onChange={(newHeight, inputType) => {
          const oldHeight = project.selectedGameObject.transform.height
          const oldWidth = project.selectedGameObject.transform.width
          let newWidth = project.selectedGameObject.transform.width

          if (linkedScalingEnabled) {
            if (oldHeight == 0) newWidth = newHeight * aspectRatioCache
            else newWidth *= newHeight / oldHeight

            newWidth = parseFloat(newWidth.toFixed(2))
          } else if (newHeight > 0) {
            setAspectRatioCache(oldWidth / newHeight)
          }

          project.updateData(
            inputType === InputType.Dragging ? null : new TransactionInfo(inputType === InputType.Dragged ? TransactionType.Unique : TransactionInfo.getType(oldHeight, newHeight), TransactionCategory.GameObjectProperty, project.selectedGameObjectKey, "height"),
            data => {
              data.gameObjects[project.selectedGameObjectKey].transform.height = newHeight
              if (linkedScalingEnabled) data.gameObjects[project.selectedGameObjectKey].transform.width = newWidth
            }
          )
        }} />

        <div id={styles.resetScale} onClick={() => {
          setAspectRatioCache(1)

          project.updateData(
            new TransactionInfo(
              TransactionType.Update, 
              TransactionCategory.GameObjectProperty, 
              project.selectedGameObjectKey, "reset-scale"
            ),
            data => {
              data.gameObjects[project.selectedGameObjectKey].transform.width = 1
              data.gameObjects[project.selectedGameObjectKey].transform.height = 1
            }
          )
        }}>
          <Icon iconId="replay" />
        </div>
      </div>
      
      <DraggableLayout.Root id={styles.gameObjectList}>
        { Object.entries(project.data.gameObjects).map(([gameObjectKey, gameObject]) => (
          <DraggableLayout.Item key={gameObjectKey} onDraggedClassName={namedSpriteListItemStyles.dragging} onDragged={targetIndex => project.updateData(
            new TransactionInfo(TransactionType.Update, TransactionCategory.GameObjectList, gameObjectKey, "reorder"),
            data => {
              const entries = Object.entries(data.gameObjects)
              const index = entries.findIndex(([key, _]) => key === gameObjectKey)

              const targetEntry = entries.splice(index, 1)[0]
              entries.splice(targetIndex, 0, targetEntry)

              data.gameObjects = Object.fromEntries(entries)
            }
          )}>
            <NamedSpriteListItem
              className={project.compiledASTs?.[gameObjectKey]?.errors?.length ? namedSpriteListItemStyles.hasError : ""}
              label={gameObject.id}
              src={project.getActiveSprite(gameObject).src}
              onClick={() => project.updateData(
                new TransactionInfo(TransactionType.Update, TransactionCategory.GameObjectList, gameObjectKey, "select"),
                data => { data.workspace.selectedGameObjectKey = gameObjectKey }
              )}
              onContextMenu={e => {
                e.preventDefault()
                e.stopPropagation()

                setContextMenu({ gameObjectKey: gameObjectKey, x: e.clientX, y: e.clientY })
              }}
              isFocused={project.data.workspace.selectedGameObjectKey === gameObjectKey}
              onDelete={() => showDeleteGameObjectDialog(gameObjectKey)}
            />
          </DraggableLayout.Item>
        )) }

        <div id={styles.addGameObject} className={namedSpriteListItemStyles.listItem} onClick={() => createNewGameObject()}>
          <Icon iconId="add" />
        </div>

        { contextMenu && <div id={styles.contextMenu} style={{ top: contextMenu.y, left: contextMenu.x }}>
          <span onClick={() => cloneGameObject(contextMenu.gameObjectKey)}>{t("duplicate")}</span>
          <span className={styles.danger} onClick={() => showDeleteGameObjectDialog(contextMenu.gameObjectKey)}>{t("delete")}</span>
        </div> }
      </DraggableLayout.Root>
    </>
  )
}