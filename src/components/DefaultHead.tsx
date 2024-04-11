import useTranslation from "next-translate/useTranslation"
import Head from "next/head"

export default function DefaultHead({ title }: { 
  title?: string 
}) {
  const { t } = useTranslation("common")
  
  return (
    <Head>
      <title>{t("project-name") + (title ? ` - ${title}` : "")}</title>
      <link rel="icon" href="/favicon.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  )
}
