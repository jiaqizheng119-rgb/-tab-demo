import { useEffect, useId, useRef, useState } from 'react'
import gifsicle from 'gifsicle-wasm-browser'
import { gifToMov, gifToMp4, videoToGif } from '../lib/ffmpegClient'
import '../gif-compress.css'

type MainTab = 'compress' | 'convert'

type ConvertId = 'mov-to-gif' | 'mp4-to-gif' | 'gif-to-mp4' | 'gif-to-mov'

type ToolId = 'compress' | ConvertId

type PresetId = 'recommended' | 'smaller' | 'custom'

type MediaMeta = {
  file: File
  url: string
  bytes: number
  kind: 'image' | 'video'
}

const COMPRESS_TOOL = {
  id: 'compress' as const,
  label: 'GIF 压缩',
  accept: 'image/gif,.gif',
  dropHint: '拖拽 GIF 到这里',
  actionLabel: '开始压缩',
  lead: '保持尺寸、帧数、调色板不变；用 gifsicle 轻度 lossy 压体积。文件只在本地处理，不会上传。',
}

const CONVERT_TOOLS: Array<{
  id: ConvertId
  label: string
  accept: string
  dropHint: string
  actionLabel: string
  lead: string
}> = [
  {
    id: 'mov-to-gif',
    label: 'MOV→GIF',
    accept: 'video/quicktime,.mov,video/mp4',
    dropHint: '拖拽 MOV 到这里',
    actionLabel: '开始转换',
    lead: '把 MOV 转成 GIF，默认保持原尺寸与全部帧，只做格式转换，不主动压缩。',
  },
  {
    id: 'mp4-to-gif',
    label: 'MP4→GIF',
    accept: 'video/mp4,.mp4,video/*',
    dropHint: '拖拽 MP4 到这里',
    actionLabel: '开始转换',
    lead: '把 MP4 转成 GIF，默认保持原尺寸与全部帧，只做格式转换，不主动压缩。',
  },
  {
    id: 'gif-to-mp4',
    label: 'GIF→MP4',
    accept: 'image/gif,.gif',
    dropHint: '拖拽 GIF 到这里',
    actionLabel: '开始转换',
    lead: '把 GIF 转成高画质 MP4（H.264），只做格式转换，不主动压体积。',
  },
  {
    id: 'gif-to-mov',
    label: 'GIF→MOV',
    accept: 'image/gif,.gif',
    dropHint: '拖拽 GIF 到这里',
    actionLabel: '开始转换',
    lead: '把 GIF 转成高画质 MOV（H.264），只做格式转换，不主动压体积。',
  },
]

const CONVERT_LEAD =
  '选择下方转换方式。格式转换默认保画质，不主动压缩；文件只在本地处理。'

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

function buildCompressCommand(
  inputName: string,
  lossy: number,
  bytes: number,
): string {
  const optimize = bytes >= 8 * 1024 * 1024 ? '-O1' : '-O3'
  return `${optimize} --lossy=${lossy} ${inputName} -o /out/out.gif`
}

function baseName(filename: string): string {
  return filename.replace(/\.[^.]+$/, '') || 'output'
}

function mediaKindFromFile(file: File): 'image' | 'video' {
  if (file.type.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(file.name)) {
    return 'video'
  }
  return 'image'
}

function isAccepted(tool: ToolId, file: File): boolean {
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  if (tool === 'compress' || tool === 'gif-to-mp4' || tool === 'gif-to-mov') {
    return type.includes('gif') || name.endsWith('.gif')
  }
  if (tool === 'mov-to-gif') {
    return (
      name.endsWith('.mov') ||
      type.includes('quicktime') ||
      type.includes('mp4')
    )
  }
  if (tool === 'mp4-to-gif') {
    return (
      name.endsWith('.mp4') ||
      name.endsWith('.mov') ||
      type.startsWith('video/')
    )
  }
  return false
}

function sourceLabel(tool: ToolId): string {
  if (tool === 'mov-to-gif') return '原视频 (MOV)'
  if (tool === 'mp4-to-gif') return '原视频 (MP4)'
  return '原图'
}

function resultLabel(tool: ToolId): string {
  if (tool === 'compress') return '压缩后'
  if (tool === 'mov-to-gif' || tool === 'mp4-to-gif') return 'GIF'
  if (tool === 'gif-to-mp4') return 'MP4'
  return 'MOV'
}

function MediaPreview({
  meta,
  alt,
}: {
  meta: MediaMeta
  alt: string
}) {
  if (meta.kind === 'video') {
    return <video src={meta.url} controls playsInline muted loop />
  }
  return <img src={meta.url} alt={alt} />
}

