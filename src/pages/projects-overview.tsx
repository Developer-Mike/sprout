import DefaultHead from "@/components/DefaultHead"
import Navbar from "@/components/navbar/Navbar"
import styles from "@/styles/ProjectsOverview.module.scss"
import useTranslation from 'next-translate/useTranslation'

export default function ProjectsOverview() {
  const { t } = useTranslation("projects-overview")

  return (
    <>
      <DefaultHead />
      <header>
        <Navbar items={[
          { element: <a href="/">{t("common:home")}</a> }
        ]} />
      </header>
      <main>
        <div className={styles.ownProjects}>
          <h1>{t("own-projects")}</h1>
          <div className={styles.projects}>
            <div className={styles.project}>
              <h2>Project 1</h2>
              <p>Project description</p>
            </div>
            <div className={styles.project}>
              <h2>Project 2</h2>
              <p>Project description</p>
            </div>
          </div>
        </div>

        <div className={styles.projectTemplates}>
          <h1>{t("project-templates")}</h1>
          <div className={styles.projects}>
            <div className={styles.project}>
              <h2>Project Template 1</h2>
              <p>Project template description</p>
            </div>
            <div className={styles.project}>
              <h2>Project Template 2</h2>
              <p>Project template description</p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
