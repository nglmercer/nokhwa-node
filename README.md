# nokhwa-node

![CI](https://github.com/nglmercer/nokhwa-node/workflows/CI/badge.svg)
[![npm version](https://img.shields.io/npm/v/nokhwa-node.svg)](https://www.npmjs.com/package/nokhwa-node)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**nokhwa-node** provides high-performance Node.js bindings for the [nokhwa](https://github.com/l1npengtul/nokhwa) Rust camera library. It allows you to access webcams and video capture devices across multiple platforms with a simple, thread-safe API.

## 🚀 Features

- **Blazing Fast**: Native Rust implementation using [napi-rs](https://napi.rs/).
- **Cross-platform**: Support for Windows, macOS, Linux, FreeBSD, and WebAssembly (WASI).
- **Auto-Discovery**: Easily list and query available camera devices.
- **Robust Format Selection**: Automatic fallback strategies to find the best working format for your device.
- **Control Hardware**: Set brightness, contrast, zoom, exposure, and more.
- **Buffer Conversions**: Built-in utilities to convert between MJPEG, YUYV, NV12, and RGB/RGBA.

## 📦 Installation

```bash
npm install nokhwa-node
```

## 🛠️ Usage

### Basic Capture

```typescript
import { listCameras, Camera } from 'nokhwa-node'

// 1. List available cameras
const cameras = listCameras()
console.log('Detected cameras:', cameras)

if (cameras.length > 0) {
  // 2. Open the first camera (index is a string, e.g., "0")
  // The stream is opened automatically on initialization.
  const camera = new Camera(cameras[0].index)

  console.log(`Using camera: ${camera.info().name}`)

  // 3. Capture a frame
  // Returns a Frame object: { data: Buffer (RGBA), width: number, height: number }
  const frame = camera.captureFrame()
  console.log(`Captured ${frame.width}x${frame.height} frame`)

  // 4. Stop the stream when done
  camera.stopStream()
}
```

### Camera Controls

```typescript
import { Camera, KnownCameraControl } from 'nokhwa-node'

const camera = new Camera('0')

// Get supported controls for this device
const controls = camera.supportedCameraControls()
console.log('Supported controls:', controls)

// Set brightness (value type depends on the control)
camera.setCameraControl(KnownCameraControl.Brightness, {
  type: 'Float',
  field0: 0.5,
})
```

### Manual Stream Management

```typescript
const camera = new Camera('0')

// Check if stream is active
if (camera.isStreamOpen()) {
  camera.stopStream()
}

// Re-open later
camera.openStream()
```

## 🌍 Supported Platforms

| OS              | Architectures              |
| --------------- | -------------------------- |
| **Windows**     | x64, x86, ARM64            |
| **macOS**       | x64, ARM64 (Apple Silicon) |
| **Linux**       | x64, ARM64 (glibc & musl)  |
| **FreeBSD**     | x86_64                     |
| **WebAssembly** | wasm32-wasip1-threads      |

## 📖 API Reference

### Global Functions

- `listCameras()`: Returns `Array<CameraDevice>` - Lists all detected cameras.
- `query(backend: ApiBackend)`: Returns `Array<CameraDevice>` - Query cameras for a specific backend.
- `nokhwaCheck()`: Returns `boolean` - Checks if nokhwa is initialized and functional.
- `nativeApiBackend()`: Returns `ApiBackend | null` - Gets the default native backend for the current platform.

### Camera Class

- `constructor(cameraIndex: string)`: Creates and automatically opens a camera.
- `captureFrame()`: Returns `Frame` - Captures an RGBA frame.
- `info()`: Returns `CameraDevice` - Name and index of the camera.
- `backend()`: Returns `ApiBackend` - The backend being used (e.g., "MediaFoundation", "AVFoundation").
- `cameraFormat()`: Returns `CameraFormat` - Current resolution, frame rate, and pixel format.
- `refreshCameraFormat()`: Returns `CameraFormat` - Refreshes and returns the active camera format.
- `setCameraRequest(request: RequestedFormatConfig)`: Request a format change (e.g., "AbsoluteHighestFrameRate").
- `compatibleCameraFormats()`: Returns `Array<CameraFormat>` - List all formats supported by the device.
- `supportedCameraControls()`: Returns `Array<KnownCameraControl>`.
- `setCameraControl(control, value)`: Sets a hardware control value.
- `openStream()`: Opens the camera stream.
- `stopStream()`: Stops the camera stream.
- `frameRaw()`: Returns `CameraBuffer` - Gets raw frame data without RGBA conversion.

### Core Types

```typescript
interface CameraDevice {
  index: string
  name: string
}

interface Frame {
  data: Buffer // RGBA data
  width: number
  height: number
}

interface CameraFormat {
  resolution: { width: number; height: number }
  frameRate: number
  format: FrameFormat
}
```

## 🛠️ Development

### Building from source

```bash
# Install dependencies
npm install

# Build the native module
npm run build

# Run tests
npm test
```

### Benchmarks

Execute performance benchmarks to see how fast frame capture and conversion are:

```bash
npm run bench
```

## 📄 License

MIT © [nglmercer](https://github.com/nglmercer)

## Acknowledgments

- [nokhwa](https://github.com/l1npengtul/nokhwa) - The underlying Rust camera library.
- [napi-rs](https://napi.rs/) - Framework for building Node.js native modules in Rust.
