import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const CORE_BASE = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm'

let ffmpegSingleton: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null

export type FfmpegProgressHandler = (ratio: number) => void

export async function getFFmpeg(
  onProgress?: FfmpegProgressHandler,
): Promise<FFmpeg> {
  if (!ffmpegSingleton) {
    ffmpegSingleton = new FFmpeg()
  }

  if (onProgress) {
    ffmpegSingleton.on('progress', ({ progress }) => {
      onProgress(Math.max(0, Math.min(1, progress || 0)))
    })
  }

  if (!ffmpegSingleton.loaded) {
    if (!loadPromise) {
      loadPromise = (async () => {
        await ffmpegSingleton!.load({
          coreURL: await toBlobURL(
            `${CORE_BASE}/ffmpeg-core.js`,
            'text/javascript',
          ),
          wasmURL: await toBlobURL(
            `${CORE_BASE}/ffmpeg-core.wasm`,
            'application/wasm',
          ),
        })
        return ffmpegSingleton!
      })()
    }
    await loadPromise
  }

  return ffmpegSingleton
}

function asUint8Array(data: Uint8Array | string): Uint8Array {
  if (typeof data === 'string') {
    return new TextEncoder().encode(data)
  }
  return data
}

async function runConvert(options: {
  input: File
  inputName: string
  outputName: string
  args: string[]
  outputMime: string
  onProgress?: FfmpegProgressHandler
  onStatus?: (message: string) => void
}): Promise<File> {
  const {
    input,
    inputName,
    outputName,
    args,
    outputMime,
    onProgress,
    onStatus,
  } = options

  onStatus?.('正在加载转换引擎（首次约需下载 30MB）…')
  const ffmpeg = await getFFmpeg(onProgress)

  onStatus?.('正在写入文件…')
  await ffmpeg.writeFile(inputName, await fetchFile(input))

  onStatus?.('正在处理，请稍候…')
  const code = await ffmpeg.exec(args)
  if (code !== 0) {
    throw new Error(`处理失败（ffmpeg 退出码 ${code}）`)
  }

  const data = asUint8Array(await ffmpeg.readFile(outputName))
  const blob = new Blob([data], { type: outputMime })
  const file = new File([blob], outputName, { type: outputMime })

  try {
    await ffmpeg.deleteFile(inputName)
  } catch {
    /* ignore */
  }
  try {
    await ffmpeg.deleteFile(outputName)
  } catch {
    /* ignore */
  }

  return file
}

/** Video (mp4/mov) → GIF（默认保画质，不主动缩小/抽帧） */
export async function videoToGif(
  input: File,
  options: {
    fps: number | null
    maxWidth: number | null
    onProgress?: FfmpegProgressHandler
    onStatus?: (message: string) => void
  },
): Promise<File> {
  const ext = input.name.toLowerCase().endsWith('.mov') ? 'mov' : 'mp4'
  const inputName = `input.${ext}`
  const outputName = 'output.gif'

  const parts: string[] = []
  if (options.fps != null) parts.push(`fps=${options.fps}`)
  if (options.maxWidth != null) {
    parts.push(`scale='min(${options.maxWidth},iw)':-1:flags=lanczos`)
  } else {
    parts.push('scale=iw:-1:flags=lanczos')
  }
  parts.push(
    'split[s0][s1];[s0]palettegen=max_colors=256:stats_mode=full[p];[s1][p]paletteuse=dither=sierra2_4a',
  )

  return runConvert({
    input,
    inputName,
    outputName,
    outputMime: 'image/gif',
    onProgress: options.onProgress,
    onStatus: options.onStatus,
    args: ['-i', inputName, '-vf', parts.join(','), '-loop', '0', outputName],
  })
}

const HIGH_QUALITY_VIDEO_ARGS = [
  '-vf',
  'scale=trunc(iw/2)*2:trunc(ih/2)*2',
  '-c:v',
  'libx264',
  '-preset',
  'slow',
  '-crf',
  '15',
  '-pix_fmt',
  'yuv420p',
] as const

/** GIF → MP4（高画质） */
export async function gifToMp4(
  input: File,
  options?: {
    onProgress?: FfmpegProgressHandler
    onStatus?: (message: string) => void
  },
): Promise<File> {
  return runConvert({
    input,
    inputName: 'input.gif',
    outputName: 'output.mp4',
    outputMime: 'video/mp4',
    onProgress: options?.onProgress,
    onStatus: options?.onStatus,
    args: [
      '-i',
      'input.gif',
      ...HIGH_QUALITY_VIDEO_ARGS,
      '-movflags',
      '+faststart',
      'output.mp4',
    ],
  })
}

