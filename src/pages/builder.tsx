import { ProjectContext } from "@/ProjectContext"
import DefaultHead from "@/components/DefaultHead"
import Icon from "@/components/Icon"
import CodeEditor from "@/components/code_editor/CodeEditor"
import DocumentationView from "@/components/documentation_view/DocumentationView"
import GameObjectsPane from "@/components/game_objects_pane/GameObjectsPane"
import Navbar from "@/components/navbar/Navbar"
import SplitView from "@/components/split_view/SplitView"
import StagePane from "@/components/stage_pane/StagePane"
import TabView from "@/components/tab_view/TabView"
import Project, { STARTER_PROJECTS } from "@/core/Project"
import styles from "@/styles/Builder.module.scss"
import useTranslation from "next-translate/useTranslation"
import { useEffect, useRef, useState } from "react"

export default function Builder() {
  const { t } = useTranslation("builder")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  Project.createStates()
  const [project, _setProject] = useState<Project | null>(null)
  
  useEffect(() => {
    // TODO: Load project data from local storage
    _setProject(new Project(STARTER_PROJECTS["debug"]))
  }, [])

  return (
    <>
     { project !== null && <ProjectContext.Provider value={{ project }}>
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
                  onClick={() => { if (project && !project.data.workspace.isRunning && canvasRef.current) project.run(canvasRef.current) }}
                  className={project.data.workspace.isRunning ? styles.running : ""}
                ><Icon iconId="play_arrow" /></div>,
                align: "end"
              },
              {
                element: <div
                  onClick={() => { if (project.data.workspace.isRunning && project && canvasRef.current) project.stop(canvasRef.current) }}
                  className={project.data.workspace.isRunning ? "" : styles.stopped}
                ><Icon iconId="stop" /></div>,
                align: "end"
              }
            ]}
          />
        </header>
        <main className="fullscreen no-scroll">
          <SplitView id={styles.mainSplit} horizontal>
            <div id={styles.documentationContainer} className={project.data.workspace.documentationLeafVisible ? "" : styles.hidden}>
              <div id={styles.documentationSpacer}>
                <DocumentationView />
              </div>
            </div>
            
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
              actionButtons={[
                {
                  icon: "developer_guide",
                  onClick: () => project.setData(data => { 
                    data.workspace.documentationLeafVisible = !data.workspace.documentationLeafVisible 
                  })
                }
              ]}
            />

            <div id={styles.rightSplit}>
              <StagePane canvasRef={canvasRef} />
              <GameObjectsPane />
            </div>
          </SplitView>
        </main>
      </ProjectContext.Provider> }
    </>
  )
}
