import DefaultHead from "@/components/DefaultHead"
import Navbar from "@/components/navbar/Navbar"
import styles from "@/styles/Home.module.scss"
import { useEffect } from "react"
import useTranslation from 'next-translate/useTranslation'
import Link from "next/link"
import Icon from "@/components/Icon"

const HIGHLIGHT_CURSOR_OFFSET_SENSITIVITY = 0.01
const HIGHLIGHT_MAX_OFFSET = 20

export default function Home() {
  const { t } = useTranslation("home")
  
  // Glow effect on logo
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

  // Highlight move effect on features
  useEffect(() => {
    const highlightContainers = document.getElementsByClassName(styles.highlightContainer)
    if (!highlightContainers.length) return

    const onMouseMove = (e: MouseEvent) => {
      Array.prototype.forEach.call(highlightContainers, (highlightContainer: HTMLImageElement, i: number) => {
        const highlightImage = highlightContainer.querySelector(`.${styles.highlightImage}`) as HTMLImageElement
        if (!highlightImage) return

        const centerX = highlightImage.offsetLeft + highlightImage.width / 2
        const centerY = highlightImage.offsetTop + highlightImage.height / 2

        const cursorHighlightOffsetX = (e.clientX - centerX) * HIGHLIGHT_CURSOR_OFFSET_SENSITIVITY
        const cursorHighlightOffsetY = (e.clientY - centerY) * HIGHLIGHT_CURSOR_OFFSET_SENSITIVITY

        let highlightOffsetX = Math.min(HIGHLIGHT_MAX_OFFSET, Math.max(-HIGHLIGHT_MAX_OFFSET, cursorHighlightOffsetX))
        let highlightOffsetY = Math.min(HIGHLIGHT_MAX_OFFSET, Math.max(-HIGHLIGHT_MAX_OFFSET, cursorHighlightOffsetY))

        if (i % 2 === 0) {
          highlightOffsetX *= -1
          highlightOffsetY *= -1
        }

        highlightContainer.style.transform = `translate(${highlightOffsetX}px, ${highlightOffsetY}px)`
      })
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
      <main id={styles.main}>
        <section id={styles.hero} className="fullscreen">
          <div id={styles.logo}>
            <img src="/sprout.svg" alt="Sprout logo" />
            <div id={styles.logoMask} />
          </div>

          <h1 id={styles.sprout}>{t("common:project-name")}</h1>
          <h2 id={styles.slogan}>{t("slogan")}</h2>
          <Link id={styles.cta} href="/builder?template=empty"><button className="primary">{t("start-building")}</button></Link>
        </section>
        <section id={styles.features}>
          { (t("features", {}, { returnObjects: true }) as Array<Record<string, string>>).map((feature, i) => (
            <div className={styles.feature} key={i}>
              <Icon iconId={feature.icon} />
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>

              <div className={styles.imageContainer}>
                <img className={styles.backgroundImage} src={feature.background} alt={feature.title} />

                <div className={styles.highlightContainer}>
                  <img className={styles.highlightImage} style={{ transform: feature.highlightTransform }} 
                    src={feature.highlight} alt={feature.title} />
                </div>
              </div>
            </div>
          )) }
        </section>
      </main>
    </>
  )
}
