import { Link } from 'react-router-dom'
import '../toolbox.css'

const TOOLS = [
  {
    id: 'video',
    name: '视频工具',
    meta: '压缩 · 转格式 · 清晰度',
    to: '/video-tools',
  },
  {
    id: 'image',
    name: '图片工具',
    meta: '即将上线',
    to: '/image-tools',
  },
  {
    id: 'inspire',
    name: '灵感工具',
    meta: '即将上线',
    to: '/inspire-tools',
  },
] as const

export default function ToolboxHome() {
  return (
    <main className="toolbox">
      <div className="toolbox__shell">
        <header className="toolbox__header">
          <h1 className="toolbox__title">工具箱</h1>
        </header>

        <section className="toolbox__grid" aria-label="工具列表">
          {TOOLS.map((tool) => (
            <Link key={tool.id} className="toolbox__card" to={tool.to}>
              <div>
                <h2 className="toolbox__card-name">{tool.name}</h2>
                <p className="toolbox__card-meta">{tool.meta}</p>
              </div>
              <span className="toolbox__card-arrow">进入 →</span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}
