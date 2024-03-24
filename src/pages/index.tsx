import DefaultHead from "@/components/DefaultHead"
import Navbar from "@/components/navbar/Navbar"
import styles from "@/styles/Home.module.scss"
import { useEffect } from "react"

export default function Home() {
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
      <DefaultHead title="Create" />
      <header>
        <Navbar startItems={[
          <a href="/builder">Builder</a>,
        ]} />
      </header>
      <main>
        <section id={styles.hero} className="fullscreen">
          <div id={styles.logo}>
            <img src="/sprout.svg" alt="Sprout logo" />
            <div id={styles.logoMask} />
          </div>

          <h1 id={styles.sprout}>Sprout</h1>
          <h2 id={styles.slogan}>The low-code platform for learning game development</h2>
          <a id={styles.cta} href="/builder"><button className="primary">Start building</button></a>
        </section>
      </main>
    </>
  )
}
