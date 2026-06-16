import { useState } from 'react'
import { CheckinModal } from '../components/CheckinModal'
import '../guild-home.css'
import './checkin-demo.css'

type Scheme = '1' | '2' | '3'

const SCHEMES: { id: Scheme; label: string }[] = [
  { id: '1', label: '方案一' },
  { id: '2', label: '方案二' },
  { id: '3', label: '方案三' },
]

export default function CheckinDemo() {
  const [scheme, setScheme] = useState<Scheme>('1')

  return (
    <div className="checkin-demo">
      <aside className="checkin-demo__sidebar" aria-label="方案选择">
        <p className="checkin-demo__eyebrow">签到奖励</p>
        <h1 className="checkin-demo__title">方案对比 Demo</h1>

        <div className="checkin-demo__choices" role="tablist" aria-label="签到方案">
          {SCHEMES.map((item) => {
            const active = scheme === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={'checkin-demo__choice' + (active ? ' checkin-demo__choice--active' : '')}
                onClick={() => setScheme(item.id)}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </aside>

      <main className="checkin-demo__stage" aria-live="polite">
        <div className="checkin-demo__phone" aria-label="移动端预览">
          {scheme === '1' ? (
            <CheckinModal key="scheme1" open embedded variant="scheme1" onClose={() => undefined} />
          ) : scheme === '2' ? (
            <CheckinModal key="scheme2" open embedded variant="scheme2" onClose={() => undefined} />
          ) : (
            <CheckinModal key="scheme3" open embedded variant="scheme3" onClose={() => undefined} />
          )}
        </div>
      </main>
    </div>
  )
}
