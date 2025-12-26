# Refactoring Documentation

## Overview

This document describes the modularization and refactoring improvements made to the nokhwa-node codebase to improve code organization, maintainability, and exports.

## Changes Made

### 1. New Modular Structure

The monolithic `src/lib.rs` has been split into focused modules:

#### `src/types.rs`
- Contains all type definitions (enums and structs)
- Exports: `ApiBackend`, `FrameFormat`, `KnownCameraControl`, `ControlValueSetter`, `RequestedFormatType`
- Exports: `Resolution`, `CameraFormat`, `CameraControl`, `CameraDevice`, `RequestedFormatConfig`

#### `src/buffer.rs`
- Handles camera frame buffer operations
- Provides `CameraBuffer` class with methods for frame data access
- Added utility methods: `size()`, `is_empty()`

#### `src/conversions.rs`
- Manages type conversions between nokhwa and N-API types
- Handles frame format conversions (RGB, RGBA, YUYV, MJPEG, NV12)
- Provides conversion functions for backends, controls, and formats
- Exports `Frame` structure for captured frames

#### `src/camera.rs`
- Manages camera discovery and listing
- Provides `list_cameras()` function

#### `src/lib.rs` (Main Entry Point)
- Re-exports all public types and classes
- Implements `Camera` class with all N-API methods
- Exports utility functions for camera discovery, system info, and buffer conversions

### 2. Improved Exports

All methods and types are now properly exported with `#[napi]` annotations:

**Camera Class Methods:**
- `new(camera_index: string)` - Constructor
- `capture_frame()` - Capture RGBA frame
- `index()` - Get camera index
- `backend()` - Get backend type
- `info()` - Get camera info
- `camera_format()` - Get current format
- `refresh_camera_format()` - Refresh format
- `set_camera_request(request)` - Set format
- `compatible_camera_formats()` - Get compatible formats
- `supported_camera_controls()` - Get supported controls
- `camera_controls()` - Get all controls
- `set_camera_control(control, value)` - Set control value
- `is_stream_open()` - Check stream status
- `open_stream()` - Open stream
- `stop_stream()` - Stop stream
- `frame_raw()` - Get raw frame data

**Utility Functions:**
- `list_cameras()` - List all cameras
- `query(backend)` - Query with backend
- `nokhwa_check()` - Check initialization
- `native_api_backend()` - Get native backend
- `all_known_camera_controls()` - Get all controls
- `frame_formats()` - Get all formats
- `color_frame_formats()` - Get color formats
- `buf_bgr_to_rgb()`, `buf_mjpeg_to_rgb()`, `buf_nv12_to_rgb()`, `buf_yuyv422_to_rgb()` - Buffer conversions
- `mjpeg_to_rgb()`, `nv12_to_rgb()`, `yuyv422_to_rgb()` - Convenience conversions
- `yuyv422_predicted_size()` - Get predicted size

**CameraBuffer Class Methods:**
- `new(resolution, data, source_frame_format)` - Constructor
- `resolution()` - Get resolution
- `data()` - Get buffer data
- `source_frame_format()` - Get format
- `width()` - Get width
- `height()` - Get height
- `size()` - Get size in bytes (NEW)
- `is_empty()` - Check if empty (NEW)

### 3. TypeScript Definitions Updated

The `index.d.ts` file has been updated to reflect all changes:
- Added `size()` and `isEmpty()` methods to CameraBuffer
- Improved documentation comments
- All types properly exported

### 4. Code Quality Improvements

- **Better separation of concerns**: Each module has a single, well-defined responsibility
- **Improved documentation**: Added module-level documentation and inline comments
- **Type safety**: Clear distinction between nokhwa types and N-API types
- **Maintainability**: Easier to locate and modify specific functionality
- **Testability**: Modular structure enables better unit testing

## Benefits

1. **Easier Navigation**: Clear file structure makes it easy to find specific functionality
2. **Better Organization**: Related code grouped together in focused modules
3. **Improved Maintainability**: Changes to specific areas don't require touching the entire codebase
4. **Enhanced Readability**: Smaller, focused files are easier to understand
5. **Better Exports**: All public APIs properly documented and exported
6. **Type Safety**: Clear type conversions between nokhwa and N-API

## Backward Compatibility

All existing APIs remain unchanged. This refactoring is internal only and maintains full backward compatibility with the previous API.

## Testing

Run the benchmark to verify functionality:
```bash
npm run bench
```

Build the project:
```bash
npm run build:debug
```

Run tests:
```bash
npm test
