import { ProjectContext } from "@/ProjectContext"
import DefaultHead from "@/components/DefaultHead"
import Icon from "@/components/Icon"
import KeyboardShortcut from "@/components/KeyboardShortcut"
import CodeEditor from "@/components/code-editor/CodeEditor"
import { DialogContext } from "@/components/dialog/Dialog"
import DocumentationView from "@/components/documentation-view/DocumentationView"
import GameObjectsPane from "@/components/game-objects-pane/GameObjectsPane"
import Navbar from "@/components/navbar/Navbar"
import StagePane from "@/components/stage-pane/StagePane"
import TabView from "@/components/tab-view/TabView"
import Project from "@/core/Project"
import styles from "@/styles/Builder.module.scss"
import useTranslation from "next-translate/useTranslation"
import { useRouter } from "next/router"
import { useContext, useEffect, useRef, useState } from "react"

export default function Builder() {
  const { t } = useTranslation("builder")
  const router = useRouter()

  const dialog = useContext(DialogContext)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  Project.registerHooks()
  const [project, _setProject] = useState<Project | null>(null)

  const showInvalidProjectDialog = (path: string) => {
    dialog.showDialog({
      id: "invalid-project-path",
      title: t("invalid-project-path-dialog.title"),
      content: t("invalid-project-path-dialog.message", { path: path }),
      actions: [
        {
          default: true,
          element: <button className="primary">{t("invalid-project-path-dialog.return-to-overview")}</button>,
          onClick: hide => {
            hide()
            router.push("/projects-overview")
          }
        }
      ]
    })
  }
  
  useEffect(() => { (async () => {
    if (!router.isReady) return

    const projectPath = router.query.project as string | undefined
    const projectTemplate = router.query.template as string | undefined

    if (!projectPath && !projectTemplate) {
      router.push("/projects-overview")
      return
    }

    if (projectTemplate) {
      let project = Project.loadFromTemplate(projectTemplate)
      if (!project) project = Project.loadFromTemplate("empty")

      _setProject(project)
    } else if (projectPath) {
      // TODO: Show dialog for user gesture if the project was directly opened by the link without visiting the projects overview page
      // TODO: Show invalid project dialog if the file isn't a valid project
      // TODO: Redirect back if the project doesn't exist
      const project = await Project.loadFromRecent(projectPath)
      
      if (project) _setProject(project)
      else router.push("/projects-overview") // TODO: showInvalidProjectDialog(projectPath)
    }
  })() }, [router.query])

  useEffect(() => {
    // Allow access to project from the browser console
    (window as any).project = project

    // Set up autosave interval
    const uninstallAutosave = project?.createAutosaveInterval(canvasRef)

    // Warn user about unsaved changes (except in development mode)
    window.onbeforeunload = () => {
      if (!project?.unsavedChanges) return
      if (process.env.NODE_ENV === "development") return

      return t("unsaved-changes-warning")
    }

    return uninstallAutosave
  }, [project])

  useEffect(() => {
  }, [project])

  return (
    <>
      <DefaultHead title={t("common:builder")} />

      { project?.data && <ProjectContext.Provider value={{ project }}>
        <KeyboardShortcut ctrl keyName="z" action={() => project.undo()} />
        <KeyboardShortcut ctrl keyName="y" action={() => project.redo()} />
        <KeyboardShortcut ctrl keyName="s" action={() => project.saveToFS()} />

        { process.env.NODE_ENV !== "development" && <KeyboardShortcut keyName="F5" action={() => { project.run(canvasRef.current) }} /> }
        { process.env.NODE_ENV !== "development" && <KeyboardShortcut shift keyName="F5" action={() => { project.stop(canvasRef.current) }} /> }
        
        <header>
          <Navbar
            items={[
              {
                element: <input id={styles.projectTitle} className={project.unsavedChanges ? styles.unsavedChanges : ""} value={project.data.title}
                  onChange={(e) => project.updateData(null, data => { data.title = e.target.value })} />,
                customStyling: true
              },
              {
                element: <span>{t("common:file")}</span>,
                nested: [
                  <span onClick={() => router.push("/builder?template=empty")}>{t("common:new")}</span>,
                  <span onClick={() => router.push("/projects-overview")}>{t("common:open")}</span>,
                  <span onClick={() => project.saveToFS()}>{t("common:save")}</span>,
                  <span onClick={() => project.exportAsHTML()}>{t("export-as-html")}</span>
                ]
              },
              {
                element: <span>{t("common:edit")}</span>,
                nested: [
                  <span onClick={() => project.undo()}>{t("common:undo")}</span>,
                  <span onClick={() => project.redo()}>{t("common:redo")}</span>,
                ]
              },
              {
                element: <span id={styles.saving} className={project.isSaving ? styles.triggered : ""}>
                  {t("common:saving")}
                </span>,
                customStyling: true,
                align: "end"
              },
              {
                element: <div
                  onClick={() => { project.run(canvasRef.current) }}
                  className={project.isRunning ? styles.running : ""}
                ><Icon iconId="play_arrow" /></div>,
                align: "end"
              },
              {
                element: <div
                  onClick={() => { project.stop(canvasRef.current) }}
                  className={project.isRunning ? "" : styles.stopped}
                ><Icon iconId="stop" /></div>,
                align: "end"
              }
            ]}
          />
        </header>
        <main id={styles.mainSplit} className="fullscreen no-scroll">
          <TabView id={styles.leftTabView}
            vertical={true}
            collapsible={true}
            tabs={[
              {
                id: "documentation",
                icon: "developer_guide",
                content: <DocumentationView />
              },
              {
                id: "plugins",
                icon: "extension",
                content: <div>Plugins</div>
              }
            ]}
          />
          
          <TabView id={styles.editorsTabView}
            tabs={[
              {
                id: "code",
                label: t("common:code"),
                content: (
                  <div id={styles.codeEditorContainer}>
                    <CodeEditor />
                    <img id={styles.gameObjectPreview} 
                      src={project.data.sprites[
                        project.activeGameObject.sprites[
                          project.activeGameObject.activeSprite
                        ]
                      ]}
                    />
                  </div>
                )
              },
              {
                id: "sprites",
                label: t("common:sprite", { count: 0 }),
                content: <div>Sprites</div>
              }
            ]}
          />

          <div id={styles.rightSplit}>
            <StagePane canvasRef={canvasRef} />
            <GameObjectsPane />
          </div>
        </main>
      </ProjectContext.Provider> }

      { project?.isLoading && <div id={styles.loadingOverlay}>
        <div className="loader" />
      </div> }
    </>
  )
}