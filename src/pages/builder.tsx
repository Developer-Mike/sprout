import { ProjectContext } from "@/ProjectContext"
import DefaultHead from "@/components/DefaultHead"
import Icon from "@/components/Icon"
import KeyboardShortcut from "@/components/KeyboardShortcut"
import CodeEditor from "@/components/code-editor/CodeEditor"
import { DialogContext } from "@/components/dialog/Dialog"
import DocumentationView from "@/components/documentation-view/DocumentationView"
import GameObjectsPane from "@/components/game-objects-pane/GameObjectsPane"
import Navbar from "@/components/navbar/Navbar"
import SpritesTab from "@/components/sprites-tab/SpritesTab"
import StagePane from "@/components/stage-pane/StagePane"
import TabView from "@/components/tab-view/TabView"
import { DEBUG_BYPASS_SAVE_ALERT } from "@/constants"
import Project, { useProjectHooks } from "@/core/Project"
import styles from "@/styles/Builder.module.scss"
import { ExtendedWindow } from "@/types/ExtendedWindow"
import DBHelper from "@/utils/db-helper"
import useTranslation from "next-translate/useTranslation"
import { useRouter } from "next/router"
import { useContext, useEffect, useRef, useState } from "react"

export default function Builder() {
  const { t } = useTranslation("builder")
  const router = useRouter()

  const dialog = useContext(DialogContext)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const projectHooks = useProjectHooks()
  Project.registerHooks(projectHooks)
  const [project, _setProject] = useState<Project | null>(null)

  const showInvalidProjectDialog = (projectId: string) => {
    dialog.showDialog({
      id: "project-not-found-dialog",
      title: t("project-not-found-dialog.title"),
      content: t("project-not-found-dialog.message"),
      actions: [
        {
          element: <button>{t("project-not-found-dialog.remove-from-list")}</button>,
          onClick: hide => {
            hide()
            DBHelper.removeRecentProject(projectId)
            router.push("/projects-overview")
          }
        },
        {
          default: true,
          element: <button className="primary">{t("common:close")}</button>,
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

    const projectId = router.query.project as string | undefined
    const projectTemplate = router.query.template as string | undefined

    if (!projectId && !projectTemplate) {
      router.push("/projects-overview")
      return
    }

    if (projectTemplate) {
      let project = Project.loadFromTemplate(projectTemplate)
      if (!project) project = Project.loadFromTemplate("empty")

      _setProject(project)
    } else if (projectId) {
      const project = await Project.loadFromRecent(projectId)
      
      if (project) _setProject(project)
      else showInvalidProjectDialog(projectId)
    }
  })() }, [router.isReady])

  useEffect(() => {
    // Allow access to project from the browser console
    (window as ExtendedWindow).project = project

    // Set up autosave interval
    const uninstallAutosave = project?.createAutosaveInterval(canvasRef)

    // Warn user about unsaved changes (except in development mode)
    window.onbeforeunload = () => {
      if (!project?.unsavedChanges) return
      if (DEBUG_BYPASS_SAVE_ALERT) return

      return t("unsaved-changes-warning")
    }

    return uninstallAutosave
  }, [project])

  useEffect(() => {
    if (!project?.fileHandler || !project.projectId) return
    if (router.query.project) return

    // Update the URL with the project id
    router.replace(router.pathname, `/builder?project=${project.projectId}`)
  }, [project, project?.fileHandler, project?.projectId])

  return (
    <>
      <DefaultHead title={t("common:builder")} />

      { project?.data && <ProjectContext.Provider value={{ project }}>
        <KeyboardShortcut ctrl keyName="z" action={() => project.undo()} />
        <KeyboardShortcut ctrl keyName="y" action={() => project.redo()} />
        <KeyboardShortcut ctrl keyName="s" action={() => project.saveToFS(canvasRef.current)} />

        { process.env.NODE_ENV !== "development" && <KeyboardShortcut keyName="F5" action={() => { project.run(canvasRef.current) }} /> }
        { process.env.NODE_ENV !== "development" && <KeyboardShortcut shift keyName="F5" action={() => { project.stop(canvasRef.current) }} /> }
        
        <header>
          <Navbar
            onReroutingHome={async () => await project.saveToFS(canvasRef.current, true)}
            items={[
              {
                element: <input id={styles.projectTitle} className={project.unsavedChanges ? styles.unsavedChanges : ""} value={project.data.title}
                  onChange={(e) => project.updateData(null, data => { data.title = e.target.value })} />,
                customStyling: true
              },
              {
                element: <span>{t("common:file")}</span>,
                nested: [
                  <span key={0} onClick={() => router.push("/builder?template=empty")}>{t("common:new")}</span>,
                  <span key={1} onClick={() => router.push("/projects-overview")}>{t("common:open")}</span>,
                  <span key={2} onClick={() => project.saveToFS(canvasRef.current)}>{t("common:save")}</span>
                ]
              },
              {
                element: <span>{t("common:edit")}</span>,
                nested: [
                  <span key={0} onClick={() => project.undo()}>{t("common:undo")}</span>,
                  <span key={1} onClick={() => project.redo()}>{t("common:redo")}</span>,
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
                ><Icon iconId={project.isRunning ? "resume" : "play_arrow"} /></div>,
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
                noPadding: true,
                content: <CodeEditor />
              },
              {
                id: "sprites",
                label: t("common:sprite", { count: 0 }),
                content: <SpritesTab />
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