//! Type definitions for nokhwa-node bindings
//! 
//! This module contains all enum and struct type definitions used across the library.

use napi_derive::napi;

// ============================================================================
// Enums
// ============================================================================

/// API backend options for camera access
#[napi(string_enum)]
pub enum ApiBackend {
    Auto,
    MediaFoundation,
    AVFoundation,
    OpenCv,
    Browser,
}

/// Frame format types supported by the camera
#[napi(string_enum)]
#[derive(Clone, Copy)]
pub enum FrameFormat {
    MJPEG,
    YUYV,
    NV12,
    RGB,
    RGBA,
    GRAY,
}

/// Known camera control properties
#[napi(string_enum)]
pub enum KnownCameraControl {
    Brightness,
    Contrast,
    Saturation,
    Hue,
    WhiteBalance,
    Gamma,
    Sharpness,
    BacklightComp,
    Gain,
    Pan,
    Tilt,
    Zoom,
    Exposure,
    Iris,
    Focus,
}

/// Control value types for setting camera properties
#[napi]
pub enum ControlValueSetter {
    Integer(i64),
    Float(f64),
    Boolean(bool),
    String(String),
}

/// Format request types for automatic format selection
#[napi(string_enum)]
pub enum RequestedFormatType {
    AbsoluteHighestResolution,
    AbsoluteHighestFrameRate,
}

// ============================================================================
// Structs
// ============================================================================

/// Resolution dimensions
#[napi(object)]
#[derive(Clone)]
pub struct Resolution {
    pub width: u32,
    pub height: u32,
}

/// Camera format specification
#[napi(object)]
pub struct CameraFormat {
    pub resolution: Resolution,
    pub frame_rate: u32,
    pub format: FrameFormat,
}

/// Camera control descriptor
#[napi(object)]
pub struct CameraControl {
    pub name: String,
    pub control_type: String,
}

/// Camera device information
#[napi(object)]
pub struct CameraDevice {
    pub index: String,
    pub name: String,
}

/// Requested format configuration
#[napi(object)]
pub struct RequestedFormatConfig {
    pub request_type: RequestedFormatType,
}
