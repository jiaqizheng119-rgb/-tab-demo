import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrandCertApplySuccess } from '../components/BrandCertApplySuccess'
import { BrandCertApplySuccessFooter } from '../components/BrandCertApplySuccessFooter'
import { BrandCertShell } from '../components/BrandCertShell'
import { CategoryPicker } from '../components/CategoryPicker'
import { FieldHintToast } from '../components/FieldHintToast'
import { MaterialsUpload } from '../components/MaterialsUpload'
import {
  BRAND_CERT_APPLY_COPY,
  type ApplyFieldKey,
} from '../data/brandCertApply'
import '../brand-cert-apply.css'

export default function BrandCertApply() {
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null)
  const fieldRefs = useRef<Partial<Record<ApplyFieldKey, HTMLElement | null>>>({})
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [category, setCategory] = useState('')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [fieldHint, setFieldHint] = useState<{
    field: ApplyFieldKey
    message: string
  } | null>(null)
  const [submitAttempt, setSubmitAttempt] = useState(0)

  const copy = BRAND_CERT_APPLY_COPY

  function dismissHint() {
    setFieldHint(null)
  }

  function dismissHintFor(field: ApplyFieldKey) {
    if (fieldHint?.field === field) dismissHint()
  }

  function bindFieldRef(field: ApplyFieldKey) {
    return (node: HTMLElement | null) => {
      fieldRefs.current[field] = node
    }
  }

  useEffect(() => {
    if (!fieldHint) return
    const node = fieldRefs.current[fieldHint.field]
    if (!node) return
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        node.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    })
  }, [fieldHint, submitAttempt])

  function validateForm(): { field: ApplyFieldKey; message: string } | null {
    const form = formRef.current
    if (!form) return { field: 'shopName', message: copy.fieldHints.shopName }

    const shopName = (form.elements.namedItem('shopName') as HTMLInputElement).value
    const contactName = (form.elements.namedItem('contactName') as HTMLInputElement).value
    const contactPhone = (form.elements.namedItem('contactPhone') as HTMLInputElement).value
    const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value

    if (!shopName.trim()) return { field: 'shopName', message: copy.fieldHints.shopName }
    if (!category) return { field: 'category', message: copy.fieldHints.category }
    if (!contactName.trim()) return { field: 'contactName', message: copy.fieldHints.contactName }
    const phone = contactPhone.trim()
    if (!phone) return { field: 'contactPhone', message: copy.fieldHints.contactPhone }
    if (!/^\d{11}$/.test(phone)) {
      return { field: 'contactPhone', message: copy.fieldHints.contactPhoneInvalid }
    }
    if (!description.trim()) return { field: 'description', message: copy.fieldHints.description }
    return null
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!agreed) return
    const invalid = validateForm()
    if (invalid) {
      setFieldHint(invalid)
      setSubmitAttempt((n) => n + 1)
      if (invalid.field === 'category') setCategoryOpen(false)
      return
    }
    dismissHint()
    setSubmitted(true)
  }

  function fieldWrapClass(field: ApplyFieldKey) {
    return 'bc-apply-field' + (fieldHint?.field === field ? ' bc-apply-field--hint' : '')
  }

  if (submitted) {
    return (
      <BrandCertShell
        navTitle={copy.navTitle}
        onBack={() => navigate('/brand-cert')}
        showShare={false}
        footer={
          <BrandCertApplySuccessFooter
            label="返回说明页"
            onClick={() => navigate('/brand-cert')}
          />
        }
      >
        <BrandCertApplySuccess
          title={copy.submitSuccess}
          description={copy.submitSuccessDesc}
        />
      </BrandCertShell>
    )
  }

  return (
    <BrandCertShell
      navTitle={copy.navTitle}
      onBack={() => navigate(-1)}
      showShare={false}
      footer={
        <footer className="bc-footer bc-apply-footer">
          <button
            type="submit"
            form="bc-apply-form"
            className="bc-cta"
            disabled={!agreed}
          >
            <span className="bc-cta__label">{copy.submit}</span>
          </button>
          <div className="bc-home" aria-hidden="true" />
        </footer>
      }
    >
      <main className="bc-apply-main">
        <p className="bc-apply-intro">{copy.intro}</p>

        <div className="bc-apply-steps" aria-label="申请流程">
          <div className="bc-apply-steps__track">
            {copy.steps.map((label, index) => (
              <div key={label} className="bc-apply-steps__group">
                {index > 0 ? (
                  <span
                    className={
                      'bc-apply-step__line' + (index >= 2 ? ' bc-apply-step__line--soft' : '')
                    }
                    aria-hidden="true"
                  />
                ) : null}
                <div
                  className={
                    index === 0
                      ? 'bc-apply-step bc-apply-step--active'
                      : 'bc-apply-step bc-apply-step--later'
                  }
                >
                  <span className="bc-apply-step__dot">{index + 1}</span>
                  <span className="bc-apply-step__label">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form
          ref={formRef}
          id="bc-apply-form"
          className="bc-apply-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <section className="bc-apply-form__section">
            <h2 className="bc-apply-form__title">{copy.sections.shop}</h2>
            <label ref={bindFieldRef('shopName')} className={fieldWrapClass('shopName')}>
              <span className="bc-apply-field__label">
                {copy.fields.shopName.label}
                <span>*</span>
              </span>
              <div className="bc-apply-field__control">
                {fieldHint?.field === 'shopName' ? (
                  <FieldHintToast message={fieldHint.message} />
                ) : null}
                <input
                  className="bc-apply-field__input"
                  name="shopName"
                  type="text"
                  placeholder={copy.fields.shopName.placeholder}
                  onInput={() => dismissHintFor('shopName')}
                />
              </div>
            </label>
            <div ref={bindFieldRef('category')} className={fieldWrapClass('category')}>
              <span className="bc-apply-field__label">
                {copy.fields.category.label}
                <span>*</span>
              </span>
              <div className="bc-apply-field__control">
                {fieldHint?.field === 'category' ? (
                  <FieldHintToast message={fieldHint.message} />
                ) : null}
                <CategoryPicker
                  value={category}
                  placeholder={copy.fields.category.placeholder}
                  options={copy.categories}
                  open={categoryOpen}
                  onOpenChange={setCategoryOpen}
                  onChange={(val) => {
                    setCategory(val)
                    if (val) dismissHintFor('category')
                  }}
                  invalid={fieldHint?.field === 'category'}
                />
                <input type="hidden" name="category" value={category} />
              </div>
            </div>
          </section>

          <section className="bc-apply-form__section">
            <h2 className="bc-apply-form__title">{copy.sections.contact}</h2>
            <label ref={bindFieldRef('contactName')} className={fieldWrapClass('contactName')}>
              <span className="bc-apply-field__label">
                {copy.fields.contactName.label}
                <span>*</span>
              </span>
              <div className="bc-apply-field__control">
                {fieldHint?.field === 'contactName' ? (
                  <FieldHintToast message={fieldHint.message} />
                ) : null}
                <input
                  className="bc-apply-field__input"
                  name="contactName"
                  type="text"
                  placeholder={copy.fields.contactName.placeholder}
                  onInput={() => dismissHintFor('contactName')}
                />
              </div>
            </label>
            <label ref={bindFieldRef('contactPhone')} className={fieldWrapClass('contactPhone')}>
              <span className="bc-apply-field__label">
                {copy.fields.contactPhone.label}
                <span>*</span>
              </span>
              <div className="bc-apply-field__control">
                {fieldHint?.field === 'contactPhone' ? (
                  <FieldHintToast message={fieldHint.message} />
                ) : null}
                <input
                  className="bc-apply-field__input"
                  name="contactPhone"
                  type="tel"
                  inputMode="numeric"
                  placeholder={copy.fields.contactPhone.placeholder}
                  onInput={() => dismissHintFor('contactPhone')}
                />
              </div>
            </label>
          </section>

          <section className="bc-apply-form__section">
            <h2 className="bc-apply-form__title">{copy.sections.original}</h2>
            <label ref={bindFieldRef('description')} className={fieldWrapClass('description')}>
              <span className="bc-apply-field__label">
                {copy.fields.description.label}
                <span>*</span>
              </span>
              <div className="bc-apply-field__control">
                {fieldHint?.field === 'description' ? (
                  <FieldHintToast message={fieldHint.message} />
                ) : null}
                <textarea
                  className="bc-apply-field__textarea"
                  name="description"
                  maxLength={300}
                  placeholder={copy.fields.description.placeholder}
                  onInput={() => dismissHintFor('description')}
                />
              </div>
            </label>
          </section>

          <section className="bc-apply-form__section">
            <h2 className="bc-apply-form__title">{copy.sections.materials}</h2>
            <MaterialsUpload copy={copy.upload} />
          </section>
        </form>

        <div className="bc-apply-tips">
          <p className="bc-apply-tips__title">温馨提示</p>
          <ul className="bc-apply-tips__list">
            {copy.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>

        <label className="bc-apply-agree">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>{copy.agreement}</span>
        </label>
      </main>
    </BrandCertShell>
  )
}
