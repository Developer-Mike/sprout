import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/sprites-tab/SpritesTab.module.scss"
import namedSpriteListItemStyles from "@/components/named-sprite-list-item/NamedSpriteListItem.module.scss"
import { useContext } from "react"
import NamedSpriteListItem from "../named-sprite-list-item/NamedSpriteListItem"
import Icon from "../Icon"
import useTranslation from "next-translate/useTranslation"
import { DialogContext } from "../dialog/Dialog"
import SpriteLibraryDialog from "../sprite-library-dialog/SpriteLibraryDialog"
import DraggableGrid from "../DraggableGrid"
import TransactionInfo, { TransactionCategory, TransactionType } from "@/types/TransactionInfo"

export default function SpritesTab() {
  const { t } = useTranslation("common")
  
  const { project } = useContext(ProjectContext)
  const dialog = useContext(DialogContext)

  return (
    <div id={styles.spritesTab}>
      <DraggableGrid.Root id={styles.gameObjectSprites} className={styles.spritesGrid}>
        { project.activeGameObject.sprites.map((sprite, index) => (
          <DraggableGrid.Item key={index} onDraggedClassName={namedSpriteListItemStyles.dragging} onDragged={targetIndex => project.updateData(
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
          </DraggableGrid.Item>
        )) }
      </DraggableGrid.Root>

      <button id={styles.addSpriteButton} className="primary" onClick={() => dialog.showDialog(SpriteLibraryDialog(project))}>
        <Icon id={styles.buttonIcon} iconId="add" />
        {t("add-sprite")}
      </button>
    </div>
  )
}