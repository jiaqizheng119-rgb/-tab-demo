type BrandCertApplySuccessFooterProps = {
  label: string
  onClick: () => void
}

export function BrandCertApplySuccessFooter({ label, onClick }: BrandCertApplySuccessFooterProps) {
  return (
    <footer className="bc-footer bc-apply-footer bc-apply-success-footer">
      <button type="button" className="bc-cta bc-cta--success-done" onClick={onClick}>
        <span className="bc-cta__label">{label}</span>
      </button>
    </footer>
  )
}
