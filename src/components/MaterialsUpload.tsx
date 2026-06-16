import { useId, useRef, useState } from 'react'

export type MaterialsUploadCopy = {
  action: string
  hint: string
  statusLabel: string
  maxCount: number
  maxSizeMb: number
}

type UploadItem = {
  id: string
  file: File
  previewUrl: string | null
}

function IconUploadCamera({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="5" y="9" width="22" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="17" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 9l2.2-3h5.6L22 9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MaterialsUpload({ copy }: { copy: MaterialsUploadCopy }) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<UploadItem[]>([])

  function openPicker() {
    if (items.length >= copy.maxCount) return
    inputRef.current?.click()
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((item) => item.id !== id)
    })
  }

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList?.length) return
    const remaining = copy.maxCount - items.length
    const picked = Array.from(fileList).slice(0, remaining)
    const maxBytes = copy.maxSizeMb * 1024 * 1024
    const next: UploadItem[] = []
    for (const file of picked) {
      if (file.size > maxBytes) continue
      const isImage = file.type.startsWith('image/')
      next.push({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: isImage ? URL.createObjectURL(file) : null,
      })
    }
    if (next.length) setItems((prev) => [...prev, ...next])
    if (inputRef.current) inputRef.current.value = ''
  }

  const atLimit = items.length >= copy.maxCount

  return (
    <div className="bc-apply-upload-panel">
      <input
        ref={inputRef}
        id={inputId}
        className="bc-apply-upload__input"
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        multiple
        onChange={(e) => handleFilesSelected(e.target.files)}
      />
      <button
        type="button"
        className={'bc-apply-upload__zone' + (atLimit ? ' bc-apply-upload__zone--disabled' : '')}
        onClick={openPicker}
        disabled={atLimit}
        aria-describedby={`${inputId}-hint`}
      >
        <IconUploadCamera className="bc-apply-upload__camera" />
        <span className="bc-apply-upload__action">{copy.action}</span>
      </button>
      {items.length > 0 ? (
        <p className="bc-apply-upload__status">
          {copy.statusLabel} {items.length} 张
        </p>
      ) : null}
      <p id={`${inputId}-hint`} className="bc-apply-upload__hint">
        {copy.hint}
      </p>
      {items.length > 0 ? (
        <ul className="bc-apply-upload__grid" aria-label="已选材料">
          {items.map((item) => (
            <li key={item.id} className="bc-apply-upload__thumb">
              {item.previewUrl ? (
                <img src={item.previewUrl} alt="" />
              ) : (
                <span className="bc-apply-upload__pdf">PDF</span>
              )}
              <button
                type="button"
                className="bc-apply-upload__remove"
                aria-label={`移除 ${item.file.name}`}
                onClick={() => removeItem(item.id)}
              >
                ×
              </button>
            </li>
          ))}
          {!atLimit ? (
            <li>
              <button type="button" className="bc-apply-upload__add" aria-label="继续上传" onClick={openPicker}>
                +
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  )
}
