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

  onStatus?.('正在转换，请稍候…')
  const code = await ffmpeg.exec(args)
  if (code !== 0) {
    throw new Error(`转换失败（ffmpeg 退出码 ${code}）`)
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
    /** null = 保留全部帧，不抽帧 */
    fps: number | null
    /** null = 保持原始宽度 */
    maxWidth: number | null
    onProgress?: FfmpegProgressHandler
    onStatus?: (message: string) => void
  },
): Promise<File> {
  const ext = input.name.toLowerCase().endsWith('.mov') ? 'mov' : 'mp4'
  const inputName = `input.${ext}`
  const outputName = 'output.gif'

  const parts: string[] = []
  if (options.fps != null) {
    parts.push(`fps=${options.fps}`)
  }
  if (options.maxWidth != null) {
    parts.push(
      `scale='min(${options.maxWidth},iw)':-1:flags=lanczos`,
    )
  } else {
    parts.push('scale=iw:-1:flags=lanczos')
  }
  parts.push(
    'split[s0][s1];[s0]palettegen=max_colors=256:stats_mode=full[p];[s1][p]paletteuse=dither=sierra2_4a',
  )
  const vf = parts.join(',')

  return runConvert({
    input,
    inputName,
    outputName,
    outputMime: 'image/gif',
    onProgress: options.onProgress,
    onStatus: options.onStatus,
    args: ['-i', inputName, '-vf', vf, '-loop', '0', outputName],
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

/** GIF → MP4（高码率保画质，不做额外压缩） */
export async function gifToMp4(
  input: File,
  options?: {
    onProgress?: FfmpegProgressHandler
    onStatus?: (message: string) => void
  },
): Promise<File> {
  const inputName = 'input.gif'
  const outputName = 'output.mp4'
  return runConvert({
    input,
    inputName,
    outputName,
    outputMime: 'video/mp4',
    onProgress: options?.onProgress,
    onStatus: options?.onStatus,
    args: [
      '-i',
      inputName,
      ...HIGH_QUALITY_VIDEO_ARGS,
      '-movflags',
      '+faststart',
      outputName,
    ],
  })
}

/** GIF → MOV（高码率保画质，不做额外压缩） */
export async function gifToMov(
  input: File,
  options?: {
    onProgress?: FfmpegProgressHandler
    onStatus?: (message: string) => void
  },
): Promise<File> {
  const inputName = 'input.gif'
  const outputName = 'output.mov'
  return runConvert({
    input,
    inputName,
    outputName,
    outputMime: 'video/quicktime',
    onProgress: options?.onProgress,
    onStatus: options?.onStatus,
    args: [
      '-i',
      inputName,
      ...HIGH_QUALITY_VIDEO_ARGS,
      '-f',
      'mov',
      outputName,
    ],
  })
}

