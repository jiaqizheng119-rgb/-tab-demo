import type { ReactNode } from 'react'
import { BrandCertBlueGlow } from './BrandCertBlueGlow'
import { IconNavBack, IconNavShare } from './BrandCertNavIcons'
import { BRAND_CERT_ASSETS } from '../data/brandCert'
import '../brand-cert.css'

function StatusBar() {
  return (
    <div className="bc-status" aria-hidden="true">
      <img className="bc-status__bar" src={BRAND_CERT_ASSETS.statusBar} alt="" />
    </div>
  )
}

type BrandCertShellProps = {
  navTitle: string
  children: ReactNode
  footer?: ReactNode
  onBack: () => void
  showShare?: boolean
}

export function BrandCertShell({
  navTitle,
  children,
  footer,
  onBack,
  showShare = true,
}: BrandCertShellProps) {
  return (
    <div className="brand-cert">
      <div className="bc-bg" aria-hidden="true">
        <div className="bc-bg__gradient" />
        <div className="bc-bg__glow">
          <div className="bc-bg__glow-rotate">
            <div className="bc-bg__glow-mask">
              <div className="bc-bg__glow-media">
                <BrandCertBlueGlow className="bc-bg__glow-svg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="brand-cert__body">
        <StatusBar />

        <header className="bc-nav">
          <button type="button" className="bc-nav__back" aria-label="返回" onClick={onBack}>
            <IconNavBack className="bc-nav__icon bc-nav__icon--back" />
          </button>
          <h1 className="bc-nav__title">{navTitle}</h1>
          {showShare ? (
            <button type="button" className="bc-nav__share" aria-label="分享">
              <IconNavShare className="bc-nav__icon bc-nav__icon--share" />
            </button>
          ) : (
            <span className="bc-nav__share" aria-hidden="true" />
          )}
        </header>

        {children}
        {footer}
      </div>
    </div>
  )
}
