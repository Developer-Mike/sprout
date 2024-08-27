import CompatibilityOverlay from "@/components/compatibility-overlay/CompatibilityOverlay"
import DialogWrapper from "@/components/dialog/Dialog"
import "@/styles/globals.scss"
import type { AppProps } from "next/app"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DialogWrapper>
      <Component {...pageProps} />
      <CompatibilityOverlay />
    </DialogWrapper>
  )
}
