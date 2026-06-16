import { useNavigate } from 'react-router-dom'
import { IconBadgeBenefit, IconSearchBenefit } from '../components/BrandCertBenefitIcons'
import { BrandCertShell } from '../components/BrandCertShell'
import { BRAND_CERT_ASSETS, BRAND_CERT_COPY } from '../data/brandCert'
import '../brand-cert.css'

export default function BrandCertification() {
  const navigate = useNavigate()
  const copy = BRAND_CERT_COPY

  return (
    <BrandCertShell navTitle={copy.navTitle} onBack={() => navigate(-1)}>
      <div className="bc-content">
        <section className="bc-hero" aria-labelledby="bc-hero-title">
          <img
            id="bc-hero-title"
            className="bc-hero__title-img"
            src={BRAND_CERT_ASSETS.heroTitle}
            alt={copy.heroTitleAlt}
          />
          <p className="bc-hero__subtitle">{copy.subtitle}</p>
        </section>

        <section className="bc-card" aria-labelledby="bc-card-title">
          <img
            id="bc-card-title"
            className="bc-card__title-img"
            src={BRAND_CERT_ASSETS.cardTitle}
            alt={copy.cardTitle}
          />
          <div className="bc-card__panel">
            <ul className="bc-benefits">
              {copy.benefits.map((benefit) => (
                <li key={benefit.id} className="bc-benefit">
                  {benefit.id === 'search' ? (
                    <IconSearchBenefit className="bc-benefit__icon" />
                  ) : (
                    <IconBadgeBenefit className="bc-benefit__icon" />
                  )}
                  <div className="bc-benefit__text">
                    <p className="bc-benefit__title">{benefit.title}</p>
                    <p className="bc-benefit__desc">{benefit.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <footer className="bc-footer">
        <button type="button" className="bc-cta" onClick={() => navigate('/brand-cert/apply')}>
          <span className="bc-cta__label">{copy.cta}</span>
        </button>
        <div className="bc-home" aria-hidden="true" />
      </footer>
    </BrandCertShell>
  )
}
