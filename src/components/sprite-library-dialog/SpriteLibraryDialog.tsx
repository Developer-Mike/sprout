import { useContext, useMemo, useState } from "react"
import styles from "./SpriteLibraryDialog.module.scss"
import dialogStyles from "@/components/dialog/Dialog.module.scss"
import { ProjectContext } from "@/ProjectContext"
import NamedSpriteListItem from "../named-sprite-list-item/NamedSpriteListItem"
import Icon from "../Icon"
import useTranslation from "next-translate/useTranslation"

export default function SpriteLibraryDialog({ onSelect, onCancel }: {
  onSelect: (sprite: string) => void
  onCancel: () => void
}) {
  const { t } = useTranslation("common")
  
  const { project } = useContext(ProjectContext)
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
              />
            )) }
          </div>

           <div id={styles.spritePreview}>
            { !selectedSprite && <div id={styles.noSpriteSelected}>{t("sprite-library-dialog.no-sprite-selected")}</div> }
            { selectedSprite && <div>
              <img id={styles.image} src={project.data.sprites[selectedSprite]} />
            </div> }
          </div>
        </div>

        <div id={styles.actionsContainer}>
          <div id={styles.uploadSpriteContainer}>
            <label htmlFor="upload-sprite" id={styles.uploadSpriteLabel} className="button primary">
              <Icon className="icon" iconId="upload" />
              {t("sprite-library-dialog.upload-sprite")}
            </label>
            <input id="upload-sprite" hidden type="file" accept="image/png" onChange={e => {
              const file = e.target.files?.[0]
              if (!file) return

              const reader = new FileReader()
              reader.onload = () => project.updateData(null, data => {
                const spriteName = file.name.replace(/\.[^/.]+$/, "")
                data.sprites[spriteName] = reader.result as string
                onSelect(spriteName)
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

/*
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

}, [project, project.activeGameObject.sprites, project.activeGameObject.activeSprite, project.data.sprites])

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
*/

/*
 <div id={styles.dialogBackground} className={dialogs.length > 0 ? styles.visible : ""} 
  onClick={(e) => {
    if (e.target !== e.currentTarget) return
    const defaultAction = dialogs[0]?.actions.find(action => action.default)
    defaultAction?.onClick(() => hideDialog(dialogs[0].id))
  }}
>
  <div id={styles.dialog}>
    <h1 id={styles.dialogTitle}>{dialogs[0]?.title}</h1>

    <div>{dialogs[0]?.content}</div>

    <div id={styles.dialogActions}>
      {dialogs[0]?.actions?.map((action, i) =>
        React.cloneElement(
          action.element as React.ReactElement,
          { key: i, onClick: () => action.onClick(() => hideDialog(dialogs[0].id)) }
        )
      )}
    </div>
  </div>
</div>
*/