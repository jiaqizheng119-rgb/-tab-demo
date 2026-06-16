import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChannelTabBar } from '../components/ChannelTabBar'
import { CHANNEL_THEMES, type ChannelTheme } from '../data/channelTabs'
import './channel-demo.css'

export default function ChannelDemo() {
  const [theme, setTheme] = useState<ChannelTheme>('dark')
  const activeTheme = CHANNEL_THEMES.find((item) => item.id === theme) ?? CHANNEL_THEMES[0]

  return (
    <div className="channel-demo">
      <aside className="channel-demo__sidebar" aria-label="方案选择">
        <p className="channel-demo__eyebrow">频道改版探索</p>
        <h1 className="channel-demo__title">标签栏点击动效</h1>

        <div className="channel-demo__choices" role="tablist" aria-label="选中态方案">
          {CHANNEL_THEMES.map((item) => {
            const active = theme === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={
                  'channel-demo__choice' + (active ? ' channel-demo__choice--active' : '')
                }
                onClick={() => setTheme(item.id)}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <p className="channel-demo__hint">
          方案五为圆角胶囊频道卡；选中时封面放大、渐变描边、白底与 Heavy 字重。
        </p>
        <Link className="channel-demo__link" to="/channel-full">
          查看完整发现页 Demo（五方案对比）→
        </Link>
      </aside>

      <main className="channel-demo__stage" aria-live="polite">
        <div className="channel-demo__meta">
          <span className="channel-demo__node">Figma node {activeTheme.nodeId}</span>
        </div>
        <div className="channel-demo__phone" aria-label="移动端预览">
          <div
            className={
              'channel-demo__screen' +
              (theme === 'red'
                ? ' channel-demo__screen--red'
                : theme === 'icon-pill'
                  ? ' channel-demo__screen--icon'
                  : '')
            }
          >
            <ChannelTabBar key={theme} theme={theme} />
          </div>
        </div>
      </main>
    </div>
  )
}
