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

/** Video (mp4/mov) → GIF */
export async function videoToGif(
  input: File,
  options: {
    fps: number
    maxWidth: number
    onProgress?: FfmpegProgressHandler
    onStatus?: (message: string) => void
  },
): Promise<File> {
  const ext = input.name.toLowerCase().endsWith('.mov') ? 'mov' : 'mp4'
  const inputName = `input.${ext}`
  const outputName = 'output.gif'
  const vf = `fps=${options.fps},scale='min(${options.maxWidth},iw)':-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`

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

/** GIF → MP4 */
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
      '-vf',
      'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      outputName,
    ],
  })
}

/** GIF → MOV */
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
      '-vf',
      'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-f',
      'mov',
      outputName,
    ],
  })
}
