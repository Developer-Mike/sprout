import Head from "next/head"

export default function DefaultHead({ title }: { 
  title: string 
}) {
  return (
    <Head>
      <title>{`Sprout - ${title}`}</title>
      <link rel="icon" href="/favicon.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Code+Latin:wght@100..700&family=Signika:wght@300..700&display=swap" rel="stylesheet" />

      {/* Material Icons */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,700,1,0" />
    </Head>
  )
}
