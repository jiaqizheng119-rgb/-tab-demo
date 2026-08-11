import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gifsicle from 'gifsicle-wasm-browser'
import {
  compressVideo,
  enhanceClarity,
  gifToMov,
  gifToMp4,
  videoToGif,
} from '../lib/ffmpegClient'
import '../gif-compress.css'
import '../toolbox.css'

type MainTab = 'compress' | 'convert' | 'clarity'

type CompressId = 'gif' | 'mp4' | 'mov'
type ConvertId = 'mov-to-gif' | 'mp4-to-gif' | 'gif-to-mp4' | 'gif-to-mov'
type ClarityId = 'gif' | 'mp4' | 'mov'
type ToolId = `compress-${CompressId}` | ConvertId | `clarity-${ClarityId}`

type GifPresetId = 'recommended' | 'smaller' | 'custom'
type VideoPresetId = 'recommended' | 'smaller' | 'custom'
type ClarityLevel = 'light' | 'medium' | 'strong'

type MediaMeta = {
  file: File
  url: string
  bytes: number
  kind: 'image' | 'video'
  width: number | null
  height: number | null
}

type ToolConfig = {
  id: ToolId
  label: string
  accept: string
  dropHint: string
  actionLabel: string
  lead: string
}

const COMPRESS_TOOLS: Array<ToolConfig & { id: `compress-${CompressId}` }> = [
  {
    id: 'compress-gif',
    label: 'GIF 压缩',
    accept: 'image/gif,.gif',
    dropHint: '拖拽 GIF 到这里',
    actionLabel: '开始压缩',
    lead: '默认保持尺寸、帧数、颜色不变，尽量保清晰与流畅；仅压体积。自定义可按百分比调尺寸。',
  },
  {
    id: 'compress-mp4',
    label: 'MP4 压缩',
    accept: 'video/mp4,.mp4',
    dropHint: '拖拽 MP4 到这里',
    actionLabel: '开始压缩',
    lead: '默认不改尺寸、不抽帧，尽量保清晰与流畅；仅压体积。自定义可按百分比调尺寸。',
  },
  {
    id: 'compress-mov',
    label: 'MOV 压缩',
    accept: 'video/quicktime,.mov',
    dropHint: '拖拽 MOV 到这里',
    actionLabel: '开始压缩',
    lead: '默认不改尺寸、不抽帧，尽量保清晰与流畅；仅压体积。自定义可按百分比调尺寸。',
  },
]

const CONVERT_TOOLS: Array<ToolConfig & { id: ConvertId }> = [
  {
    id: 'mov-to-gif',
    label: 'MOV→GIF',
    accept: 'video/quicktime,.mov,video/mp4',
    dropHint: '拖拽 MOV 到这里',
    actionLabel: '开始转换',
    lead: '把 MOV 转成 GIF，默认保持原尺寸与全部帧，只做格式转换。',
  },
  {
    id: 'mp4-to-gif',
    label: 'MP4→GIF',
    accept: 'video/mp4,.mp4,video/*',
    dropHint: '拖拽 MP4 到这里',
    actionLabel: '开始转换',
    lead: '把 MP4 转成 GIF，默认保持原尺寸与全部帧，只做格式转换。',
  },
  {
    id: 'gif-to-mp4',
    label: 'GIF→MP4',
    accept: 'image/gif,.gif',
    dropHint: '拖拽 GIF 到这里',
    actionLabel: '开始转换',
    lead: '把 GIF 转成高画质 MP4，只做格式转换。',
  },
  {
    id: 'gif-to-mov',
    label: 'GIF→MOV',
    accept: 'image/gif,.gif',
    dropHint: '拖拽 GIF 到这里',
    actionLabel: '开始转换',
    lead: '把 GIF 转成高画质 MOV，只做格式转换。',
  },
]

