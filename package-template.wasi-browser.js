import {
  createOnMessage as __wasmCreateOnMessageForFsProxy,
  getDefaultContext as __emnapiGetDefaultContext,
  instantiateNapiModuleSync as __emnapiInstantiateNapiModuleSync,
  WASI as __WASI,
} from '@napi-rs/wasm-runtime'



const __wasi = new __WASI({
  version: 'preview1',
})

const __wasmUrl = new URL('./package-template.wasm32-wasi.wasm', import.meta.url).href
const __emnapiContext = __emnapiGetDefaultContext()


const __sharedMemory = new WebAssembly.Memory({
  initial: 4000,
  maximum: 65536,
  shared: true,
})

const __wasmFile = await fetch(__wasmUrl).then((res) => res.arrayBuffer())

const {
  instance: __napiInstance,
  module: __wasiModule,
  napiModule: __napiModule,
} = __emnapiInstantiateNapiModuleSync(__wasmFile, {
  context: __emnapiContext,
  asyncWorkPoolSize: 4,
  wasi: __wasi,
  onCreateWorker() {
    const worker = new Worker(new URL('./wasi-worker-browser.mjs', import.meta.url), {
      type: 'module',
    })

    return worker
  },
  overwriteImports(importObject) {
    importObject.env = {
      ...importObject.env,
      ...importObject.napi,
      ...importObject.emnapi,
      memory: __sharedMemory,
    }
    return importObject
  },
  beforeInit({ instance }) {
    for (const name of Object.keys(instance.exports)) {
      if (name.startsWith('__napi_register__')) {
        instance.exports[name]()
      }
    }
  },
})
export default __napiModule.exports
export const Camera = __napiModule.exports.Camera
export const CameraBuffer = __napiModule.exports.CameraBuffer
export const allKnownCameraControls = __napiModule.exports.allKnownCameraControls
export const ApiBackend = __napiModule.exports.ApiBackend
export const bufBgrToRgb = __napiModule.exports.bufBgrToRgb
export const bufMjpegToRgb = __napiModule.exports.bufMjpegToRgb
export const bufNv12ToRgb = __napiModule.exports.bufNv12ToRgb
export const bufYuyv422ToRgb = __napiModule.exports.bufYuyv422ToRgb
export const colorFrameFormats = __napiModule.exports.colorFrameFormats
export const FrameFormat = __napiModule.exports.FrameFormat
export const frameFormats = __napiModule.exports.frameFormats
export const KnownCameraControl = __napiModule.exports.KnownCameraControl
export const listCameras = __napiModule.exports.listCameras
export const mjpegToRgb = __napiModule.exports.mjpegToRgb
export const nativeApiBackend = __napiModule.exports.nativeApiBackend
export const nokhwaCheck = __napiModule.exports.nokhwaCheck
export const nv12ToRgb = __napiModule.exports.nv12ToRgb
export const query = __napiModule.exports.query
export const RequestedFormatType = __napiModule.exports.RequestedFormatType
export const yuyv422PredictedSize = __napiModule.exports.yuyv422PredictedSize
export const yuyv422ToRgb = __napiModule.exports.yuyv422ToRgb
