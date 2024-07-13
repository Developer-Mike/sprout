import DefaultHead from "@/components/DefaultHead"
import Navbar from "@/components/navbar/Navbar"
import styles from "@/styles/Home.module.scss"
import { useEffect } from "react"
import useTranslation from 'next-translate/useTranslation'
import Link from "next/link"

export default function Home() {
  const { t } = useTranslation("home")
  
  useEffect(() => {
    const logo = document.getElementById(styles.logo)
    const logoMask = document.getElementById(styles.logoMask)
    if (!logo || !logoMask) return

    const onMouseMove = (e: MouseEvent) => {
      const relX = e.clientX - logo.offsetLeft
      const relY = e.clientY - logo.offsetTop

      logoMask.style.left = `${relX}px`
      logoMask.style.top = `${relY}px`
    }

    document.addEventListener("mousemove", onMouseMove)

    return () => { document.removeEventListener("mousemove", onMouseMove) }
  }, [])

  return (
    <>
      <DefaultHead />
      <header>
        <Navbar items={[
          { element: <Link href="/builder">{t("common:builder")}</Link> }
        ]} />
      </header>
      <main>
        <section id={styles.hero} className="fullscreen">
          <div id={styles.logo}>
            <img src="/sprout.svg" alt="Sprout logo" />
            <div id={styles.logoMask} />
          </div>

          <h1 id={styles.sprout}>{t("common:project-name")}</h1>
          <h2 id={styles.slogan}>{t("slogan")}</h2>
          <Link id={styles.cta} href="/builder?template=empty"><button className="primary">{t("start-building")}</button></Link>
        </section>
      </main>
    </>
  )
}
