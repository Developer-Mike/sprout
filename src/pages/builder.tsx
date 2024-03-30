import { ProjectContext } from "@/ProjectContext"
import useProperty from "@/ReactiveProperty"
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
  const [isRunning, setIsRunning] = useState(false)
  const [project, setProject] = useState<Project | null>(null)
  const [documentationLeafVisible, setDocumentationLeafVisible] = useProperty(project?.data.workspace, "documentationLeafVisible")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    // TODO: Load project data from local storage
    setProject(new Project(STARTER_PROJECTS["debug"], setIsRunning))
  }, [])
  
  return (
    <>
     { project !== null && <ProjectContext.Provider value={project}>
        <DefaultHead title={t("common:builder")} />
        <header>
          <Navbar
            startItems={[
              <span>{t("common:file")}</span>
            ]}
            endItems={[
              <div
                onClick={() => { if (!isRunning && project && canvasRef.current) project.run(canvasRef.current) }}
                className={isRunning ? styles.running : ""}
              ><Icon iconId="play_arrow" /></div>,
              
              <div
                onClick={() => { if (isRunning && project && canvasRef.current) project.stop(canvasRef.current) }}
                className={isRunning ? "" : styles.stopped}
              ><Icon iconId="stop" /></div>,
            ]}
          />
        </header>
        <main className="fullscreen no-scroll">
          <SplitView id={styles.mainSplit} horizontal>
            <div id={styles.documentationContainer} className={documentationLeafVisible ? "" : styles.hidden}>
              <div id={styles.documentationSpacer}>
                <DocumentationView />
              </div>
            </div>
            
            <TabView id={styles.editorsTabView}
              tabs={[
                {
                  id: "code",
                  label: t("common:code"),
                  content: <CodeEditor />
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
                  onClick: () => setDocumentationLeafVisible(!documentationLeafVisible)
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
