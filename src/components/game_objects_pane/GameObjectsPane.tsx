import { ProjectContext } from "@/ProjectContext"
import useTranslation from "next-translate/useTranslation"
import styles from "@/components/game_objects_pane/GameObjectsPane.module.scss"
import { useContext, useEffect, useState } from "react"
import LabeledTextInput from "../labeled_input/LabeledTextInput"
import Icon from "../Icon"
import { BLANK_IMAGE } from "@/constants"
import LabeledBooleanInput from "../labeled_input/LabeledBooleanInput"
import LabeledNumberInput from "../labeled_input/LabeledNumberInput"
import { DialogContext } from "../dialog/Dialog"

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
            value.trim() !== "" && (
              project.getActiveGameObject().id === value || 
              project.data.gameObjects.find(gameObject => gameObject.id === value) === undefined
            )
          }

          onChange={value => project.setData(data => {
            data.workspace.selectedGameObject = value
            data.gameObjects[project.getActiveGameObjectIndex()].id = value
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
      
      <div id={styles.gameObjectList}>
        { project.data.gameObjects.map((gameObject, index) => (
          <div key={index} 
            className={`${styles.gameObject} ${gameObject.id === project.data.workspace.selectedGameObject ? styles.selected : ""}`}
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
                          data.gameObjects = data.gameObjects.filter((_, i) => i !== index)
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
        )) }

        <div id={styles.addGameObject} className={styles.gameObject}
          onClick={() => project.setData(data => {
            const newId = `${t("game-object", { count: 1 })} ${data.gameObjects.length + 1}`
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
      </div>
    </>
  )
}