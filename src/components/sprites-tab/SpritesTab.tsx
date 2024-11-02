import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/sprites-tab/SpritesTab.module.scss"
import namedSpriteListItemStyles from "@/components/named-sprite-list-item/NamedSpriteListItem.module.scss"
import { useContext, useEffect, useState } from "react"
import NamedSpriteListItem from "../named-sprite-list-item/NamedSpriteListItem"
import Icon from "../Icon"
import useTranslation from "next-translate/useTranslation"
import SpriteLibraryDialog from "../sprite-library-dialog/SpriteLibraryDialog"
import * as DraggableLayout from "../DraggableLayout"
import TransactionInfo, { TransactionCategory, TransactionType } from "@/types/TransactionInfo"

export default function SpritesTab() {
  const { t } = useTranslation("common")
  
  const { project } = useContext(ProjectContext)
  const [isSpriteLibraryVisible, setIsSpriteLibraryVisible] = useState(false)

  useEffect(() => {
    setIsSpriteLibraryVisible(false)
  }, [project, project.selectedGameObjectKey])

  return (
    <div id={styles.spritesTab}>
      <DraggableLayout.Root id={styles.gameObjectSprites} className={styles.spritesGrid}>
        { project.selectedGameObject.sprites.map((sprite, index) => (
          <DraggableLayout.Item key={index} onDraggedClassName={namedSpriteListItemStyles.dragging} onDragged={targetIndex => project.updateData(
            new TransactionInfo(TransactionType.Unique, TransactionCategory.GameObjectProperty, project.selectedGameObjectKey, "reorder-sprites"),
            data => {
              const temp = data.gameObjects[project.selectedGameObjectKey].sprites.splice(index, 1)[0]
              data.gameObjects[project.selectedGameObjectKey].sprites.splice(targetIndex, 0, temp)
            }
          )}>
            <NamedSpriteListItem
              label={sprite}
              src={project.data.sprites[sprite].src}
              onClick={() => project.updateData(
                new TransactionInfo(TransactionType.Update, TransactionCategory.GameObjectProperty, project.selectedGameObjectKey, "active-sprite"),
                data => data.gameObjects[project.selectedGameObjectKey].active_sprite = index
              )}
              isFocused={project.selectedGameObject.active_sprite === index}
              onDelete={() => project.updateData(
                new TransactionInfo(TransactionType.Unique, TransactionCategory.GameObjectProperty, project.selectedGameObjectKey, "remove-sprite"),
                data => {
                  data.gameObjects[project.selectedGameObjectKey].sprites.splice(index, 1)

                  // If the last sprite was removed, set the active sprite to the last one
                  if (data.gameObjects[project.selectedGameObjectKey].active_sprite >= data.gameObjects[project.selectedGameObjectKey].sprites.length)
                    data.gameObjects[project.selectedGameObjectKey].active_sprite = data.gameObjects[project.selectedGameObjectKey].sprites.length - 1
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
            new TransactionInfo(TransactionType.Unique, TransactionCategory.GameObjectProperty, project.selectedGameObjectKey, "add-sprite"),
            data => {
              data.gameObjects[project.selectedGameObjectKey].sprites.push(sprite)

              // If the first sprite was added, set it as the active sprite
              if (data.gameObjects[project.selectedGameObjectKey].sprites.length === 1)
                data.gameObjects[project.selectedGameObjectKey].active_sprite = 0
            }
          )
        }}
        onCancel={() => setIsSpriteLibraryVisible(false)}
      />
    </div>
  )
}