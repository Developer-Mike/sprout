import DefaultHead from "@/components/DefaultHead"
import Icon from "@/components/Icon"
import CodeEditor from "@/components/code_editor/CodeEditor"
import DocumentationView from "@/components/documentation_view/DocumentationView"
import GameObjectsPane from "@/components/game_objects_pane/GameObjectsPane"
import Navbar from "@/components/navbar/Navbar"
import SplitView from "@/components/split_view/SplitView"
import StagePane from "@/components/stage_pane/StagePane"
import TabView from "@/components/tab_view/TabView"
import styles from "@/styles/Builder.module.scss"
import { useState } from "react"

export default function Builder() {
  const [documentationOpen, setDocumentationOpen] = useState(true)
  
  return (
    <>
      <DefaultHead title="Builder" />
      <header>
        <Navbar
          startItems={[
            <span>File</span>
          ]}
          endItems={[
            <div><Icon iconId="play_arrow" /></div>,
            <div><Icon iconId="stop" /></div>,
          ]}
        />
      </header>
      <main className="fullscreen no-scroll">
        <SplitView id={styles.mainSplit} horizontal>
          <div id={styles.documentationContainer} className={documentationOpen ? "" : styles.hidden}>
            <div id={styles.documentationSpacer}>
              <DocumentationView />
            </div>
          </div>
          
          <TabView id={styles.editorsTabView}
            tabs={[
              {
                id: "code",
                label: "Code",
                content: <CodeEditor />
              },
              {
                id: "sprites",
                label: "Sprites",
                content: <div>Sprites</div>
              }
            ]}
            actionButtons={[
              {
                icon: "developer_guide",
                onClick: () => setDocumentationOpen(!documentationOpen)
              }
            ]}
          />

          <div id={styles.rightSplit}>
            <StagePane ratio={16/9} />
            <GameObjectsPane />
          </div>
        </SplitView>
      </main>
    </>
  )
}
