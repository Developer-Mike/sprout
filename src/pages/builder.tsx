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
import Project, { STARTER_PROJECTS } from "@/core/Project"
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
    _setProject(new Project(STARTER_PROJECTS["debug"]))
  }, [])

  useEffect(() => {
    // Allow access to project from the browser console
    (window as any).project = project
  }, [project])

  return (
    <>
     { project !== null && <ProjectContext.Provider value={{ project }}>
        <Shortcut keyName="F5" action={() => { project.run(canvasRef.current) }} />
        <Shortcut shift keyName="F5" action={() => { project.stop(canvasRef.current) }} />

        <DefaultHead title={t("common:builder")} />
        <header>
          <Navbar
            items={[
              {
                element: <span>{t("common:file")}</span>,
                nested: [
                  <span>{t("common:new")}</span>,
                  <span>{t("common:open")}</span>,
                  <span>{t("common:save")}</span>,
                  <span>{t("export-as-html")}</span>
                ]
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
                        project.getActiveGameObject().sprites[
                          project.getActiveGameObject().activeSprite
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
    </>
  )
}
