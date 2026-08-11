import { useEffect, useId, useRef, useState } from 'react'
import gifsicle from 'gifsicle-wasm-browser'
import '../gif-compress.css'

type PresetId = 'recommended' | 'smaller' | 'custom'

type GifMeta = {
  file: File
  url: string
  bytes: number
}

const PRESETS: Record<
  Exclude<PresetId, 'custom'>,
  { label: string; lossy: number; hint: string }
> = {
  recommended: {
    label: '推荐画质',
    lossy: 20,
    hint: '与上次压缩一致：尺寸/帧数/颜色不变，体积通常可降约 85%+',
  },
  smaller: {
    label: '更小体积',
    lossy: 40,
    hint: '同样不改尺寸帧数颜色，体积更小，肉眼差异通常很小',
  },
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function buildCommand(inputName: string, lossy: number, bytes: number): string {
  // Large GIFs: -O3 can be very slow in WASM; -O1 is nearly as small with lossy.
  const optimize = bytes >= 8 * 1024 * 1024 ? '-O1' : '-O3'
  return `${optimize} --lossy=${lossy} ${inputName} -o /out/out.gif`
}

function downloadName(original: string): string {
  const base = original.replace(/\.gif$/i, '') || 'gif'
  return `${base}-compressed.gif`
}

export default function GifCompress() {
  const inputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [preset, setPreset] = useState<PresetId>('recommended')
  const [lossy, setLossy] = useState(PRESETS.recommended.lossy)
  const [source, setSource] = useState<GifMeta | null>(null)
  const [result, setResult] = useState<GifMeta | null>(null)
  const [busy, setBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [previewTarget, setPreviewTarget] = useState<'source' | 'result' | null>(
    null,
  )
  const [compareMode, setCompareMode] = useState(false)
  const [status, setStatus] = useState('拖入 GIF 后即可压缩，全程在本地浏览器完成。')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (source?.url) URL.revokeObjectURL(source.url)
      if (result?.url) URL.revokeObjectURL(result.url)
    }
  }, [source, result])

  useEffect(() => {
    if (!previewTarget) {
      setCompareMode(false)
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewTarget(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [previewTarget])

  function applyPreset(next: PresetId) {
    setPreset(next)
    if (next !== 'custom') setLossy(PRESETS[next].lossy)
  }

  function onLossyChange(value: number) {
    setLossy(value)
    if (value === PRESETS.recommended.lossy) setPreset('recommended')
    else if (value === PRESETS.smaller.lossy) setPreset('smaller')
    else setPreset('custom')
  }

  function resetResult() {
    setResult((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return null
    })
  }

  function loadFile(file: File | undefined | null) {
    if (!file) return
    if (!file.type.includes('gif') && !file.name.toLowerCase().endsWith('.gif')) {
      setError('请上传 GIF 文件。')
      return
    }

    setError(null)
    resetResult()
    setSource((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return {
        file,
        url: URL.createObjectURL(file),
        bytes: file.size,
      }
    })
    setPreviewTarget(null)
    setStatus(`已载入 ${file.name}（${formatBytes(file.size)}），选择模式后点「开始压缩」。`)
  }

  async function compress() {
    if (!source || busy) return

    setBusy(true)
    setError(null)
    resetResult()
    setStatus('正在压缩…大文件可能需要几十秒，请稍候。')

    const inputName = 'input.gif'
    const command = buildCommand(inputName, lossy, source.bytes)

    try {
      const files = await gifsicle.run({
        input: [{ file: source.file, name: inputName }],
        command: [command],
      })

      const out = files?.[0]
      if (!out) throw new Error('压缩失败，未得到输出文件。')

      const outFile = new File([out], downloadName(source.file.name), {
        type: 'image/gif',
      })
      const url = URL.createObjectURL(outFile)
      setResult({ file: outFile, url, bytes: outFile.size })

      const saved = source.bytes - outFile.size
      const pct = source.bytes > 0 ? (saved / source.bytes) * 100 : 0
      setStatus(
        pct > 0
          ? `完成：${formatBytes(source.bytes)} → ${formatBytes(outFile.size)}（减小 ${pct.toFixed(1)}%）`
          : `完成：输出 ${formatBytes(outFile.size)}（体积几乎未变，可能已是优化过的 GIF）`,
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : '压缩失败'
      setError(message)
      setStatus('压缩失败，请换一个文件或稍后再试。')
    } finally {
      setBusy(false)
    }
  }

  function clearAll() {
    setSource((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return null
    })
    resetResult()
    setPreviewTarget(null)
    setError(null)
    setStatus('拖入 GIF 后即可压缩，全程在本地浏览器完成。')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function openPreview(target: 'source' | 'result') {
    setCompareMode(false)
    setPreviewTarget(target)
  }

  function closePreview() {
    setCompareMode(false)
    setPreviewTarget(null)
  }

  const previewItem =
    previewTarget === 'source'
      ? source
      : previewTarget === 'result'
        ? result
        : null
  const previewTitle =
    previewTarget === 'source'
      ? '原图'
      : previewTarget === 'result'
        ? '压缩后'
        : ''
  const canCompare = Boolean(source && result)
  const showCompare = compareMode && canCompare

  const ratio =
    source && result && source.bytes > 0
      ? ((1 - result.bytes / source.bytes) * 100).toFixed(1)
      : null

  const activeHint =
    preset === 'custom'
      ? `自定义 lossy=${lossy}：数值越大体积越小，噪点可能更明显（建议 20–60）。`
      : PRESETS[preset].hint

  return (
    <main className="gif-compress">
      <div className="gif-compress__shell">
        <header className="gif-compress__header">
          <p className="gif-compress__eyebrow">Local tool</p>
          <h1 className="gif-compress__title">GIF 压缩</h1>
          <p className="gif-compress__lead">
            保持尺寸、帧数、调色板不变；用 gifsicle 轻度 lossy 压体积。文件只在本地处理，不会上传。
          </p>
        </header>

        <section className="gif-compress__panel">
          <label
            className={`gif-compress__drop${dragOver ? ' gif-compress__drop--active' : ''}`}
            htmlFor={inputId}
            onDragEnter={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setDragOver(false)
            }}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              loadFile(e.dataTransfer.files?.[0])
            }}
          >
            <p className="gif-compress__drop-title">
              {source ? source.file.name : '拖拽 GIF 到这里'}
            </p>
            <p className="gif-compress__drop-hint">
              {source
                ? `${formatBytes(source.bytes)} · 点击可更换文件`
                : '或点击选择文件'}
            </p>
            <input
              id={inputId}
              ref={fileInputRef}
              className="gif-compress__file-input"
              type="file"
              accept="image/gif,.gif"
              onChange={(e) => loadFile(e.target.files?.[0])}
            />
          </label>

          <div className="gif-compress__controls">
            <div>
              <span className="gif-compress__label">压缩模式</span>
              <div className="gif-compress__presets" role="group" aria-label="压缩模式">
                {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`gif-compress__preset${
                      preset === id ? ' gif-compress__preset--active' : ''
                    }`}
                    onClick={() => applyPreset(id)}
                  >
                    {PRESETS[id].label}
                  </button>
                ))}
                <button
                  type="button"
                  className={`gif-compress__preset${
                    preset === 'custom' ? ' gif-compress__preset--active' : ''
                  }`}
                  onClick={() => setPreset('custom')}
                >
                  自定义
                </button>
              </div>
            </div>

            <div className="gif-compress__slider-row">
              <div className="gif-compress__slider-meta">
                <span>lossy 强度</span>
                <strong>{lossy}</strong>
              </div>
              <input
                className="gif-compress__slider"
                type="range"
                min={1}
                max={120}
                step={1}
                value={lossy}
                onChange={(e) => onLossyChange(Number(e.target.value))}
                aria-label="lossy 强度"
              />
            </div>

            <div className="gif-compress__actions">
              <button
                type="button"
                className="gif-compress__btn gif-compress__btn--primary"
                disabled={!source || busy}
                onClick={() => void compress()}
              >
                {busy ? '压缩中…' : '开始压缩'}
              </button>
              {result ? (
                <a
                  className="gif-compress__btn gif-compress__btn--download"
                  href={result.url}
                  download={result.file.name}
                >
                  下载压缩结果
                </a>
              ) : null}
              <button
                type="button"
                className="gif-compress__btn gif-compress__btn--ghost"
                disabled={busy || (!source && !result)}
                onClick={clearAll}
              >
                清空
              </button>
            </div>
          </div>

          <p
            className={`gif-compress__status${error ? ' gif-compress__status--error' : ''}`}
            role="status"
          >
            {error ?? status}
          </p>
          <p className="gif-compress__note">{activeHint}</p>

          {source ? (
            <>
              <div className="gif-compress__compare">
                <article className="gif-compress__card">
                  <div className="gif-compress__card-head">
                    <strong>原图</strong>
                    <span>{formatBytes(source.bytes)}</span>
                  </div>
                  <div className="gif-compress__preview">
                    <img src={source.url} alt="压缩前预览" />
                  </div>
                  <div className="gif-compress__card-actions">
                    <button
                      type="button"
                      className="gif-compress__btn gif-compress__btn--preview"
                      onClick={() => openPreview('source')}
                    >
                      预览
                    </button>
                  </div>
                </article>
                <article className="gif-compress__card">
                  <div className="gif-compress__card-head">
                    <strong>压缩后</strong>
                    <span>{result ? formatBytes(result.bytes) : '—'}</span>
                  </div>
                  <div className="gif-compress__preview">
                    {result ? (
                      <img src={result.url} alt="压缩后预览" />
                    ) : (
                      <span style={{ color: 'var(--gc-muted)', fontSize: 14 }}>
                        {busy ? '处理中…' : '等待压缩'}
                      </span>
                    )}
                  </div>
                  <div className="gif-compress__card-actions">
                    <button
                      type="button"
                      className="gif-compress__btn gif-compress__btn--preview"
                      disabled={!result}
                      onClick={() => openPreview('result')}
                    >
                      预览
                    </button>
                  </div>
                </article>
              </div>

              {result ? (
                <div className="gif-compress__stats">
                  <div className="gif-compress__stat">
                    <span className="gif-compress__stat-label">原始</span>
                    <div className="gif-compress__stat-value">
                      {formatBytes(source.bytes)}
                    </div>
                  </div>
                  <div className="gif-compress__stat">
                    <span className="gif-compress__stat-label">压缩后</span>
                    <div className="gif-compress__stat-value">
                      {formatBytes(result.bytes)}
                    </div>
                  </div>
                  <div className="gif-compress__stat">
                    <span className="gif-compress__stat-label">减小</span>
                    <div className="gif-compress__stat-value gif-compress__stat-value--good">
                      {ratio}%
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </section>
      </div>

      {previewItem && source ? (
        <div
          className="gif-compress__modal"
          role="dialog"
          aria-modal="true"
          aria-label={showCompare ? '原图与压缩后对比预览' : `${previewTitle}放大预览`}
          onClick={closePreview}
        >
          <div
            className="gif-compress__modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gif-compress__modal-head">
              <strong>
                {showCompare
                  ? '上下对比'
                  : `${previewTitle} · ${formatBytes(previewItem.bytes)}`}
              </strong>
              <div className="gif-compress__modal-actions">
                <button
                  type="button"
                  className={`gif-compress__btn gif-compress__btn--preview${
                    showCompare ? ' gif-compress__btn--preview-active' : ''
                  }`}
                  disabled={!canCompare}
                  onClick={() => setCompareMode((v) => !v)}
                >
                  {showCompare ? '退出对比' : '对比'}
                </button>
                <button
                  type="button"
                  className="gif-compress__modal-close"
                  onClick={closePreview}
                >
                  关闭
                </button>
              </div>
            </div>
            <div
              className={`gif-compress__modal-body${
                showCompare ? ' gif-compress__modal-body--stack' : ''
              }`}
            >
              {showCompare && result ? (
                <>
                  <figure className="gif-compress__modal-figure">
                    <figcaption>原图 · {formatBytes(source.bytes)}</figcaption>
                    <div className="gif-compress__modal-media">
                      <img src={source.url} alt="原图对比预览" />
                    </div>
                  </figure>
                  <figure className="gif-compress__modal-figure">
                    <figcaption>压缩后 · {formatBytes(result.bytes)}</figcaption>
                    <div className="gif-compress__modal-media">
                      <img src={result.url} alt="压缩后对比预览" />
                    </div>
                  </figure>
                </>
              ) : (
                <figure className="gif-compress__modal-figure">
                  <div className="gif-compress__modal-media">
                    <img src={previewItem.url} alt={`${previewTitle}放大预览`} />
                  </div>
                </figure>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
