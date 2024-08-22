import { useContext, useMemo, useState } from "react"
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

export default function SpriteLibraryDialog({ onSelect, onCancel }: {
  onSelect: (sprite: string) => void
  onCancel: () => void
}) {
  const { t } = useTranslation("common")
  
  const { project } = useContext(ProjectContext)
  const { showDialog } = useContext(DialogContext)

  const [selectedSprite, setSelectedSprite] = useState<string | null>(null)

  const availableSprites = useMemo(() => {
    return Object.keys(project.data.sprites).filter(sprite => !project.activeGameObject.sprites.includes(sprite))
  }, [project.data.sprites, project.activeGameObject.sprites])

  return (
    <div id={dialogStyles.dialogBackground} className={dialogStyles.visible}>
      <div id={dialogStyles.dialog} className={styles.spriteLibraryDialog}>
        <h1 id={styles.dialogTitle} className={styles.dialogTitle}>{t("sprite-library-dialog.title")}</h1>

        <div id={styles.spritesLibrary}>
          <div id={styles.librarySprites}>
            { availableSprites.map((sprite, index) => (
              <NamedSpriteListItem key={index}
                label={sprite}
                src={project.data.sprites[sprite]}
                onClick={() => setSelectedSprite(sprite)}
                isFocused={selectedSprite === sprite}
                onDelete={() => showDialog({
                  id: "delete-sprite-dialog",
                  title: t("delete-sprite-dialog.title"),
                  content: t("delete-sprite-dialog.message", { id: selectedSprite }),
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
                            selectedSprite, "delete"
                          ),
                          data => {
                            if (!selectedSprite) return

                            delete data.sprites[selectedSprite]

                            // Remove all references to the sprite
                            data.gameObjects = data.gameObjects.map(gameObject => {
                              gameObject.sprites = gameObject.sprites.filter(sprite => sprite != selectedSprite)

                              // If the last sprite was removed and active, set the active sprite to the last one
                              if (gameObject.activeSprite >= gameObject.sprites.length) {
                                gameObject.activeSprite = gameObject.sprites.length - 1
                              }

                              return gameObject
                            })

                            setSelectedSprite(null)
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
            { !selectedSprite && <div id={styles.noSpriteSelected}>{t("sprite-library-dialog.no-sprite-selected")}</div> }
            { selectedSprite && <div>
              <img id={styles.image} src={project.data.sprites[selectedSprite]} />
              <LabeledTextInput label={t("id")} value={selectedSprite}
                makeValid={value => IdHelper.makeIdValid(value)}
                isValidValue={value => IdHelper.isValidId(value, Object.keys(project.data.sprites).filter(sprite => selectedSprite != sprite))}
                onChange={value => {
                  const newId = value.trim()

                  // TODO: Fix fast typing loosing reference

                  project.updateData(
                    new TransactionInfo(
                      TransactionInfo.getType(selectedSprite, newId),
                      TransactionCategory.SpriteLibrary,
                      selectedSprite, "id"
                    ),
                    data => {
                      data.sprites[newId] = data.sprites[selectedSprite]
                      delete data.sprites[selectedSprite]
                    }
                  )

                  setSelectedSprite(newId)
                }}
              />
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

                setSelectedSprite(spriteName)
              })
              reader.readAsDataURL(file)

              e.target.value = ""
            }} />
          </div>
          
          <div id={styles.dialogActions}>
            <button onClick={onCancel}>{t("cancel")}</button>
            <button className="primary" disabled={selectedSprite === null} onClick={() => selectedSprite && onSelect(selectedSprite)}>{t("sprite-library-dialog.add-sprite")}</button>
          </div>
        </div>
      </div>
    </div>
  )
}