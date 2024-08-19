import { Dialog } from "../dialog/Dialog"
import styles from "./SpriteLibraryDialog.module.scss"
import Project from "@/core/Project"

export default function SpriteLibraryDialog(project: Project): Dialog {
  return {
    id: "sprite-library",
    title: "Sprite Library",
    content: (
      <div id={styles.spriteLibraryDialog}>
        <div id={styles.spriteLibraryList}>
          <div id={styles.spriteLibraryListItem}>
            <div id={styles.spriteLibraryListItemImage}></div>
            <div id={styles.spriteLibraryListItemName}>Sprite Name</div>
          </div>
        </div>
      </div>
    ),
    actions: [
      {
        element: <button className="danger">Cancel</button>,
        onClick: hide => hide()
      },
      {
        element: <button className="primary">Add</button>,
        onClick: hide => { hide(); project.updateData(null, data => { data.gameObjects[project.activeGameObjectIndex].sprites.push(Object.keys(data.sprites)[0]) }) }
      }
    ]
  }
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