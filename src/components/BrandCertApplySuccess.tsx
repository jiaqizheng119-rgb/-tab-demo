import { BRAND_CERT_APPLY_COPY } from '../data/brandCertApply'
import { BrandCertConfetti } from './BrandCertConfetti'

type BrandCertApplySuccessProps = {
  title: string
  description: string
}

export function BrandCertApplySuccess({ title, description }: BrandCertApplySuccessProps) {
  return (
    <div className="bc-apply-success-screen">
      <BrandCertConfetti />
      <div className="bc-apply-success__content">
        <div className="bc-apply-success__art">
          <img
            className="bc-apply-success__illust"
            src={BRAND_CERT_APPLY_COPY.successIllust}
            alt=""
          />
        </div>
        <div className="bc-apply-success__text">
          <h2 className="bc-apply-success__title">{title}</h2>
          <p className="bc-apply-success__desc">{description}</p>
        </div>
      </div>
    </div>
  )
}
