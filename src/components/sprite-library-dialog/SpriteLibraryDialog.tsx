import { useContext, useEffect, useMemo, useState } from "react"
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

  const [spriteInfo, setSpriteInfo] = useState<{ fileType: string, width: number, height: number, fileSize: number } | null>(null)

  useEffect(() => {
    if (!project.data.workspace.selectedLibrarySpriteId) return
      const base64 = project.data.sprites[project.data.workspace.selectedLibrarySpriteId]

      const image = new Image()
      image.onload = () => setSpriteInfo({ 
        fileType: base64.split(";")[0].split("/")[1],
        width: image.width,
        height: image.height,
        fileSize: Math.ceil((base64.length * (3 / 4)) - 1)
      })
      image.src = base64
  }, [project, project.data.workspace.selectedLibrarySpriteId])

  return (
    <div id={dialogStyles.dialogBackground} className={isVisible ? dialogStyles.visible : undefined}>
      <div id={dialogStyles.dialog} className={styles.spriteLibraryDialog}>
        <h1 id={styles.dialogTitle} className={styles.dialogTitle}>{t("sprite-library-dialog.title")}</h1>

        <div id={styles.spritesLibrary}>
          <div id={styles.librarySprites}>
            { Object.keys(project.data.sprites).map((sprite, index) => (
              <NamedSpriteListItem key={index}
                label={sprite}
                src={project.data.sprites[sprite]}
                onClick={() => project.updateData(null, data => { data.workspace.selectedLibrarySpriteId = sprite })}
                isFocused={project.data.workspace.selectedLibrarySpriteId === sprite}
                onDelete={() => showDialog({
                  id: "delete-sprite-dialog",
                  title: t("delete-sprite-dialog.title"),
                  content: t("delete-sprite-dialog.message", { id: project.data.workspace.selectedLibrarySpriteId }),
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
                            project.data.workspace.selectedLibrarySpriteId, "delete"
                          ),
                          data => {
                            if (!data.workspace.selectedLibrarySpriteId) return
                            delete data.sprites[data.workspace.selectedLibrarySpriteId]

                            // Remove all references to the sprite
                            data.gameObjects = data.gameObjects.map(gameObject => {
                              gameObject.sprites = gameObject.sprites.filter(sprite => sprite != data.workspace.selectedLibrarySpriteId)

                              // If the last sprite was removed and active, set the active sprite to the last one
                              if (gameObject.activeSprite >= gameObject.sprites.length) {
                                gameObject.activeSprite = gameObject.sprites.length - 1
                              }

                              return gameObject
                            })

                            data.workspace.selectedLibrarySpriteId = null
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
            { !project.data.workspace.selectedLibrarySpriteId && <div id={styles.noSpriteSelected}>{t("sprite-library-dialog.no-sprite-selected")}</div> }
            { project.data.workspace.selectedLibrarySpriteId && <div>
              <img id={styles.image} src={project.data.sprites[project.data.workspace.selectedLibrarySpriteId]} />
              <LabeledTextInput label={t("id")} value={project.data.workspace.selectedLibrarySpriteId}
                makeValid={value => IdHelper.makeIdValid(value)}
                isValidValue={value => IdHelper.isValidId(value, Object.keys(project.data.sprites).filter(id => project.data.workspace.selectedLibrarySpriteId != id))}
                onChange={value => {
                  const newId = value.trim()
                  if (newId === project.data.workspace.selectedLibrarySpriteId) return

                  // TODO: Fix fast typing loosing reference

                  project.updateData(
                    new TransactionInfo(
                      TransactionInfo.getType(project.data.workspace.selectedLibrarySpriteId, newId),
                      TransactionCategory.SpriteLibrary,
                      project.data.workspace.selectedLibrarySpriteId, "id"
                    ),
                    data => {
                      if (!data.workspace.selectedLibrarySpriteId) return

                      data.sprites[newId] = data.sprites[data.workspace.selectedLibrarySpriteId]
                      delete data.sprites[data.workspace.selectedLibrarySpriteId]

                      data.workspace.selectedLibrarySpriteId = newId
                    }
                  )
                }}
              />

              <div id={styles.spriteInfo}>
                <div><span>{t("file-type")}</span><span>{spriteInfo?.fileType}</span></div>
                <div><span>{t("resolution")}</span><span>{spriteInfo?.width}x{spriteInfo?.height}</span></div>
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
              reader.onload = () => project.updateData(null, data => {
                // TODO: Resize image
                // TODO: Don't close dialog
                
                const spriteName = IdHelper.generateId(t("default-sprite-id"), Object.keys(data.sprites))
                data.sprites[spriteName] = reader.result as string

                project.updateData(null, data => { data.workspace.selectedLibrarySpriteId = spriteName })
              })
              reader.readAsDataURL(file)

              e.target.value = ""
            }} />
          </div>
          
          <div id={styles.dialogActions}>
            <button onClick={onCancel}>{t("cancel")}</button>
            <button className="primary" disabled={project.data.workspace.selectedLibrarySpriteId === null} 
              onClick={() => project.data.workspace.selectedLibrarySpriteId && onSelect(project.data.workspace.selectedLibrarySpriteId)}
            >
              {t("sprite-library-dialog.add-sprite")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}