import { ProjectContext } from "@/ProjectContext"
import useTranslation from "next-translate/useTranslation"
import styles from "@/components/game_objects_pane/GameObjectsPane.module.scss"
import { useContext } from "react"
import LabeledInput from "../labeled_input/LabeledInput"
import Icon from "../Icon"
import { BLANK_IMAGE } from "@/constants"

export default function GameObjectsPane() {
  const { t } = useTranslation("common")
  const { project } = useContext(ProjectContext)

  return (
    <>
      <div id={styles.gameObjectProperties}>
        <LabeledInput label="id" value={project.getActiveGameObject().id} onChange={value => project.setData(data => {
          data.workspace.selectedGameObject = value
          data.gameObjects[project.getActiveGameObjectIndex()].id = value 
        })} />
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
          </div>
        )) }

        <div id={styles.addGameObject} className={styles.gameObject}
          onClick={() => project.setData(data => {
            data.gameObjects.push({
              id: `${t("game-object", { count: 1 })} ${data.gameObjects.length + 1}`,
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
          })}
        >
          <Icon iconId="add" />
        </div>
      </div>
    </>
  )
}