import { useEffect, useId, useRef } from 'react'

type CategoryPickerProps = {
  value: string
  placeholder: string
  options: readonly string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (value: string) => void
  invalid?: boolean
}

export function CategoryPicker({
  value,
  placeholder,
  options,
  open,
  onOpenChange,
  onChange,
  invalid = false,
}: CategoryPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) onOpenChange(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open, onOpenChange])

  return (
    <div
      ref={rootRef}
      className={
        'bc-category' + (open ? ' bc-category--open' : '') + (invalid ? ' bc-category--invalid' : '')
      }
    >
      <button
        type="button"
        className="bc-category__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => onOpenChange(!open)}
      >
        <span
          className={
            (value ? 'bc-category__value' : 'bc-category__placeholder') +
            ' bc-category__trigger-text'
          }
        >
          {value || placeholder}
        </span>
        <span className="bc-category__chevron" aria-hidden="true" />
      </button>

      {open ? (
        <ul id={listId} className="bc-category__menu" role="listbox">
          {options.map((item) => {
            const selected = item === value
            return (
              <li key={item} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={
                    'bc-category__option' + (selected ? ' bc-category__option--selected' : '')
                  }
                  onClick={() => {
                    onChange(item)
                    onOpenChange(false)
                  }}
                >
                  <span className="bc-category__option-text">{item}</span>
                  {selected ? (
                    <span className="bc-category__check" aria-hidden="true">
                      ✓
                    </span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
