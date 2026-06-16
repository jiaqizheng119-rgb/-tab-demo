import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { CHECKIN_REWARDS, GUILD_ASSETS } from '../data/guildHome'

type CheckinVariant = 'scheme1' | 'scheme2' | 'scheme3'

type CheckinModalProps = {
  open: boolean
  onClose: () => void
  /** 嵌入预览区时使用，不用 portal / fixed 全屏 */
  embedded?: boolean
  /** scheme1: 顶部动效；scheme2: 右侧静态；scheme3: 顶部摇摆 + 单行卡片 */
  variant?: CheckinVariant
}

type DayStatus = 'done' | 'current' | 'locked'

function IconClose() {
  return (
    <svg className="gh-checkin__close-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg className="gh-checkin-day__check" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d="M2.5 6.2L5.1 8.8L9.5 3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function getDayStatus(day: number, streak: number): DayStatus {
  if (day <= streak) return 'done'
  if (day === streak + 1) return 'current'
  return 'locked'
}

function getCheckinCaptureMode(): 'default' | 'prompt' | 'success' {
  if (typeof window === 'undefined') return 'default'
  const mode = new URLSearchParams(window.location.search).get('checkin')
  if (mode === 'prompt') return 'prompt'
  if (mode === 'success') return 'success'
  return 'default'
}

function MascotBlock({
  show,
  checkedInToday,
  extraClass = '',
}: {
  show: boolean
  checkedInToday: boolean
  extraClass?: string
}) {
  return (
    <div
      className={
        'gh-checkin__mascot-wrap' +
        (show ? ' gh-checkin__mascot-wrap--active' : '') +
        (checkedInToday ? ' gh-checkin__mascot-wrap--success' : '') +
        (extraClass ? ' ' + extraClass : '')
      }
      aria-hidden="true"
    >
      {show ? (
        <div className="gh-checkin__mascot-bubble-wrap">
          {checkedInToday ? (
            <>
              <span className="gh-checkin__mascot-deco gh-checkin__mascot-deco--1">✦</span>
              <span className="gh-checkin__mascot-deco gh-checkin__mascot-deco--2">✧</span>
              <span className="gh-checkin__mascot-deco gh-checkin__mascot-deco--3">★</span>
              <span className="gh-checkin__mascot-deco gh-checkin__mascot-deco--4">✦</span>
            </>
          ) : null}
          <p className="gh-checkin__mascot-bubble">
            {checkedInToday ? '签到成功！' : '快签到呀'}
          </p>
        </div>
      ) : null}
      <img className="gh-checkin__mascot" src={GUILD_ASSETS.checkin.mascot} alt="" />
    </div>
  )
}

export function CheckinModal({
  open,
  onClose,
  embedded = false,
  variant = 'scheme1',
}: CheckinModalProps) {
  const isScheme2 = variant === 'scheme2'
  const isScheme3 = variant === 'scheme3'
  const isInstantMascot = isScheme2 || isScheme3
  const captureMode = getCheckinCaptureMode()
  const titleId = useId()
  const [streak, setStreak] = useState(() => (captureMode === 'success' ? 1 : 0))
  const [checkedInToday, setCheckedInToday] = useState(() => captureMode === 'success')
  const [mascotActive, setMascotActive] = useState(
    () => isInstantMascot || captureMode === 'prompt' || captureMode === 'success',
  )

  useEffect(() => {
    if (!open || embedded) return undefined

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
  }, [open, onClose, embedded])

  useEffect(() => {
    if (!open) {
      setMascotActive(isInstantMascot)
      return undefined
    }

    if (isInstantMascot || captureMode === 'prompt' || captureMode === 'success') return undefined

    const timer = window.setTimeout(() => setMascotActive(true), 3000)
    return () => window.clearTimeout(timer)
  }, [open, captureMode, isInstantMascot])

  if (!open) return null

  const showMascotPrompt = isInstantMascot || mascotActive || checkedInToday

  const handleCheckin = () => {
    if (checkedInToday) return
    setCheckedInToday(true)
    setStreak((value) => value + 1)
  }

  const modal = (
    <div
      className={
        'gh-checkin' +
        (embedded ? ' gh-checkin--embedded' : '') +
        (isScheme2 ? ' gh-checkin--scheme2' : '') +
        (isScheme3 ? ' gh-checkin--scheme3' : '')
      }
      role="presentation"
    >
      <button
        type="button"
        className="gh-checkin__backdrop"
        aria-label="关闭弹窗"
        onClick={embedded ? undefined : onClose}
        tabIndex={embedded ? -1 : undefined}
      />
      <div className="gh-checkin__wrap">
        <MascotBlock show={showMascotPrompt} checkedInToday={checkedInToday} />

        <div
          className="gh-checkin__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button type="button" className="gh-checkin__close" aria-label="关闭" onClick={onClose}>
            <IconClose />
          </button>

          <h2 id={titleId} className="gh-checkin__banner">
            签到奖励
          </h2>
          <p className="gh-checkin__subtitle">签到获得经验值，连续签到收益更高哦</p>

          <div className={'gh-checkin__grid' + (isScheme3 ? ' gh-checkin__grid--single' : '')}>
            {isScheme3 ? (
              <div className="gh-checkin__row">
                {CHECKIN_REWARDS.map((item) => {
                  const status = getDayStatus(item.day, streak)
                  return (
                    <CheckinDayCard
                      key={item.day}
                      day={item.day}
                      label={item.label}
                      reward={item.reward}
                      status={status}
                    />
                  )
                })}
              </div>
            ) : (
              <>
                <div className="gh-checkin__row">
                  {CHECKIN_REWARDS.slice(0, 4).map((item) => {
                    const status = getDayStatus(item.day, streak)
                    return (
                      <CheckinDayCard
                        key={item.day}
                        day={item.day}
                        label={item.label}
                        reward={item.reward}
                        status={status}
                      />
                    )
                  })}
                </div>
                <div className="gh-checkin__row gh-checkin__row--center">
                  {CHECKIN_REWARDS.slice(4).map((item) => {
                    const status = getDayStatus(item.day, streak)
                    return (
                      <CheckinDayCard
                        key={item.day}
                        day={item.day}
                        label={item.label}
                        reward={item.reward}
                        status={status}
                      />
                    )
                  })}
                </div>
              </>
            )}
          </div>

          <p className="gh-checkin__hint">连续签到 7 天可获得最高经验值奖励</p>

          <button
            type="button"
            className="gh-checkin__cta"
            disabled={checkedInToday}
            onClick={handleCheckin}
          >
            {checkedInToday ? '今日已签到' : '立即签到'}
          </button>
        </div>
      </div>
    </div>
  )

  if (embedded) return modal

  return createPortal(modal, document.body)
}

function CheckinDayCard({
  day,
  label,
  reward,
  status,
}: {
  day: number
  label: string
  reward: string
  status: DayStatus
}) {
  return (
    <article className={'gh-checkin-day gh-checkin-day--' + status}>
      <span className="gh-checkin-day__tag">第{day}天</span>
      <div className="gh-checkin-day__body">
        <span className="gh-checkin-day__coin" aria-hidden="true">
          <img className="gh-checkin-day__coin-bg" src={GUILD_ASSETS.checkin.expCoin} alt="" />
          <span className="gh-checkin-day__reward">{reward}</span>
        </span>
        <span className="gh-checkin-day__label">{label}</span>
      </div>
      {status === 'done' ? (
        <span className="gh-checkin-day__done" aria-hidden="true">
          <IconCheck />
        </span>
      ) : null}
    </article>
  )
}
