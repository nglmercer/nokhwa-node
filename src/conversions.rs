//! Conversion utilities for nokhwa-node
//! 
//! This module provides conversion functions between nokhwa types and N-API types,
//! as well as frame format conversions.

use anyhow::anyhow;
use napi::bindgen_prelude::*;
use napi_derive::napi;
use nokhwa::pixel_format::*;
use nokhwa::utils::FrameFormat;

use crate::types::*;

// ============================================================================
// Frame Conversion
// ============================================================================

/// RGBA frame data (internal representation)
pub struct RgbaFrame {
    pub data: Vec<u8>,
    pub width: u32,
    pub height: u32,
}

/// Captures a single frame from camera and converts it to RGBA format
/// This is a pure utility function that handles all format conversions
pub fn capture_frame(camera: &mut nokhwa::Camera) -> anyhow::Result<RgbaFrame> {
    let buffer = camera.frame().map_err(|e| anyhow!("Capturing frame: {}", e))?;

    let resolution = camera.resolution();
    let width = resolution.width();
    let height = resolution.height();
    let source_format = buffer.source_frame_format();

    // Decode buffer based on its format
    let data = match source_format {
        // MJPEG format - decode as RGBA
        FrameFormat::MJPEG => {
            let decoded = buffer.decode_image::<RgbAFormat>()
                .map_err(|e| anyhow!("Decoding MJPEG: {}", e))?;
            decoded.to_vec()
        }
        // YUYV422 format - decode then convert to RGBA
        FrameFormat::YUYV => {
            let decoded = buffer.decode_image::<YuyvFormat>()
                .map_err(|e| anyhow!("Decoding YUYV: {}", e))?;
            rgb_to_rgba(&decoded)
        }
        // NV12 format - decode as RGBA
        FrameFormat::NV12 => {
            let decoded = buffer.decode_image::<RgbAFormat>()
                .map_err(|e| anyhow!("Decoding NV12: {}", e))?;
            decoded.to_vec()
        }
        // For other formats, try RGB then RGBA decoder
        _ => {
            // Try RGB format decoder first
            if let Ok(decoded) = buffer.decode_image::<RgbFormat>() {
                rgb_to_rgba(&decoded)
            }
            // Fall back to RGBA decoder
            else if let Ok(decoded) = buffer.decode_image::<RgbAFormat>() {
                decoded.to_vec()
            }
            // If all else fails, return error
            else {
                return Err(anyhow!("Failed to decode frame with format {:?}", source_format));
            }
        }
    };

    Ok(RgbaFrame {
        data,
        width,
        height,
    })
}

/// Converts an RGBA frame to a N-API Frame object with Buffer
pub fn convert_to_napi_frame(rgba_frame: RgbaFrame) -> napi::Result<Frame> {
    let buffer = Buffer::from(rgba_frame.data);

    Ok(Frame {
        data: buffer,
        width: rgba_frame.width,
        height: rgba_frame.height,
    })
}

/// Converts RGB buffer to RGBA by adding alpha channel (255)
/// This is a pure utility function for format conversion
pub fn rgb_to_rgba(rgb: &[u8]) -> Vec<u8> {
    let mut rgba = Vec::with_capacity(rgb.len() / 3 * 4);
    for chunk in rgb.chunks(3) {
        rgba.push(chunk[0]); // R
        rgba.push(chunk[1]); // G
        rgba.push(chunk[2]); // B
        rgba.push(255);       // A
    }
    rgba
}

/// Frame structure exported to JavaScript/TypeScript
#[napi(object)]
pub struct Frame {
    pub data: Buffer,
    pub width: u32,
    pub height: u32,
}

// ============================================================================
// Type Conversion Functions
// ============================================================================

/// Parse camera index string to nokhwa CameraIndex
pub fn parse_camera_index(index: String) -> napi::Result<nokhwa::utils::CameraIndex> {
    Ok(match index.parse::<u32>() {
        Ok(i) => nokhwa::utils::CameraIndex::Index(i),
        Err(_) => nokhwa::utils::CameraIndex::String(index),
    })
}

