declare module 'gifsicle-wasm-browser' {
  export type GifsicleInput = {
    file: string | Blob | File | ArrayBuffer | Uint8Array
    name: string
  }

  export type GifsicleRunOptions = {
    input: GifsicleInput[]
    command: string[]
  }

  export type GifsicleApi = {
    run: (options: GifsicleRunOptions) => Promise<File[] | null>
  }

  const gifsicle: GifsicleApi
  export default gifsicle
}
