import DefaultHead from "@/components/DefaultHead"
import Navbar from "@/components/navbar/Navbar"
import styles from "@/styles/ProjectsOverview.module.scss"
import { useEffect } from "react"
import useTranslation from 'next-translate/useTranslation'

export default function Home() {
  const { t } = useTranslation("projects-overview")

  return (
    <>
      <DefaultHead />
      <header>
        <Navbar items={[
          { element: <a href="/home">{t("common:home")}</a> }
        ]} />
      </header>
      <main>
        
      </main>
    </>
  )
}