/// Convert N-API backend to nokhwa backend
pub fn convert_backend(backend: ApiBackend) -> nokhwa::utils::ApiBackend {
    match backend {
        ApiBackend::Auto => nokhwa::utils::ApiBackend::Auto,
        ApiBackend::MediaFoundation => nokhwa::utils::ApiBackend::MediaFoundation,
        ApiBackend::AVFoundation => nokhwa::utils::ApiBackend::AVFoundation,
        ApiBackend::OpenCv => nokhwa::utils::ApiBackend::OpenCv,
        ApiBackend::Browser => nokhwa::utils::ApiBackend::Browser,
    }
}

/// Convert nokhwa backend to N-API backend
pub fn convert_backend_to_napi(backend: nokhwa::utils::ApiBackend) -> ApiBackend {
    match backend {
        nokhwa::utils::ApiBackend::Auto => ApiBackend::Auto,
        nokhwa::utils::ApiBackend::MediaFoundation => ApiBackend::MediaFoundation,
        nokhwa::utils::ApiBackend::AVFoundation => ApiBackend::AVFoundation,
        nokhwa::utils::ApiBackend::OpenCv => ApiBackend::OpenCv,
        nokhwa::utils::ApiBackend::Browser => ApiBackend::Browser,
        nokhwa::utils::ApiBackend::Video4Linux => ApiBackend::Auto, // Fallback
        nokhwa::utils::ApiBackend::UniversalVideoClass => ApiBackend::Auto, // Fallback
        nokhwa::utils::ApiBackend::GStreamer => ApiBackend::Auto, // Fallback
        nokhwa::utils::ApiBackend::Network => ApiBackend::Auto, // Fallback
    }
}

/// Convert nokhwa frame format to N-API frame format
pub fn convert_frame_format(format: nokhwa::utils::FrameFormat) -> crate::types::FrameFormat {
    use crate::types::FrameFormat;
    use nokhwa::utils::FrameFormat as NokhwaFormat;
    
    match format {
        NokhwaFormat::MJPEG => FrameFormat::MJPEG,
        NokhwaFormat::YUYV => FrameFormat::YUYV,
        NokhwaFormat::NV12 => FrameFormat::NV12,
        NokhwaFormat::RAWRGB => FrameFormat::RGB,
        NokhwaFormat::GRAY => FrameFormat::GRAY,
        _ => FrameFormat::RGB,
    }
}

/// Convert N-API requested format to nokhwa requested format
pub fn convert_requested_format(config: RequestedFormatConfig) -> napi::Result<nokhwa::utils::RequestedFormat<'static>> {
    use nokhwa::pixel_format::RgbAFormat;

    let request_type = match config.request_type {
        RequestedFormatType::AbsoluteHighestResolution => {
            nokhwa::utils::RequestedFormatType::AbsoluteHighestResolution
        }
        RequestedFormatType::AbsoluteHighestFrameRate => {
            nokhwa::utils::RequestedFormatType::AbsoluteHighestFrameRate
        }
    };

    Ok(nokhwa::utils::RequestedFormat::new::<RgbAFormat>(request_type))
}

/// Convert nokhwa camera control to N-API camera control
pub fn convert_camera_control(control: nokhwa::utils::CameraControl) -> CameraControl {
    CameraControl {
        name: control.name().to_string(),
        control_type: format!("{:?}", control.control()),
    }
}

/// Convert nokhwa known control to N-API known control
pub fn convert_known_control(control: nokhwa::utils::KnownCameraControl) -> KnownCameraControl {
    match control {
        nokhwa::utils::KnownCameraControl::Brightness => KnownCameraControl::Brightness,
        nokhwa::utils::KnownCameraControl::Contrast => KnownCameraControl::Contrast,
        nokhwa::utils::KnownCameraControl::Saturation => KnownCameraControl::Saturation,
        nokhwa::utils::KnownCameraControl::Hue => KnownCameraControl::Hue,
        nokhwa::utils::KnownCameraControl::WhiteBalance => KnownCameraControl::WhiteBalance,
        nokhwa::utils::KnownCameraControl::Gamma => KnownCameraControl::Gamma,
        nokhwa::utils::KnownCameraControl::Sharpness => KnownCameraControl::Sharpness,
        nokhwa::utils::KnownCameraControl::BacklightComp => KnownCameraControl::BacklightComp,
        nokhwa::utils::KnownCameraControl::Gain => KnownCameraControl::Gain,
        nokhwa::utils::KnownCameraControl::Pan => KnownCameraControl::Pan,
        nokhwa::utils::KnownCameraControl::Tilt => KnownCameraControl::Tilt,
        nokhwa::utils::KnownCameraControl::Zoom => KnownCameraControl::Zoom,
        nokhwa::utils::KnownCameraControl::Exposure => KnownCameraControl::Exposure,
        nokhwa::utils::KnownCameraControl::Iris => KnownCameraControl::Iris,
        nokhwa::utils::KnownCameraControl::Focus => KnownCameraControl::Focus,
        nokhwa::utils::KnownCameraControl::Other(_) => KnownCameraControl::Brightness, // Default fallback
    }
}