const CLARITY_TOOLS: Array<ToolConfig & { id: `clarity-${ClarityId}` }> = [
  {
    id: 'clarity-gif',
    label: 'GIF',
    accept: 'image/gif,.gif',
    dropHint: '拖拽 GIF 到这里',
    actionLabel: '开始增强',
    lead: '对 GIF 做锐化增强，尺寸不变。这是滤镜清晰度，不是 AI 超分。',
  },
  {
    id: 'clarity-mp4',
    label: 'MP4',
    accept: 'video/mp4,.mp4',
    dropHint: '拖拽 MP4 到这里',
    actionLabel: '开始增强',
    lead: '对 MP4 做锐化增强，尺寸不变。这是滤镜清晰度，不是 AI 超分。',
  },
  {
    id: 'clarity-mov',
    label: 'MOV',
    accept: 'video/quicktime,.mov',
    dropHint: '拖拽 MOV 到这里',
    actionLabel: '开始增强',
    lead: '对 MOV 做锐化增强，尺寸不变。这是滤镜清晰度，不是 AI 超分。',
  },
]

const MAIN_LEADS: Record<MainTab, string> = {
  compress: '选择下方格式压缩。默认尽量保持尺寸、帧数、颜色与流畅清晰度；文件只在本地处理。',
  convert: '选择下方转换方式。默认保画质，不主动压缩；文件只在本地处理。',
  clarity:
    '选择下方格式增强清晰度（锐化）。尺寸不变；文件只在本地处理。',
}

const GIF_PRESETS: Record<
  Exclude<GifPresetId, 'custom'>,
  { label: string; lossy: number; hint: string }
> = {
  recommended: {
    label: '推荐画质',
    lossy: 20,
    hint: '尺寸/帧数/颜色不变，尽量保清晰流畅，体积通常可明显下降。',
  },
  smaller: {
    label: '更小体积',
    lossy: 40,
    hint: '尺寸/帧数/颜色不变，体积更小，肉眼差异通常很小。',
  },
}

const VIDEO_PRESETS: Record<
  Exclude<VideoPresetId, 'custom'>,
  { label: string; crf: number; hint: string }
> = {
  recommended: {
    label: '推荐画质',
    crf: 20,
    hint: '不改尺寸、不抽帧，尽量保清晰流畅；体积与画质较均衡。',
  },
  smaller: {
    label: '更小体积',
    crf: 26,
    hint: '不改尺寸、不抽帧；体积更小，画质略降。',
  },
}

const CLARITY_LEVELS: Array<{ id: ClarityLevel; label: string }> = [
  { id: 'light', label: '轻度' },
  { id: 'medium', label: '中度' },
  { id: 'strong', label: '较强' },
]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function buildGifCompressCommand(
  inputName: string,
  lossy: number,
  bytes: number,
  maxWidth: number | null,
): string {
  const optimize = bytes >= 8 * 1024 * 1024 ? '-O1' : '-O3'
  const resize =
    maxWidth != null && maxWidth > 0 ? ` --resize-width ${Math.round(maxWidth)}` : ''
  return `${optimize} --lossy=${lossy}${resize} ${inputName} -o /out/out.gif`
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

function readMediaSize(
  file: File,
  url: string,
): Promise<{ width: number | null; height: number | null }> {
  const kind = mediaKindFromFile(file)
  return new Promise((resolve) => {
    if (kind === 'video') {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth || null,
          height: video.videoHeight || null,
        })
        video.src = ''
      }
      video.onerror = () => resolve({ width: null, height: null })
      video.src = url
      return
    }
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.naturalWidth || null,
        height: img.naturalHeight || null,
      })
    }
    img.onerror = () => resolve({ width: null, height: null })
    img.src = url
  })
}

function formatSize(
  width: number | null,
  height: number | null,
  emptyLabel = '—',
): string {
  if (!width || !height) return emptyLabel
  return `${width} × ${height} px`
}

function findTool(tool: ToolId): ToolConfig {
  return (
    COMPRESS_TOOLS.find((t) => t.id === tool) ||
    CONVERT_TOOLS.find((t) => t.id === tool) ||
    CLARITY_TOOLS.find((t) => t.id === tool) ||
    COMPRESS_TOOLS[0]
  )
}