export default function GifCompress() {
  const inputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mainTab, setMainTab] = useState<MainTab>('compress')
  const [convertId, setConvertId] = useState<ConvertId>('mov-to-gif')
  const tool: ToolId = mainTab === 'compress' ? 'compress' : convertId
  const activeTool =
    tool === 'compress'
      ? COMPRESS_TOOL
      : (CONVERT_TOOLS.find((t) => t.id === convertId) ?? CONVERT_TOOLS[0])
  const pageLead = mainTab === 'compress' ? COMPRESS_TOOL.lead : activeTool.lead

  const [preset, setPreset] = useState<PresetId>('recommended')
  const [lossy, setLossy] = useState(PRESETS.recommended.lossy)
  const [keepQuality, setKeepQuality] = useState(true)
  const [fps, setFps] = useState(15)
  const [maxWidth, setMaxWidth] = useState(1080)
  const [progress, setProgress] = useState(0)

  const [source, setSource] = useState<MediaMeta | null>(null)
  const [result, setResult] = useState<MediaMeta | null>(null)
  const [busy, setBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [previewTarget, setPreviewTarget] = useState<'source' | 'result' | null>(
    null,
  )
  const [compareMode, setCompareMode] = useState(false)
  const [status, setStatus] = useState(
    '选择功能后拖入文件，全程在本地浏览器完成。',
  )
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

  function resetResult() {
    setResult((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return null
    })
  }

  function clearMedia() {
    setSource((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return null
    })
    resetResult()
    setPreviewTarget(null)
    setCompareMode(false)
    setProgress(0)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function switchMainTab(next: MainTab) {
    setMainTab(next)
    clearMedia()
    setKeepQuality(true)
    setStatus(
      next === 'compress'
        ? '拖入 GIF 后即可压缩，全程在本地浏览器完成。'
        : '选择转换方式后拖入文件，全程在本地浏览器完成。',
    )
  }

  function switchConvert(next: ConvertId) {
    setConvertId(next)
    clearMedia()
    setKeepQuality(true)
    setStatus('选择转换方式后拖入文件，全程在本地浏览器完成。')
  }

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

  function loadFile(file: File | undefined | null) {
    if (!file) return
    if (!isAccepted(tool, file)) {
      setError(`当前功能不支持该文件类型，请上传：${activeTool.dropHint.replace('拖拽 ', '').replace(' 到这里', '')}`)
      return
    }

    setError(null)
    resetResult()
    setProgress(0)
    setSource((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return {
        file,
        url: URL.createObjectURL(file),
        bytes: file.size,
        kind: mediaKindFromFile(file),
      }
    })
    setPreviewTarget(null)
    setStatus(
      `已载入 ${file.name}（${formatBytes(file.size)}），可点击「${activeTool.actionLabel}」。`,
    )
  }

  async function runCompress() {
    if (!source) return
    const inputName = 'input.gif'
    const command = buildCompressCommand(inputName, lossy, source.bytes)
    const files = await gifsicle.run({
      input: [{ file: source.file, name: inputName }],
      command: [command],
    })
    const out = files?.[0]
    if (!out) throw new Error('压缩失败，未得到输出文件。')
    return new File([out], `${baseName(source.file.name)}-compressed.gif`, {
      type: 'image/gif',
    })
  }

  async function runConvert() {
    if (!source) return null
    const common = {
      onProgress: (ratio: number) => setProgress(ratio),
      onStatus: (message: string) => setStatus(message),
    }

    if (tool === 'mov-to-gif' || tool === 'mp4-to-gif') {
      const out = await videoToGif(source.file, {
        fps: keepQuality ? null : fps,
        maxWidth: keepQuality ? null : maxWidth,
        ...common,
      })
      return new File([out], `${baseName(source.file.name)}.gif`, {
        type: 'image/gif',
      })
    }
    if (tool === 'gif-to-mp4') {
      const out = await gifToMp4(source.file, common)
      return new File([out], `${baseName(source.file.name)}.mp4`, {
        type: 'video/mp4',
      })
    }
    if (tool === 'gif-to-mov') {
      const out = await gifToMov(source.file, common)
      return new File([out], `${baseName(source.file.name)}.mov`, {
        type: 'video/quicktime',
      })
    }
    return null
  }

  async function startAction() {
    if (!source || busy) return
    setBusy(true)
    setError(null)
    resetResult()
    setProgress(0)
    setStatus(
      tool === 'compress'
        ? '正在压缩…大文件可能需要几十秒，请稍候。'
        : '正在准备转换…',
    )

    try {
      const outFile =
        tool === 'compress' ? await runCompress() : await runConvert()
      if (!outFile) throw new Error('未得到输出文件。')

      const url = URL.createObjectURL(outFile)
      setResult({
        file: outFile,
        url,
        bytes: outFile.size,
        kind: mediaKindFromFile(outFile),
      })

      const saved = source.bytes - outFile.size
      const pct = source.bytes > 0 ? (saved / source.bytes) * 100 : 0
      if (tool === 'compress') {
        setStatus(
          pct > 0
            ? `完成：${formatBytes(source.bytes)} → ${formatBytes(outFile.size)}（减小 ${pct.toFixed(1)}%）`
            : `完成：输出 ${formatBytes(outFile.size)}`,
        )
      } else {
        setStatus(
          `完成：${formatBytes(source.bytes)} → ${formatBytes(outFile.size)}`,
        )
      }
      setProgress(1)
    } catch (err) {
      const message = err instanceof Error ? err.message : '处理失败'
      setError(message)
      setStatus('处理失败，请换一个文件或稍后再试。')
    } finally {
      setBusy(false)
    }
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
      ? sourceLabel(tool)
      : previewTarget === 'result'
        ? resultLabel(tool)
        : ''
  const canCompare = Boolean(source && result)
  const showCompare = compareMode && canCompare
  const isVideoToGif = tool === 'mov-to-gif' || tool === 'mp4-to-gif'

  const ratio =
    source && result && source.bytes > 0
      ? ((1 - result.bytes / source.bytes) * 100).toFixed(1)
      : null

  const activeHint =
    tool !== 'compress'
      ? isVideoToGif
        ? keepQuality
          ? '当前为原画质转换：保留原始尺寸与全部帧，不主动压缩体积。'
          : `自定义参数：${fps} fps，最大宽度 ${maxWidth}px（仅在需要时使用）。`
        : '格式转换默认高画质输出；体积变大/变小取决于格式本身，不是刻意压缩。'
      : preset === 'custom'
        ? `自定义 lossy=${lossy}：数值越大体积越小，噪点可能更明显（建议 20–60）。`
        : PRESETS[preset].hint

  return (
    <main className="gif-compress">
      <div className="gif-compress__shell">
        <header className="gif-compress__header">
          <p className="gif-compress__eyebrow">Local tool</p>
          <h1 className="gif-compress__title">gif压缩工具</h1>
          <p className="gif-compress__lead">
            {mainTab === 'convert' ? CONVERT_LEAD : pageLead}
          </p>
        </header>

        <section className="gif-compress__panel">
          <div className="gif-compress__tools" role="tablist" aria-label="功能">
            <button
              type="button"
              role="tab"
              aria-selected={mainTab === 'compress'}
              className={`gif-compress__tool${
                mainTab === 'compress' ? ' gif-compress__tool--active' : ''
              }`}
              onClick={() => switchMainTab('compress')}
            >
              GIF 压缩
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mainTab === 'convert'}
              className={`gif-compress__tool${
                mainTab === 'convert' ? ' gif-compress__tool--active' : ''
              }`}
              onClick={() => switchMainTab('convert')}
            >
              转格式
            </button>
          </div>

          {mainTab === 'convert' ? (
            <div
              className="gif-compress__subtools"
              role="tablist"
              aria-label="转换方式"
            >
              {CONVERT_TOOLS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={convertId === item.id}
                  className={`gif-compress__subtool${
                    convertId === item.id ? ' gif-compress__subtool--active' : ''
                  }`}
                  onClick={() => switchConvert(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}

          {mainTab === 'convert' ? (
            <p className="gif-compress__sublead">{activeTool.lead}</p>
          ) : null}

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
              {source ? source.file.name : activeTool.dropHint}
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
              accept={activeTool.accept}
              onChange={(e) => loadFile(e.target.files?.[0])}
            />
          </label>

          <div className="gif-compress__controls">
            {tool === 'compress' ? (
              <>
                <div>
                  <span className="gif-compress__label">压缩模式</span>
                  <div
                    className="gif-compress__presets"
                    role="group"
                    aria-label="压缩模式"
                  >
                    {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map(
                      (id) => (
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
                      ),
                    )}
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
              </>
            ) : null}

            {isVideoToGif ? (
              <>
                <div>
                  <span className="gif-compress__label">转换质量</span>
                  <div className="gif-compress__presets" role="group" aria-label="转换质量">
                    <button
                      type="button"
                      className={`gif-compress__preset${
                        keepQuality ? ' gif-compress__preset--active' : ''
                      }`}
                      onClick={() => setKeepQuality(true)}
                    >
                      原画质（推荐）
                    </button>
                    <button
                      type="button"
                      className={`gif-compress__preset${
                        !keepQuality ? ' gif-compress__preset--active' : ''
                      }`}
                      onClick={() => setKeepQuality(false)}
                    >
                      自定义参数
                    </button>
                  </div>
                </div>

                {!keepQuality ? (
                  <>
                    <div className="gif-compress__slider-row">
                      <div className="gif-compress__slider-meta">
                        <span>帧率 (fps)</span>
                        <strong>{fps}</strong>
                      </div>
                      <input
                        className="gif-compress__slider"
                        type="range"
                        min={6}
                        max={30}
                        step={1}
                        value={fps}
                        onChange={(e) => setFps(Number(e.target.value))}
                        aria-label="帧率"
                      />
                    </div>
                    <div className="gif-compress__slider-row">
                      <div className="gif-compress__slider-meta">
                        <span>最大宽度 (px)</span>
                        <strong>{maxWidth}</strong>
                      </div>
                      <input
                        className="gif-compress__slider"
                        type="range"
                        min={240}
                        max={1920}
                        step={40}
                        value={maxWidth}
                        onChange={(e) => setMaxWidth(Number(e.target.value))}
                        aria-label="最大宽度"
                      />
                    </div>
                  </>
                ) : null}
              </>
            ) : null}

            <div className="gif-compress__actions">
              <button
                type="button"
                className="gif-compress__btn gif-compress__btn--primary"
                disabled={!source || busy}
                onClick={() => void startAction()}
              >
                {busy
                  ? tool === 'compress'
                    ? '压缩中…'
                    : `转换中… ${Math.round(progress * 100)}%`
                  : activeTool.actionLabel}
              </button>
              {result ? (
                <a
                  className="gif-compress__btn gif-compress__btn--download"
                  href={result.url}
                  download={result.file.name}
                >
                  下载结果
                </a>
              ) : null}
              <button
                type="button"
                className="gif-compress__btn gif-compress__btn--ghost"
                disabled={busy || (!source && !result)}
                onClick={() => {
                  clearMedia()
                  setStatus('选择功能后拖入文件，全程在本地浏览器完成。')
                }}
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

          {busy && tool !== 'compress' ? (
            <div
              className="gif-compress__progress"
              role="progressbar"
              aria-valuenow={Math.round(progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="gif-compress__progress-bar"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          ) : null}

          {source ? (
            <>
              <div className="gif-compress__compare">
                <article className="gif-compress__card">
                  <div className="gif-compress__card-head">
                    <strong>{sourceLabel(tool)}</strong>
                    <span>{formatBytes(source.bytes)}</span>
                  </div>
                  <div className="gif-compress__preview">
                    <MediaPreview meta={source} alt="处理前预览" />
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
                    <strong>{resultLabel(tool)}</strong>
                    <span>{result ? formatBytes(result.bytes) : '—'}</span>
                  </div>
                  <div className="gif-compress__preview">
                    {result ? (
                      <MediaPreview meta={result} alt="处理后预览" />
                    ) : (
                      <span style={{ color: 'var(--gc-muted)', fontSize: 14 }}>
                        {busy ? '处理中…' : '等待处理'}
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
                    <span className="gif-compress__stat-label">结果</span>
                    <div className="gif-compress__stat-value">
                      {formatBytes(result.bytes)}
                    </div>
                  </div>
                  <div className="gif-compress__stat">
                    <span className="gif-compress__stat-label">
                      {Number(ratio) >= 0 ? '减小' : '增大'}
                    </span>
                    <div className="gif-compress__stat-value gif-compress__stat-value--good">
                      {Math.abs(Number(ratio)).toFixed(1)}%
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
          aria-label={showCompare ? '上下对比预览' : `${previewTitle}放大预览`}
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
                    <figcaption>
                      {sourceLabel(tool)} · {formatBytes(source.bytes)}
                    </figcaption>
                    <div className="gif-compress__modal-media">
                      <MediaPreview meta={source} alt="原文件对比预览" />
                    </div>
                  </figure>
                  <figure className="gif-compress__modal-figure">
                    <figcaption>
                      {resultLabel(tool)} · {formatBytes(result.bytes)}
                    </figcaption>
                    <div className="gif-compress__modal-media">
                      <MediaPreview meta={result} alt="结果对比预览" />
                    </div>
                  </figure>
                </>
              ) : (
                <figure className="gif-compress__modal-figure">
                  <div className="gif-compress__modal-media">
                    <MediaPreview
                      meta={previewItem}
                      alt={`${previewTitle}放大预览`}
                    />
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
