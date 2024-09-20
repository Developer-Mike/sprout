import { useContext, useEffect, useState } from "react"
import styles from "./SpriteLibraryDialog.module.scss"
import dialogStyles from "@/components/dialog/Dialog.module.scss"
import { ProjectContext } from "@/ProjectContext"
import NamedSpriteListItem from "../named-sprite-list-item/NamedSpriteListItem"
import Icon from "../Icon"
import useTranslation from "next-translate/useTranslation"
import LabeledTextInput from "../labeled-input/LabeledTextInput"
import IdHelper from "@/utils/id-helper"
import TransactionInfo, { TransactionCategory, TransactionType } from "@/types/TransactionInfo"
import { DialogContext } from "../dialog/Dialog"

export default function SpriteLibraryDialog({ isVisible, onSelect, onCancel }: {
  isVisible: boolean
  onSelect: (sprite: string) => void
  onCancel: () => void
}) {
  const { t } = useTranslation("common")
  
  const { project } = useContext(ProjectContext)
  const { showDialog } = useContext(DialogContext)

  const [spriteInfo, setSpriteInfo] = useState<{ fileType: string, fileSize: number } | null>(null)

  useEffect(() => {
    if (!project.data.workspace.selectedLibrarySpriteKey) return
      const base64 = project.data.sprites[project.data.workspace.selectedLibrarySpriteKey].src

      setSpriteInfo({
        fileType: base64.split(";")[0].split("/")[1],
        fileSize: Math.ceil((base64.length * (3 / 4)) - 1)
      })
  }, [project, project.data.workspace.selectedLibrarySpriteKey])

  return (
    <div id={dialogStyles.dialogBackground} className={isVisible ? dialogStyles.visible : undefined}>
      <div id={dialogStyles.dialog} className={styles.spriteLibraryDialog}>
        <h1 id={styles.dialogTitle} className={styles.dialogTitle}>{t("sprite-library-dialog.title")}</h1>

        <div id={styles.spritesLibrary}>
          <div id={styles.librarySprites}>
            { Object.keys(project.data.sprites).map((sprite, index) => (
              <NamedSpriteListItem key={index}
                label={sprite}
                src={project.data.sprites[sprite].src}
                onClick={() => project.updateData(null, data => { data.workspace.selectedLibrarySpriteKey = sprite })}
                isFocused={project.data.workspace.selectedLibrarySpriteKey === sprite}
                onDelete={() => showDialog({
                  id: "delete-sprite-dialog",
                  title: t("delete-sprite-dialog.title"),
                  content: t("delete-sprite-dialog.message", { id: project.data.workspace.selectedLibrarySpriteKey }),
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
                            TransactionCategory.SpriteLibrary,
                            project.data.workspace.selectedLibrarySpriteKey, "delete"
                          ),
                          data => {
                            if (!data.workspace.selectedLibrarySpriteKey) return
                            delete data.sprites[data.workspace.selectedLibrarySpriteKey]

                            // Remove all references to the sprite
                            for (const gameObject of Object.values(data.gameObjects)) {
                              gameObject.sprites = gameObject.sprites
                                .filter(sprite => sprite != data.workspace.selectedLibrarySpriteKey)

                              // If the last sprite was removed and active, set the active sprite to the last one
                              if (gameObject.active_sprite >= gameObject.sprites.length)
                                gameObject.active_sprite = gameObject.sprites.length - 1
                            }

                            data.workspace.selectedLibrarySpriteKey = null
                          }
                        )
                      }
                    }
                  ]
                })}
              />
            )) }
          </div>

           <div id={styles.spritePreview}>
            { !project.data.workspace.selectedLibrarySpriteKey && <div id={styles.noSpriteSelected}>{t("sprite-library-dialog.no-sprite-selected")}</div> }
            { project.data.workspace.selectedLibrarySpriteKey && <div>
              <img id={styles.image} src={project.data.sprites[project.data.workspace.selectedLibrarySpriteKey].src} />
              <LabeledTextInput label={t("id")} value={project.data.workspace.selectedLibrarySpriteKey}
                makeValid={value => IdHelper.makeIdValid(value)}
                isValidValue={value => IdHelper.isValidId(value, Object.keys(project.data.sprites).filter(id => project.data.workspace.selectedLibrarySpriteKey != id))}
                onChange={value => {
                  const newId = value.trim()
                  if (newId === project.data.workspace.selectedLibrarySpriteKey) return

                  project.updateData(
                    new TransactionInfo(
                      TransactionInfo.getType(project.data.workspace.selectedLibrarySpriteKey, newId),
                      TransactionCategory.SpriteLibrary,
                      project.data.workspace.selectedLibrarySpriteKey, "id"
                    ),
                    data => {
                      if (!data.workspace.selectedLibrarySpriteKey) return
                      const oldId = data.workspace.selectedLibrarySpriteKey

                      // Update library sprite key
                      data.sprites[newId] = data.sprites[oldId]
                      delete data.sprites[oldId]

                      // Update all references to the sprite
                      for (const gameObject of Object.values(data.gameObjects)) {
                        gameObject.sprites = gameObject.sprites.map(sprite => sprite === oldId ? newId : sprite)
                      }

                      // Update selected sprite key
                      data.workspace.selectedLibrarySpriteKey = newId
                    }
                  )
                }}
              />

              <div id={styles.spriteInfo}>
                <div><span>{t("file-type")}</span><span>{spriteInfo?.fileType}</span></div>
                <div><span>{t("resolution")}</span><span>{project.data.sprites[project.data.workspace.selectedLibrarySpriteKey].width}x{project.data.sprites[project.data.workspace.selectedLibrarySpriteKey].height}</span></div>
                <div><span>{t("file-size")}</span><span>~{spriteInfo?.fileSize} {t("size-unit.byte", { count: spriteInfo?.fileSize })}</span></div>
              </div>
            </div> }
          </div>
        </div>

        <div id={styles.actionsContainer}>
          <div id={styles.uploadSpriteContainer}>
            <label htmlFor="upload-sprite" id={styles.uploadSpriteLabel} className="button primary">
              <Icon className="icon" iconId="upload" />
              {t("sprite-library-dialog.upload-sprite")}
            </label>
            <input id="upload-sprite" hidden type="file" accept="image/*" onChange={e => {
              const file = e.target.files?.[0]
              if (!file) return

              const reader = new FileReader()
              reader.onload = () => {
                const spriteName = IdHelper.generateId(t("default-sprite-id"), Object.keys(project.data.sprites))

                // Resize image
                let image = new Image()
                image.src = reader.result as string

                image.onload = () => {
                  project.updateData(null, data => {
                    data.sprites[spriteName] = {
                      src: image.src,
                      width: image.width,
                      height: image.height
                    }

                    // Select the new sprite
                    data.workspace.selectedLibrarySpriteKey = spriteName
                  })
                }
              }
              reader.readAsDataURL(file)

              e.target.value = ""
            }} />
          </div>
          
          <div id={styles.dialogActions}>
            <button onClick={onCancel}>{t("cancel")}</button>
            <button className="primary" disabled={project.data.workspace.selectedLibrarySpriteKey === null} 
              onClick={() => project.data.workspace.selectedLibrarySpriteKey && onSelect(project.data.workspace.selectedLibrarySpriteKey)}
            >
              {t("sprite-library-dialog.add-sprite")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}