function isAccepted(tool: ToolId, file: File): boolean {
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()

  if (
    tool === 'compress-gif' ||
    tool === 'clarity-gif' ||
    tool === 'gif-to-mp4' ||
    tool === 'gif-to-mov'
  ) {
    return type.includes('gif') || name.endsWith('.gif')
  }
  if (tool === 'compress-mp4' || tool === 'clarity-mp4') {
    return name.endsWith('.mp4') || type.includes('mp4')
  }
  if (tool === 'mp4-to-gif') {
    return (
      name.endsWith('.mp4') ||
      name.endsWith('.mov') ||
      type.startsWith('video/')
    )
  }
  if (tool === 'compress-mov' || tool === 'clarity-mov') {
    return name.endsWith('.mov') || type.includes('quicktime')
  }
  if (tool === 'mov-to-gif') {
    return (
      name.endsWith('.mov') ||
      type.includes('quicktime') ||
      type.includes('mp4')
    )
  }
  return false
}

function sourceLabel(tool: ToolId): string {
  if (tool.includes('mov') && !tool.startsWith('gif-to')) return '原视频 (MOV)'
  if (tool.includes('mp4') && !tool.startsWith('gif-to')) return '原视频 (MP4)'
  if (tool.includes('gif')) return '原图 (GIF)'
  return '原文件'
}

function resultLabel(mainTab: MainTab, tool: ToolId): string {
  if (mainTab === 'compress') return '压缩后'
  if (mainTab === 'clarity') return '增强后'
  if (tool === 'mov-to-gif' || tool === 'mp4-to-gif') return 'GIF'
  if (tool === 'gif-to-mp4') return 'MP4'
  return 'MOV'
}

function MediaPreview({ meta, alt }: { meta: MediaMeta; alt: string }) {
  if (meta.kind === 'video') {
    return <video src={meta.url} controls playsInline muted loop />
  }
  return <img src={meta.url} alt={alt} />
}

