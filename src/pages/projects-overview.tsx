import DefaultHead from "@/components/DefaultHead"
import Icon from "@/components/Icon"
import Navbar from "@/components/navbar/Navbar"
import Project from "@/core/Project"
import PROJECT_TEMPLATES from "@/core/project-templates/project-templates"
import styles from "@/styles/ProjectsOverview.module.scss"
import { RecentProjectsDB } from "@/types/RecentProjectsDB"
import DBHelper from "@/utils/db-helper"
import { StoreValue } from "idb"
import useTranslation from 'next-translate/useTranslation'
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"

export default function ProjectsOverview() {
  const { t } = useTranslation("projects-overview")
  const router = useRouter()

  const projectTemplates = useMemo(() => { return Object.entries(PROJECT_TEMPLATES).filter(([_key, template]) => template.choosable) }, [])
  const [recentProjects, setRecentProjects] = useState<StoreValue<RecentProjectsDB, "projects">[]>([])

  useEffect(() => { (async () => {
    const recentProjects = await DBHelper.getRecentProjects()
    setRecentProjects(recentProjects)
  })() }, [])

  const openRecentProject = async (id: string) => {
    const hasPermission = await Project.refreshPermissionOfRecentProject(id)
    if (!hasPermission) return
      
    router.push(`/builder?project=${encodeURI(id)}`)
  }

  const openProjectFromFS = async () => {
    const id = await DBHelper.addToRecentFromFS()
    if (!id) return

    router.push(`/builder?project=${encodeURI(id)}`)
  }

  return (
    <>
      <DefaultHead />
      <header>
        <Navbar items={[
          { element: <Link href="/">{t("common:home")}</Link> }
        ]} />
      </header>
      <main id={styles.main}>
        <div className={styles.projectSection}>
          <h1>{t("own-projects")}</h1>

          <div className={styles.projectsGrid}>
            { recentProjects.map(project => (
              <div key={project.id} className={styles.projectCard} onClick={() => openRecentProject(project.id)}>
                <img className={styles.projectThumbnail} src={project.thumbnail} />
                <h2 className={styles.projectTitle}>{project.title}</h2>
              </div>
            )) }

            <div className={`${styles.projectCard} ${styles.unknownProject}`} onClick={openProjectFromFS}>
              <Icon id={styles.icon} iconId="folder_open" />
              <span>{t("common:open-project")}</span>
            </div>

            <div className={`${styles.projectCard} ${styles.unknownProject}`} onClick={() => router.push("/builder?template=empty")}>
              <Icon id={styles.icon} iconId="add" />
              <span>{t("common:new-project")}</span>
            </div>
          </div>
        </div>

        <div className={styles.projectSection}>
          <h1>{t("project-templates")}</h1>

          <div className={styles.projectsGrid}>
            { projectTemplates.map(([key, template]) => (
              <Link key={key} href={`/builder?template=${key}`}>
                <div className={styles.projectCard}>
                  <img className={styles.projectThumbnail} src={template.thumbnail} />
                  <h2 className={styles.projectTitle}>{template.data.title}</h2>
                  <p className={styles.projectDescription}>{template.description}</p>
                </div>
              </Link>
            )) }
          </div>
        </div>
      </main>
    </>
  )
}
