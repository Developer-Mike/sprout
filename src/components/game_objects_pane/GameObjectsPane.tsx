import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/game_objects_pane/GameObjectsPane.module.scss"
import { useContext } from "react"

export default function GameObjectsPane() {
  const { project, setProjectData } = useContext(ProjectContext)

  return (
    <>
      <div id={styles.gameObjectProperties}>
        <input type="text" value={project.getActiveGameObject().id} />
      </div>
      
      <div id={styles.gameObjectList}>
        { project.data.gameObjects.map((gameObject, index) => (
          <div key={index} 
            className={`${styles.gameObject} ${gameObject.id === project.data.workspace.selectedGameObject ? styles.selected : ""}`}
            onClick={() => { setProjectData((data) => { data.workspace.selectedGameObject = gameObject.id }) }}
          >
            <img className={styles.gameObjectPreview}
              alt={gameObject.id}
              src={project.data.sprites[
                gameObject.sprites[
                  gameObject.activeSprite
                ]
              ]} />
            <span className={styles.gameObjectId}>{gameObject.id}</span>
          </div>
        )) }
      </div>
    </>
  )
}