export default function GifCompress() {
  const inputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mainTab, setMainTab] = useState<MainTab>('compress')
  const [compressId, setCompressId] = useState<CompressId>('gif')
  const [convertId, setConvertId] = useState<ConvertId>('mov-to-gif')
  const [clarityId, setClarityId] = useState<ClarityId>('gif')

  const tool: ToolId =
    mainTab === 'compress'
      ? `compress-${compressId}`
      : mainTab === 'convert'
        ? convertId
        : `clarity-${clarityId}`
  const activeTool = findTool(tool)

  const [gifPreset, setGifPreset] = useState<GifPresetId>('recommended')
  const [lossy, setLossy] = useState(GIF_PRESETS.recommended.lossy)
  const [videoPreset, setVideoPreset] = useState<VideoPresetId>('recommended')
  const [crf, setCrf] = useState(VIDEO_PRESETS.recommended.crf)
  const [scalePercent, setScalePercent] = useState<number | ''>(100)
  const [keepQuality, setKeepQuality] = useState(true)
  const [fps, setFps] = useState(15)
  const [maxWidth, setMaxWidth] = useState(1080)
  const [clarityLevel, setClarityLevel] = useState<ClarityLevel>('medium')
  const [progress, setProgress] = useState(0)

  const [source, setSource] = useState<MediaMeta | null>(null)
  const [result, setResult] = useState<MediaMeta | null>(null)
  const [busy, setBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [previewTarget, setPreviewTarget] = useState<'source' | 'result' | null>(
    null,
  )
  const [compareMode, setCompareMode] = useState(false)
  const [status, setStatus] = useState('选择功能后拖入文件，全程在本地浏览器完成。')
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
    setStatus('选择功能后拖入文件，全程在本地浏览器完成。')
  }

  function switchCompress(next: CompressId) {
    setCompressId(next)
    clearMedia()
    setScalePercent(100)
    setGifPreset('recommended')
    setLossy(GIF_PRESETS.recommended.lossy)
    setVideoPreset('recommended')
    setCrf(VIDEO_PRESETS.recommended.crf)
    setStatus('选择格式后拖入文件，全程在本地浏览器完成。')
  }

  function resolvedScalePercent(): number {
    if (scalePercent === '' || Number.isNaN(Number(scalePercent))) return 100
    return Math.min(200, Math.max(1, Number(scalePercent)))
  }

  function resolvedCustomWidth(): number | null {
    const percent = resolvedScalePercent()
    if (percent === 100) return null
    if (!source?.width) return null
    return Math.min(4096, Math.max(1, Math.round((source.width * percent) / 100)))
  }

  function scaledSize(): { width: number | null; height: number | null } {
    if (!source?.width || !source?.height) return { width: null, height: null }
    const percent = resolvedScalePercent()
    return {
      width: Math.max(1, Math.round((source.width * percent) / 100)),
      height: Math.max(1, Math.round((source.height * percent) / 100)),
    }
  }

  function switchConvert(next: ConvertId) {
    setConvertId(next)
    clearMedia()
    setKeepQuality(true)
    setStatus('选择转换方式后拖入文件，全程在本地浏览器完成。')
  }

  function switchClarity(next: ClarityId) {
    setClarityId(next)
    clearMedia()
    setStatus('选择格式后拖入文件，全程在本地浏览器完成。')
  }

  function applyGifPreset(next: GifPresetId) {
    setGifPreset(next)
    if (next !== 'custom') setLossy(GIF_PRESETS[next].lossy)
  }

  function onLossyChange(value: number) {
    setLossy(value)
    if (value === GIF_PRESETS.recommended.lossy) setGifPreset('recommended')
    else if (value === GIF_PRESETS.smaller.lossy) setGifPreset('smaller')
    else setGifPreset('custom')
  }

  function applyVideoPreset(next: VideoPresetId) {
    setVideoPreset(next)
    if (next !== 'custom') setCrf(VIDEO_PRESETS[next].crf)
  }

  function onCrfChange(value: number) {
    setCrf(value)
    if (value === VIDEO_PRESETS.recommended.crf) setVideoPreset('recommended')
    else if (value === VIDEO_PRESETS.smaller.crf) setVideoPreset('smaller')
    else setVideoPreset('custom')
  }

  function loadFile(file: File | undefined | null) {
    if (!file) return
    if (!isAccepted(tool, file)) {
      setError(
        `当前功能不支持该文件类型，请上传：${activeTool.dropHint
          .replace('拖拽 ', '')
          .replace(' 到这里', '')}`,
      )
      return
    }

    setError(null)
    resetResult()
    setProgress(0)
    setScalePercent(100)
    const url = URL.createObjectURL(file)
    setSource((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return {
        file,
        url,
        bytes: file.size,
        kind: mediaKindFromFile(file),
        width: null,
        height: null,
      }
    })
    setPreviewTarget(null)
    setStatus(
      `已载入 ${file.name}（${formatBytes(file.size)}），可点击「${activeTool.actionLabel}」。`,
    )

    void readMediaSize(file, url).then(({ width, height }) => {
      setSource((prev) => {
        if (!prev || prev.url !== url) return prev
        return { ...prev, width, height }
      })
    })
  }

  async function runAction(): Promise<File | null> {
    if (!source) return null
    const common = {
      onProgress: (ratio: number) => setProgress(ratio),
      onStatus: (message: string) => setStatus(message),
    }

    if (tool === 'compress-gif') {
      const inputName = 'input.gif'
      const width =
        gifPreset === 'custom' ? resolvedCustomWidth() : null
      const files = await gifsicle.run({
        input: [{ file: source.file, name: inputName }],
        command: [
          buildGifCompressCommand(inputName, lossy, source.bytes, width),
        ],
      })
      const out = files?.[0]
      if (!out) throw new Error('压缩失败，未得到输出文件。')
      return new File([out], `${baseName(source.file.name)}-compressed.gif`, {
        type: 'image/gif',
      })
    }

    if (tool === 'compress-mp4' || tool === 'compress-mov') {
      const format = tool === 'compress-mov' ? 'mov' : 'mp4'
      const width =
        videoPreset === 'custom' ? resolvedCustomWidth() : null
      const out = await compressVideo(source.file, {
        format,
        crf,
        maxWidth: width,
        ...common,
      })
      return new File([out], `${baseName(source.file.name)}-compressed.${format}`, {
        type: out.type,
      })
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

    if (tool === 'clarity-gif' || tool === 'clarity-mp4' || tool === 'clarity-mov') {
      const format = tool === 'clarity-gif' ? 'gif' : tool === 'clarity-mov' ? 'mov' : 'mp4'
      const out = await enhanceClarity(source.file, {
        format,
        level: clarityLevel,
        ...common,
      })
      return new File(
        [out],
        `${baseName(source.file.name)}-clarity.${format}`,
        { type: out.type },
      )
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
      mainTab === 'compress'
        ? '正在压缩…'
        : mainTab === 'clarity'
          ? '正在增强清晰度…'
          : '正在转换…',
    )

    try {
      const outFile = await runAction()
      if (!outFile) throw new Error('未得到输出文件。')

      const url = URL.createObjectURL(outFile)
      setResult({
        file: outFile,
        url,
        bytes: outFile.size,
        kind: mediaKindFromFile(outFile),
        width: null,
        height: null,
      })
      void readMediaSize(outFile, url).then(({ width, height }) => {
        setResult((prev) => {
          if (!prev || prev.url !== url) return prev
          return { ...prev, width, height }
        })
      })

      const saved = source.bytes - outFile.size
      const pct = source.bytes > 0 ? (saved / source.bytes) * 100 : 0
      if (mainTab === 'compress') {
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
        ? resultLabel(mainTab, tool)
        : ''
  const canCompare = Boolean(source && result)
  const showCompare = compareMode && canCompare
  const isVideoToGif = tool === 'mov-to-gif' || tool === 'mp4-to-gif'
  const isGifCompress = tool === 'compress-gif'
  const isVideoCompress = tool === 'compress-mp4' || tool === 'compress-mov'
  const usesFfmpegProgress = !isGifCompress

  const ratio =
    source && result && source.bytes > 0
      ? ((1 - result.bytes / source.bytes) * 100).toFixed(1)
      : null

  const activeHint = (() => {
    if (mainTab === 'clarity') {
      return `当前强度：${CLARITY_LEVELS.find((l) => l.id === clarityLevel)?.label}。过强可能出现锐化噪点。`
    }
    if (isVideoToGif) {
      return keepQuality
        ? '当前为原画质转换：保留原始尺寸与全部帧。'
        : `自定义参数：${fps} fps，最大宽度 ${maxWidth}px。`
    }
    if (isGifCompress) {
      const scaled = scaledSize()
      const widthHint =
        gifPreset === 'custom' && resolvedScalePercent() !== 100 && scaled.width
          ? `，缩放 ${resolvedScalePercent()}% → ${scaled.width}×${scaled.height}`
          : gifPreset === 'custom'
            ? '，尺寸保持原尺寸'
            : ''
      return gifPreset === 'custom'
        ? `自定义 lossy=${lossy}${widthHint}。默认仍尽量保帧数与颜色。`
        : GIF_PRESETS[gifPreset].hint
    }
    if (isVideoCompress) {
      const scaled = scaledSize()
      const widthHint =
        videoPreset === 'custom' && resolvedScalePercent() !== 100 && scaled.width
          ? `，缩放 ${resolvedScalePercent()}% → ${scaled.width}×${scaled.height}`
          : videoPreset === 'custom'
            ? '，尺寸保持原尺寸'
            : ''
      return videoPreset === 'custom'
        ? `自定义 CRF=${crf}${widthHint}。不抽帧，尽量保流畅。`
        : VIDEO_PRESETS[videoPreset].hint
    }
    return '格式转换默认高画质输出；体积变化取决于格式本身。'
  })()

  const subTools =
    mainTab === 'compress'
      ? COMPRESS_TOOLS
      : mainTab === 'convert'
        ? CONVERT_TOOLS
        : CLARITY_TOOLS

  const subSelected =
    mainTab === 'compress'
      ? `compress-${compressId}`
      : mainTab === 'convert'
        ? convertId
        : `clarity-${clarityId}`

  return (
    <main className="gif-compress">
      <div className="gif-compress__shell">
        <header className="gif-compress__header">
          <Link className="toolbox-page__back" to="/">
            ← 返回工具箱
          </Link>
          <h1 className="gif-compress__title">视频工具</h1>
          <p className="gif-compress__lead">{MAIN_LEADS[mainTab]}</p>
        </header>

        <section className="gif-compress__panel">
          <div className="gif-compress__tools" role="tablist" aria-label="功能">
            {(
              [
                ['compress', '压缩'],
                ['convert', '转格式'],
                ['clarity', '增加清晰度'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={mainTab === id}
                className={`gif-compress__tool${
                  mainTab === id ? ' gif-compress__tool--active' : ''
                }`}
                onClick={() => switchMainTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <div
            className="gif-compress__subtools"
            role="tablist"
            aria-label="二级功能"
          >
            {subTools.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={subSelected === item.id}
                className={`gif-compress__subtool${
                  subSelected === item.id ? ' gif-compress__subtool--active' : ''
                }`}
                onClick={() => {
                  if (mainTab === 'compress') {
                    switchCompress(item.id.replace('compress-', '') as CompressId)
                  } else if (mainTab === 'convert') {
                    switchConvert(item.id as ConvertId)
                  } else {
                    switchClarity(item.id.replace('clarity-', '') as ClarityId)
                  }
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <p className="gif-compress__sublead">{activeTool.lead}</p>

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
            {isGifCompress ? (
              <>
                <div>
                  <span className="gif-compress__label">压缩模式</span>
                  <div className="gif-compress__presets" role="group">
                    {(Object.keys(GIF_PRESETS) as Array<keyof typeof GIF_PRESETS>).map(
                      (id) => (
                        <button
                          key={id}
                          type="button"
                          className={`gif-compress__preset${
                            gifPreset === id ? ' gif-compress__preset--active' : ''
                          }`}
                          onClick={() => applyGifPreset(id)}
                        >
                          {GIF_PRESETS[id].label}
                        </button>
                      ),
                    )}
                    <button
                      type="button"
                      className={`gif-compress__preset${
                        gifPreset === 'custom' ? ' gif-compress__preset--active' : ''
                      }`}
                      onClick={() => setGifPreset('custom')}
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
                    value={lossy}
                    onChange={(e) => onLossyChange(Number(e.target.value))}
                  />
                </div>
                {gifPreset === 'custom' ? (
                  <div className="gif-compress__field-row">
                    <span className="gif-compress__label">调整尺寸</span>
                    <div className="gif-compress__size-row">
                      <div className="gif-compress__size-box">
                        <span className="gif-compress__size-caption">原尺寸</span>
                        <strong>
                          {formatSize(
                            source?.width ?? null,
                            source?.height ?? null,
                            source ? '读取中…' : '请先上传文件',
                          )}
                        </strong>
                      </div>
                      <div className="gif-compress__size-box gif-compress__size-box--input">
                        <span className="gif-compress__size-caption">缩放</span>
                        <div className="gif-compress__number-wrap">
                          <input
                            className="gif-compress__number"
                            type="number"
                            min={1}
                            max={200}
                            step={1}
                            value={scalePercent}
                            onChange={(e) => {
                              const v = e.target.value
                              setScalePercent(v === '' ? '' : Number(v))
                            }}
                            aria-label="缩放百分比"
                          />
                          <span>%</span>
                        </div>
                      </div>
                      <div className="gif-compress__size-box">
                        <span className="gif-compress__size-caption">调整后</span>
                        <strong>
                          {formatSize(
                            scaledSize().width,
                            scaledSize().height,
                            source ? '读取中…' : '请先上传文件',
                          )}
                        </strong>
                      </div>
                    </div>
                    <p className="gif-compress__field-hint">
                      100% 为原尺寸；小于 100% 会等比缩小。帧数/颜色尽量不变。
                    </p>
                  </div>
                ) : null}
              </>
            ) : null}

            {isVideoCompress ? (
              <>
                <div>
                  <span className="gif-compress__label">压缩模式</span>
                  <div className="gif-compress__presets" role="group">
                    {(
                      Object.keys(VIDEO_PRESETS) as Array<keyof typeof VIDEO_PRESETS>
                    ).map((id) => (
                      <button
                        key={id}
                        type="button"
                        className={`gif-compress__preset${
                          videoPreset === id ? ' gif-compress__preset--active' : ''
                        }`}
                        onClick={() => applyVideoPreset(id)}
                      >
                        {VIDEO_PRESETS[id].label}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`gif-compress__preset${
                        videoPreset === 'custom'
                          ? ' gif-compress__preset--active'
                          : ''
                      }`}
                      onClick={() => setVideoPreset('custom')}
                    >
                      自定义
                    </button>
                  </div>
                </div>
                <div className="gif-compress__slider-row">
                  <div className="gif-compress__slider-meta">
                    <span>CRF（越大越小）</span>
                    <strong>{crf}</strong>
                  </div>
                  <input
                    className="gif-compress__slider"
                    type="range"
                    min={16}
                    max={35}
                    value={crf}
                    onChange={(e) => onCrfChange(Number(e.target.value))}
                  />
                </div>
                {videoPreset === 'custom' ? (
                  <div className="gif-compress__field-row">
                    <span className="gif-compress__label">调整尺寸</span>
                    <div className="gif-compress__size-row">
                      <div className="gif-compress__size-box">
                        <span className="gif-compress__size-caption">原尺寸</span>
                        <strong>
                          {formatSize(
                            source?.width ?? null,
                            source?.height ?? null,
                            source ? '读取中…' : '请先上传文件',
                          )}
                        </strong>
                      </div>
                      <div className="gif-compress__size-box gif-compress__size-box--input">
                        <span className="gif-compress__size-caption">缩放</span>
                        <div className="gif-compress__number-wrap">
                          <input
                            className="gif-compress__number"
                            type="number"
                            min={1}
                            max={200}
                            step={1}
                            value={scalePercent}
                            onChange={(e) => {
                              const v = e.target.value
                              setScalePercent(v === '' ? '' : Number(v))
                            }}
                            aria-label="缩放百分比"
                          />
                          <span>%</span>
                        </div>
                      </div>
                      <div className="gif-compress__size-box">
                        <span className="gif-compress__size-caption">调整后</span>
                        <strong>
                          {formatSize(
                            scaledSize().width,
                            scaledSize().height,
                            source ? '读取中…' : '请先上传文件',
                          )}
                        </strong>
                      </div>
                    </div>
                    <p className="gif-compress__field-hint">
                      100% 为原尺寸；小于 100% 会等比缩小。不抽帧，尽量保流畅。
                    </p>
                  </div>
                ) : null}
              </>
            ) : null}

            {isVideoToGif ? (
              <>
                <div>
                  <span className="gif-compress__label">转换质量</span>
                  <div className="gif-compress__presets" role="group">
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
                        value={fps}
                        onChange={(e) => setFps(Number(e.target.value))}
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
                      />
                    </div>
                  </>
                ) : null}
              </>
            ) : null}

            {mainTab === 'clarity' ? (
              <div>
                <span className="gif-compress__label">增强强度</span>
                <div className="gif-compress__presets" role="group">
                  {CLARITY_LEVELS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`gif-compress__preset${
                        clarityLevel === item.id
                          ? ' gif-compress__preset--active'
                          : ''
                      }`}
                      onClick={() => setClarityLevel(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="gif-compress__actions">
              <button
                type="button"
                className="gif-compress__btn gif-compress__btn--primary"
                disabled={!source || busy}
                onClick={() => void startAction()}
              >
                {busy
                  ? usesFfmpegProgress
                    ? `处理中… ${Math.round(progress * 100)}%`
                    : '处理中…'
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

          {busy && usesFfmpegProgress ? (
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
                    <strong>{resultLabel(mainTab, tool)}</strong>
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
                      {resultLabel(mainTab, tool)} · {formatBytes(result.bytes)}
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
