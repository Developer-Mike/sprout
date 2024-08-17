import { ProjectContext } from "@/ProjectContext"
import styles from "@/components/sprites-tab/SpritesTab.module.scss"
import { useContext, useEffect, useMemo, useState } from "react"
import NamedSpriteListItem from "../named-sprite-list-item/NamedSpriteListItem"
import Icon from "../Icon"
import useTranslation from "next-translate/useTranslation"
import { DialogContext } from "../dialog/Dialog"

export default function SpritesTab() {
  const { t } = useTranslation("common")
  
  const { project } = useContext(ProjectContext)
  const dialog = useContext(DialogContext)

  const [selectedSprite, setSelectedSprite] = useState<string | null>(null)
  const availableSprites = useMemo(() => {
    return Object.keys(project.data.sprites).filter(sprite => !project.activeGameObject.sprites.includes(sprite))
  }, [project.data.sprites, project.activeGameObject.sprites])

  const nameUploadedSpriteDialog = (fileContent: string) => {
    dialog.showDialog({
      id: "name-uploaded-sprite",
      title: t("name-uploaded-sprite-dialog.title"),
      content: (
        <input placeholder={t("name-uploaded-sprite-dialog.placeholder")} />
      ),
      actions: [
        {
          element: <button className="danger">{t("cancel")}</button>,
          onClick: hide => hide()
        },
        {
          element: <button className="primary">{t("save")}</button>,
          onClick: hide => {
            const input = dialog.getCurrentDialog()?.querySelector("input")
            if (!input) return
            const spriteName = input.value

            // TODO: Check if sprite name is valid and unique

            project.updateData(null, data => {
              data.sprites[spriteName] = fileContent
            })
            hide()
          }
        }
      ]
    })
  }

  useEffect(() => {

  }, [project, project.data.workspace.selectedGameObjectId, project.activeGameObject.sprites, project.activeGameObject.activeSprite, project.data.sprites])

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

      <div id={styles.spritesLibrary}>
        <div id={styles.librarySprites}>
          { availableSprites.map((sprite, index) => (
            <NamedSpriteListItem key={index}
              label={sprite}
              src={project.data.sprites[sprite]}
              onClick={() => setSelectedSprite(sprite)}
              isFocused={selectedSprite === sprite}
            />
          )) }
        </div>

        <div id={styles.uploadSpriteContainer}>
            <label htmlFor="upload-sprite" id={styles.uploadSpriteLabel} className="button primary">
              <Icon iconId="upload" />
            </label>
            <input id="upload-sprite" hidden type="file" accept="image/png" onChange={e => {
              const file = e.target.files?.[0]
              if (!file) return

              const reader = new FileReader()
              reader.onload = () => nameUploadedSpriteDialog(reader.result as string)
              reader.readAsDataURL(file)

              e.target.value = ""
            }} />
        </div>
      </div>
    </div>
  )
}