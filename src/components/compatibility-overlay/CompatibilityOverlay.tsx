import { useEffect, useState } from 'react'
import styles from './CompatibilityOverlay.module.scss'
import useTranslation from "next-translate/useTranslation"

export default function CompatibilityOverlay() {
  const { t } = useTranslation("common")

  const [supportedFeatures, setSupportedFeatures] = useState({})
  
  useEffect(() => { setSupportedFeatures({
    "File System Access API": (window as any).showOpenFilePicker !== undefined && (window as any).showSaveFilePicker !== undefined
  }) }, [])

  return Object.values(supportedFeatures).some(supported => !supported) ? (
    <div id={styles.overlay}>
      <div id={styles.container}>
        <h1>{t("compatibility-overlay.title")}</h1>
        <p>{t("compatibility-overlay.message")}</p>

        <h4>{t("compatibility-overlay.unsupported-features-list")}</h4>
        <ul>
          {Object.entries(supportedFeatures).filter(([_, supported]) => !supported).map(([feature, _]) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </div>
    </div>
  ) : null
}