import { Link } from 'react-router-dom'
import '../toolbox.css'

type ToolPlaceholderProps = {
  title: string
}

export default function ToolPlaceholder({ title }: ToolPlaceholderProps) {
  return (
    <main className="toolbox">
      <div className="toolbox__shell">
        <Link className="toolbox-page__back" to="/">
          ← 返回工具箱
        </Link>
        <h1 className="toolbox-page__title">{title}</h1>
        <div className="toolbox-page__empty" aria-hidden="true" />
      </div>
    </main>
  )
}
