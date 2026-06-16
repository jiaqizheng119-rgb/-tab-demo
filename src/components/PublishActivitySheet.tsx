import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { GUILD_ASSETS } from '../data/guildHome'

const { publishSheet } = GUILD_ASSETS

type PublishOption = {
  id: string
  title: string
  hint: string
  tileIcons: string[]
}

const PUBLISH_OPTIONS: PublishOption[] = [
  {
    id: 'offline',
    title: '线下应援打卡',
    hint: '设置时间地点，成员到场打卡即可计入任务进度',
    tileIcons: [publishSheet.pixelCake, publishSheet.pixelHeart, publishSheet.painLou],
  },
  {
    id: 'topic',
    title: '话题晒图活动',
    hint: '发布话题让成员带图打卡，系统自动统计参与人数',
    tileIcons: [publishSheet.productPk, publishSheet.support],
  },
  {
    id: 'limited',
    title: '限时福利活动',
    hint: '在指定时段开放报名或领取，适合节点性宣发',
    tileIcons: [publishSheet.gameBg, publishSheet.gameFg],
  },
]

type PublishActivitySheetProps = {
  open: boolean
  onClose: () => void
}

function IconClose() {
  return (
    <svg className="gh-sheet__close-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PublishActivitySheet({ open, onClose }: PublishActivitySheetProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="gh-sheet" role="presentation">
      <button type="button" className="gh-sheet__backdrop" aria-label="关闭浮层" onClick={onClose} />
      <div
        className="gh-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="gh-sheet__header">
          <button type="button" className="gh-sheet__guide-link">
            发布指南
          </button>
          <h2 id={titleId} className="gh-sheet__title">
            发布公会活动
          </h2>
          <button type="button" className="gh-sheet__close" aria-label="关闭" onClick={onClose}>
            <IconClose />
          </button>
        </header>

        <div className="gh-sheet__body">
          <p className="gh-sheet__intro">
            选择一种活动形式即可开始发布，完成后将计入「发布一场公会活动」任务。
          </p>

          <div className="gh-sheet__cards">
            {PUBLISH_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className="gh-sheet-card"
                onClick={onClose}
              >
                <span className="gh-sheet-card__title">{option.title}</span>
                <span className="gh-sheet-card__hint">{option.hint}</span>
                <span className="gh-sheet-card__tiles" aria-hidden="true">
                  {option.tileIcons.map((iconSrc) => (
                    <span key={iconSrc} className="gh-sheet-tile">
                      <img className="gh-sheet-tile__img" src={iconSrc} alt="" />
                    </span>
                  ))}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="gh-sheet__footer">
          <button type="button" className="gh-sheet__primary" onClick={onClose}>
            立即创建活动
          </button>
          <div className="gh-sheet__home-indicator" aria-hidden="true" />
        </div>
      </div>
    </div>,
    document.body,
  )
}
