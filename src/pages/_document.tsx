import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Code+Latin:wght@100..700&family=Signika:wght@300..700&display=swap" rel="stylesheet" />

        {/* Material Icons */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,700,1,0" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
