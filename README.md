# nokhwa-node

![CI](https://github.com/nglmercer/nokhwa-node/workflows/CI/badge.svg)

Node.js bindings for [nokhwa](https://github.com/l1npengtul/nokhwa) camera library using [napi-rs](https://napi.rs/). This package provides native performance for camera access across multiple platforms including WebAssembly via WASI.

## Features

- **Cross-platform support**: macOS, Linux (glibc & musl), Windows, FreeBSD, and WebAssembly (WASI)
- **High performance**: Native Rust implementation with N-API for optimal speed
- **WebAssembly support**: Run camera operations in browser and edge environments via WASI
- **Thread-safe**: Multi-threaded camera access support
- **Easy to use**: Simple JavaScript/TypeScript API

## Supported Platforms

| Platform | Architecture | Status |
|----------|-------------|--------|
| macOS | x86_64, ARM64 (Apple Silicon) | ✅ |
| Windows | x86_64, i686, ARM64 | ✅ |
| Linux | x86_64, aarch64 (glibc & musl) | ✅ |
| FreeBSD | x86_64 | ✅ |
| WebAssembly | wasm32-wasip1-threads | ✅ |

## Installation

```bash
npm install nokhwa-node
```

## Usage

```typescript
import { Camera, CameraFormat } from 'nokhwa-node';

// List available cameras
const cameras = await Camera.list_cameras();
console.log('Available cameras:', cameras);

// Open a camera
const camera = new Camera(0, {
  width: 640,
  height: 480,
  format: 'mjpeg',
});

// Start the camera stream
await camera.open_stream();

// Capture a frame
const frame = await camera.frame();
console.log('Frame size:', frame.len);

// Close the camera
camera.stop();
```

## Building Locally

### Prerequisites

- **Rust**: Latest stable version
- **Node.js**: >= 10 (NAPI support)
- **Yarn**: 1.x or higher

### Standard Build

```bash
# Install dependencies
yarn install

# Build for current platform
yarn build

# Run tests
yarn test
```

### Building for WebAssembly (WASI)

To build for the `wasm32-wasip1-threads` target locally, you need to install the WASI SDK and configure your build environment:

```bash
# Download and extract WASI SDK
wget https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-22/wasi-sdk-22.0-linux.tar.gz
tar xvf wasi-sdk-22.0-linux.tar.gz

# Set environment variables
export WASI_SDK_PATH="$(pwd)/wasi-sdk-22.0"
export CC="${WASI_SDK_PATH}/bin/clang"
export AR="${WASI_SDK_PATH}/bin/llvm-ar"
export CFLAGS="--sysroot=${WASI_SDK_PATH}/share/wasi-sysroot"

# Build for WASI target
yarn build --platform --target wasm32-wasip1-threads
```

### Building for Specific Platforms

```bash
# Build for all supported platforms
yarn build --platform

# Build for a specific target
yarn build --platform --target x86_64-unknown-linux-gnu
```

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and automated releases. The CI pipeline builds and tests across all supported platforms:

### Build Matrix

- **Node.js versions**: 20, 22
- **Platforms**: 
  - macOS (x86_64, ARM64)
  - Windows (x86_64, i686, ARM64)
  - Linux (x86_64, aarch64 with glibc & musl)
  - FreeBSD (x86_64)
  - WebAssembly (wasm32-wasip1-threads)

### WASI Build Configuration

The WebAssembly build requires special handling to ensure all necessary libc headers are available. The CI workflow automatically:

1. **Installs WASI SDK** - Downloads wasi-sdk-22.0 for the wasm target
2. **Configures environment variables**:
   - `CC`: Points to WASI SDK's clang compiler
   - `AR`: Points to WASI SDK's llvm-ar
   - `CFLAGS`: Sets `--sysroot` to the WASI sysroot
3. **Builds with proper toolchain** - Ensures clang can find libc headers like `bits/libc-header-start.h`

### Testing

All builds are automatically tested using [AVA](https://avajs.dev/) across different Node.js versions to ensure compatibility and correctness.

## Development

### Running Benchmarks

```bash
# Build and run benchmarks
yarn bench

# Build in debug mode and run benchmarks
yarn bench:debug
```

### Code Formatting

```bash
# Format all code (JavaScript, TypeScript, Rust, TOML)
yarn format

# Format individual parts
yarn format:prettier  # JS/TS/YAML/MD/JSON
yarn format:rs        # Rust
yarn format:toml       # TOML
```

### Linting

```bash
# Run linter
yarn lint
```

## Release Process

The release process is automated via GitHub Actions:

1. Update version using semantic versioning:
   ```bash
   npm version [major | minor | patch]
   ```
2. Push to trigger the release workflow:
   ```bash
   git push
   ```

The CI pipeline will:
- Build binaries for all supported platforms
- Run tests across all platforms and Node.js versions
- Publish platform-specific packages to npm
- Publish the main package with optional dependencies

### Platform-Specific Packages

For optimal user experience, this package publishes separate npm packages for each platform:

- `@nokhwa/node-darwin-x64`
- `@nokhwa/node-darwin-arm64`
- `@nokhwa/node-win32-x64`
- `@nokhwa/node-win32-ia32`
- `@nokhwa/node-win32-arm64`
- `@nokhwa/node-linux-x64-gnu`
- `@nokhwa/node-linux-x64-musl`
- `@nokhwa/node-linux-arm64-gnu`
- `@nokhwa/node-linux-arm64-musl`
- `@nokhwa/node-freebsd-x64`
- `@nokhwa/node-wasm32-wasi`

NPM automatically selects the correct package for the user's platform, eliminating the need for users to install build toolchains or download binaries manually.

### Setup for Release

Ensure you've added your `NPM_TOKEN` in GitHub repository settings:

1. Go to **Settings → Secrets and variables → Actions**
2. Add a new secret named `NPM_TOKEN` with your npm authentication token

⚠️ **Important**: Do not run `npm publish` manually. Use the automated release workflow instead.

## Troubleshooting

### WASI Build Failures

If you encounter errors like `bits/libc-header-start.h: No such file or directory` when building for WebAssembly:

1. Ensure WASI SDK is properly installed
2. Verify the `WASI_SYSROOT` environment variable is set correctly
3. Check that `CC` and `AR` point to the WASI SDK tools
4. Make sure `CFLAGS` includes the `--sysroot` flag

Example:
```bash
export WASI_SYSROOT="/path/to/wasi-sdk-22.0/share/wasi-sysroot"
export CC="/path/to/wasi-sdk-22.0/bin/clang"
export AR="/path/to/wasi-sdk-22.0/bin/llvm-ar"
export CFLAGS="--sysroot=$WASI_SYSROOT"
```

### Platform-Specific Issues

For platform-specific build issues, ensure you have the required toolchain:

- **macOS**: Xcode Command Line Tools
- **Linux**: `gcc`, `glibc-devel` (or `musl-dev` for musl builds)
- **Windows**: Visual Studio Build Tools or MSVC
- **FreeBSD**: Build environment with proper development tools

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [nokhwa](https://github.com/l1npengtul/nokhwa) - The underlying Rust camera library
- [napi-rs](https://napi.rs/) - Framework for building Node.js native modules in Rust
- [WASI SDK](https://github.com/WebAssembly/wasi-sdk) - WebAssembly System Interface toolchain

## Links

- [GitHub Repository](https://github.com/nglmercer/nokhwa-node)
- [NPM Package](https://www.npmjs.com/package/nokhwa-node)
- [Documentation](https://github.com/nglmercer/nokhwa-node#readme)
