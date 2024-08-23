import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/sprites-tab/SpritesTab.module.scss"
import namedSpriteListItemStyles from "@/components/named-sprite-list-item/NamedSpriteListItem.module.scss"
import { useContext, useEffect, useState } from "react"
import NamedSpriteListItem from "../named-sprite-list-item/NamedSpriteListItem"
import Icon from "../Icon"
import useTranslation from "next-translate/useTranslation"
import SpriteLibraryDialog from "../sprite-library-dialog/SpriteLibraryDialog"
import DraggableLayout from "../DraggableLayout"
import TransactionInfo, { TransactionCategory, TransactionType } from "@/types/TransactionInfo"

export default function SpritesTab() {
  const { t } = useTranslation("common")
  
  const { project } = useContext(ProjectContext)
  const [isSpriteLibraryVisible, setIsSpriteLibraryVisible] = useState(false)

  useEffect(() => {
    setIsSpriteLibraryVisible(false)
  }, [project, project.activeGameObjectIndex])

  return (
    <div id={styles.spritesTab}>
      <DraggableLayout.Root id={styles.gameObjectSprites} className={styles.spritesGrid}>
        { project.activeGameObject.sprites.map((sprite, index) => (
          <DraggableLayout.Item key={index} onDraggedClassName={namedSpriteListItemStyles.dragging} onDragged={targetIndex => project.updateData(
            new TransactionInfo(TransactionType.Update, TransactionCategory.GameObjectProperty, project.activeGameObject.id, "reorder-sprites", true),
            data => {
              const temp = data.gameObjects[project.activeGameObjectIndex].sprites.splice(index, 1)[0]
              data.gameObjects[project.activeGameObjectIndex].sprites.splice(targetIndex, 0, temp)
            }
          )}>
            <NamedSpriteListItem
              label={sprite}
              src={project.data.sprites[sprite]}
              onClick={() => project.updateData(
                new TransactionInfo(TransactionType.Update, TransactionCategory.GameObjectProperty, project.activeGameObject.id, "active-sprite"),
                data => data.gameObjects[project.activeGameObjectIndex].activeSprite = index
              )}
              isFocused={project.activeGameObject.activeSprite === index}
              onDelete={() => project.updateData(
                new TransactionInfo(TransactionType.Remove, TransactionCategory.GameObjectProperty, project.activeGameObject.id, "remove-sprite", true),
                data => {
                  data.gameObjects[project.activeGameObjectIndex].sprites.splice(index, 1)

                  // If the last sprite was removed, set the active sprite to the last one
                  if (data.gameObjects[project.activeGameObjectIndex].activeSprite >= data.gameObjects[project.activeGameObjectIndex].sprites.length) {
                    data.gameObjects[project.activeGameObjectIndex].activeSprite = data.gameObjects[project.activeGameObjectIndex].sprites.length - 1
                  }
                }
              )}
            />
          </DraggableLayout.Item>
        )) }
      </DraggableLayout.Root>

      <button id={styles.addSpriteButton} className="primary" onClick={() => setIsSpriteLibraryVisible(true)}>
        <Icon className="icon" iconId="add" />
        {t("add-sprite")}
      </button>

      <SpriteLibraryDialog
        isVisible={isSpriteLibraryVisible}
        onSelect={sprite => {
          setIsSpriteLibraryVisible(false)

          project.updateData(
            new TransactionInfo(TransactionType.Update, TransactionCategory.GameObjectProperty, project.activeGameObject.id, "add-sprite", true),
            data => data.gameObjects[project.activeGameObjectIndex].sprites.push(sprite)
          )
        }}
        onCancel={() => setIsSpriteLibraryVisible(false)}
      />
    </div>
  )
}