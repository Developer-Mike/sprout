import DefaultHead from "@/components/DefaultHead"
import styles from "@/styles/404.module.scss"

export default function Page404() {
  return (
    <>
      <DefaultHead title="404" />
      <main id={styles.main}>
        <img id={styles.logo} src="/sprout.svg" />
        <h1 id={styles.errorCode}>404</h1>
        <p id={styles.errorMessage}>Looks like nothing grows here</p>
      </main>
    </>
  )
}