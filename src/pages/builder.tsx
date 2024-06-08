import { ProjectContext } from "@/ProjectContext"
import DefaultHead from "@/components/DefaultHead"
import Icon from "@/components/Icon"
import Shortcut from "@/components/Shortcut"
import CodeEditor from "@/components/code_editor/CodeEditor"
import DocumentationView from "@/components/documentation_view/DocumentationView"
import GameObjectsPane from "@/components/game_objects_pane/GameObjectsPane"
import Navbar from "@/components/navbar/Navbar"
import StagePane from "@/components/stage_pane/StagePane"
import TabView from "@/components/tab_view/TabView"
import Project from "@/core/Project"
import styles from "@/styles/Builder.module.scss"
import useTranslation from "next-translate/useTranslation"
import { useEffect, useRef, useState } from "react"

export default function Builder() {
  const { t } = useTranslation("builder")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  Project.registerHooks()
  const [project, _setProject] = useState<Project | null>(null)
  
  useEffect(() => {
    // TODO: Load project data from local storage
    _setProject(Project.loadFromTemplate("debug"))
  }, [])

  useEffect(() => {
    // Allow access to project from the browser console
    (window as any).project = project
  }, [project])

  // Warn user about unsaved changes (except in development mode)
  useEffect(() => {
    window.onbeforeunload = () => {
      if (!project?.unsavedChanges) return
      if (process.env.NODE_ENV === "development") return

      return t("unsaved-changes-warning")
    }
  }, [project, project?.unsavedChanges])

  return (
    <>
      <DefaultHead title={t("common:builder")} />

      { project?.data && <ProjectContext.Provider value={{ project }}>
        <Shortcut ctrl keyName="z" action={() => { project.undo() }} />
        <Shortcut ctrl keyName="y" action={() => { project.redo() }} />
        <Shortcut ctrl keyName="s" action={() => { project.saveToFS() }} />

        { process.env.NODE_ENV !== "development" && <Shortcut keyName="F5" action={() => { project.run(canvasRef.current) }} /> }
        { process.env.NODE_ENV !== "development" && <Shortcut shift keyName="F5" action={() => { project.stop(canvasRef.current) }} /> }
        
        <header>
          <Navbar
            items={[
              {
                element: <input id={styles.projectTitle} className={project.unsavedChanges ? styles.unsavedChanges : ""} value={project.data.title}
                  onChange={(e) => project.updateData(data => { data.title = e.target.value })} />,
                customStyling: true
              },
              {
                element: <span>{t("common:file")}</span>,
                nested: [
                  <span onClick={() => _setProject(Project.loadFromTemplate("empty"))}>{t("common:new")}</span>,
                  <span onClick={async () => _setProject(await Project.loadFromFS(window) || project)}>{t("common:open")}</span>,
                  <span onClick={() => project.saveToFS()}>{t("common:save")}</span>,
                  <span onClick={() => project.exportAsHTML()}>{t("export-as-html")}</span>
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
