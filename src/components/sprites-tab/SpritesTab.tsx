import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/sprites-tab/SpritesTab.module.scss"
import { useContext, useEffect, useState } from "react"
import NamedSpriteListItem from "../named-sprite-list-item/NamedSpriteListItem"
import Icon from "../Icon"
import useTranslation from "next-translate/useTranslation"
import { DialogContext } from "../dialog/Dialog"
import SpriteLibraryDialog from "../sprite-library-dialog/SpriteLibraryDialog"

export default function SpritesTab() {
  const { t } = useTranslation("common")
  
  const { project } = useContext(ProjectContext)
  const dialog = useContext(DialogContext)

  const [selectedSprite, setSelectedSprite] = useState<string | null>(null)

  return (
    <div id={styles.spritesTab}>
      <div id={styles.gameObjectSprites} className={styles.spritesGrid}>
        { project.activeGameObject.sprites.map((sprite, index) => (
          <NamedSpriteListItem key={index}
            label={sprite}
            src={project.data.sprites[sprite]}
            onClick={() => setSelectedSprite(sprite)}
            isFocused={selectedSprite === sprite}
          />
        )) }
      </div>

      <button id={styles.addSpriteButton} className="primary" onClick={() => dialog.showDialog(SpriteLibraryDialog())}>
        <Icon id={styles.buttonIcon} iconId="add" />
        {t("add-sprite")}
      </button>
    </div>
  )
}