/// Convert N-API known control to nokhwa known control
pub fn convert_known_control_to_nokhwa(control: KnownCameraControl) -> nokhwa::utils::KnownCameraControl {
    match control {
        KnownCameraControl::Brightness => nokhwa::utils::KnownCameraControl::Brightness,
        KnownCameraControl::Contrast => nokhwa::utils::KnownCameraControl::Contrast,
        KnownCameraControl::Saturation => nokhwa::utils::KnownCameraControl::Saturation,
        KnownCameraControl::Hue => nokhwa::utils::KnownCameraControl::Hue,
        KnownCameraControl::WhiteBalance => nokhwa::utils::KnownCameraControl::WhiteBalance,
        KnownCameraControl::Gamma => nokhwa::utils::KnownCameraControl::Gamma,
        KnownCameraControl::Sharpness => nokhwa::utils::KnownCameraControl::Sharpness,
        KnownCameraControl::BacklightComp => nokhwa::utils::KnownCameraControl::BacklightComp,
        KnownCameraControl::Gain => nokhwa::utils::KnownCameraControl::Gain,
        KnownCameraControl::Pan => nokhwa::utils::KnownCameraControl::Pan,
        KnownCameraControl::Tilt => nokhwa::utils::KnownCameraControl::Tilt,
        KnownCameraControl::Zoom => nokhwa::utils::KnownCameraControl::Zoom,
        KnownCameraControl::Exposure => nokhwa::utils::KnownCameraControl::Exposure,
        KnownCameraControl::Iris => nokhwa::utils::KnownCameraControl::Iris,
        KnownCameraControl::Focus => nokhwa::utils::KnownCameraControl::Focus,
    }
}

/// Convert N-API control value to nokhwa control value
pub fn convert_control_value(value: ControlValueSetter) -> nokhwa::utils::ControlValueSetter {
    match value {
        ControlValueSetter::Integer(i) => nokhwa::utils::ControlValueSetter::Integer(i),
        ControlValueSetter::Float(f) => nokhwa::utils::ControlValueSetter::Float(f),
        ControlValueSetter::Boolean(b) => nokhwa::utils::ControlValueSetter::Boolean(b),
        ControlValueSetter::String(s) => nokhwa::utils::ControlValueSetter::String(s),
    }
}

/// Create camera with format fallback
pub fn create_camera_with_fallback(
    index: nokhwa::utils::CameraIndex,
) -> napi::Result<nokhwa::Camera> {
    use nokhwa::pixel_format::{RgbAFormat, RgbFormat, YuyvFormat};
    use nokhwa::utils::RequestedFormatType;

    let formats = vec![
        nokhwa::utils::RequestedFormat::new::<RgbAFormat>(
            RequestedFormatType::AbsoluteHighestResolution,
        ),
        nokhwa::utils::RequestedFormat::new::<RgbFormat>(
            RequestedFormatType::AbsoluteHighestResolution,
        ),
        nokhwa::utils::RequestedFormat::new::<YuyvFormat>(
            RequestedFormatType::AbsoluteHighestResolution,
        ),
    ];
    
    let formats_len = formats.len();

    for (i, format) in formats.into_iter().enumerate() {
        match nokhwa::Camera::new(index.clone(), format) {
            Ok(cam) => return Ok(cam),
            Err(e) => {
                if i == formats_len - 1 {
                    return Err(Error::from_reason(format!(
                        "Failed to create camera with any format: {}",
                        e
                    )));
                }
            }
        }
    }

    Err(Error::from_reason("Failed to create camera".to_string()))
}