/** GIF → MOV（高画质） */
export async function gifToMov(
  input: File,
  options?: {
    onProgress?: FfmpegProgressHandler
    onStatus?: (message: string) => void
  },
): Promise<File> {
  return runConvert({
    input,
    inputName: 'input.gif',
    outputName: 'output.mov',
    outputMime: 'video/quicktime',
    onProgress: options?.onProgress,
    onStatus: options?.onStatus,
    args: [
      '-i',
      'input.gif',
      ...HIGH_QUALITY_VIDEO_ARGS,
      '-f',
      'mov',
      'output.mov',
    ],
  })
}

/** 压缩 MP4 / MOV：默认不改尺寸、不抽帧；可选按最大宽度缩放 */
export async function compressVideo(
  input: File,
  options: {
    format: 'mp4' | 'mov'
    crf: number
    /** null = 保持原始尺寸（仅做偶数对齐） */
    maxWidth: number | null
    onProgress?: FfmpegProgressHandler
    onStatus?: (message: string) => void
  },
): Promise<File> {
  const isMov = options.format === 'mov'
  const inputExt = input.name.toLowerCase().endsWith('.mov') ? 'mov' : 'mp4'
  const inputName = `input.${inputExt}`
  const outputName = isMov ? 'output.mov' : 'output.mp4'
  const outputMime = isMov ? 'video/quicktime' : 'video/mp4'
  const crf = Math.max(16, Math.min(35, Math.round(options.crf)))

  const scale =
    options.maxWidth != null && options.maxWidth > 0
      ? `scale='min(${Math.round(options.maxWidth)},iw)':-2`
      : 'scale=trunc(iw/2)*2:trunc(ih/2)*2'

  const args = [
    '-i',
    inputName,
    // 不改帧率，保留全部帧，保证流畅度
    '-vsync',
    '0',
    '-vf',
    scale,
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    String(crf),
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
  ]
  if (isMov) args.push('-f', 'mov', outputName)
  else args.push('-movflags', '+faststart', outputName)

  return runConvert({
    input,
    inputName,
    outputName,
    outputMime,
    onProgress: options.onProgress,
    onStatus: options.onStatus,
    args,
  })
}

/** luma amount: 轻 0.7 / 中 1.2 / 强 1.8 */
function unsharpAmount(level: 'light' | 'medium' | 'strong'): number {
  if (level === 'light') return 0.7
  if (level === 'strong') return 1.8
  return 1.2
}

/**
 * 增加清晰度（锐化）：GIF / MP4 / MOV 都可用。
 * 这是滤波器锐化，不是 AI 超分；尺寸保持不变。
 */
export async function enhanceClarity(
  input: File,
  options: {
    format: 'gif' | 'mp4' | 'mov'
    level: 'light' | 'medium' | 'strong'
    onProgress?: FfmpegProgressHandler
    onStatus?: (message: string) => void
  },
): Promise<File> {
  const amount = unsharpAmount(options.level)
  // unsharp + 轻微对比度，提升观感清晰度
  const sharpen = `unsharp=5:5:${amount}:5:5:0.0,eq=contrast=1.06:saturation=1.04`

  if (options.format === 'gif') {
    const vf = `${sharpen},split[s0][s1];[s0]palettegen=max_colors=256:stats_mode=full[p];[s1][p]paletteuse=dither=sierra2_4a`
    return runConvert({
      input,
      inputName: 'input.gif',
      outputName: 'output.gif',
      outputMime: 'image/gif',
      onProgress: options.onProgress,
      onStatus: options.onStatus,
      args: ['-i', 'input.gif', '-vf', vf, '-loop', '0', 'output.gif'],
    })
  }

  const isMov = options.format === 'mov'
  const inputExt = input.name.toLowerCase().endsWith('.mov') ? 'mov' : 'mp4'
  const inputName = `input.${inputExt}`
  const outputName = isMov ? 'output.mov' : 'output.mp4'
  const outputMime = isMov ? 'video/quicktime' : 'video/mp4'
  const vf = `scale=trunc(iw/2)*2:trunc(ih/2)*2,${sharpen}`

  const args = [
    '-i',
    inputName,
    '-vf',
    vf,
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '17',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
  ]
  if (isMov) args.push('-f', 'mov', outputName)
  else args.push('-movflags', '+faststart', outputName)

  return runConvert({
    input,
    inputName,
    outputName,
    outputMime,
    onProgress: options.onProgress,
    onStatus: options.onStatus,
    args,
  })
}
