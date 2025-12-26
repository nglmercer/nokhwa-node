#![deny(clippy::all)]

mod camera;
mod conversions;

use napi::bindgen_prelude::*;
use napi_derive::napi;

use camera::list_cameras as list_cameras_internal;
use conversions::{capture_frame, convert_to_napi_frame, Frame};

// ============================================================================
// Enums
// ============================================================================

#[napi]
pub enum ApiBackend {
    Auto,
    MediaFoundation,
    AVFoundation,
    OpenCv,
    Browser,
}

#[napi]
#[derive(Clone, Copy)]
pub enum FrameFormat {
    MJPEG,
    YUYV,
    NV12,
    RGB,
    RGBA,
    GRAY,
}

#[napi]
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

#[napi]
pub enum ControlValueSetter {
    Integer(i64),
    Float(f64),
    Boolean(bool),
    String(String),
}

#[napi]
pub enum RequestedFormatType {
    AbsoluteHighestResolution,
    AbsoluteHighestFrameRate,
}

// ============================================================================
// Structs
// ============================================================================

#[napi(object)]
#[derive(Clone)]
pub struct Resolution {
    pub width: u32,
    pub height: u32,
}

#[napi(object)]
pub struct CameraFormat {
    pub resolution: Resolution,
    pub frame_rate: u32,
    pub format: FrameFormat,
}

#[napi(object)]
pub struct CameraControl {
    pub name: String,
    pub control_type: String,
}

#[napi(object)]
pub struct CameraDevice {
    pub index: String,
    pub name: String,
}

#[napi(object)]
pub struct RequestedFormatConfig {
    pub request_type: RequestedFormatType,
}

// ============================================================================
// Buffer
// ============================================================================

/// Buffer struct representing raw camera frame data
#[napi]
pub struct CameraBuffer {
    resolution: Resolution,
    data: Vec<u8>,
    source_frame_format: FrameFormat,
}

#[napi]
impl CameraBuffer {
    /// Create a new buffer with resolution, data, and format
    #[napi(constructor)]
    pub fn new(resolution: Resolution, data: Buffer, source_frame_format: FrameFormat) -> Self {
        CameraBuffer {
            resolution,
            data: data.to_vec(),
            source_frame_format,
        }
    }

    /// Get the resolution of the buffer
    #[napi]
    pub fn resolution(&self) -> Resolution {
        self.resolution.clone()
    }

    /// Get the raw buffer data
    #[napi]
    pub fn data(&self) -> Buffer {
        Buffer::from(self.data.clone())
    }

    /// Get the source frame format
    #[napi]
    pub fn source_frame_format(&self) -> FrameFormat {
        self.source_frame_format
    }

    /// Get the width of the buffer
    #[napi]
    pub fn width(&self) -> u32 {
        self.resolution.width
    }

    /// Get the height of the buffer
    #[napi]
    pub fn height(&self) -> u32 {
        self.resolution.height
    }
}

// ============================================================================
// Camera
// ============================================================================

/// Camera instance for capturing frames with full nokhwa functionality
#[napi]
pub struct Camera {
    camera: nokhwa::Camera,
}

#[napi]
impl Camera {
    /// Create a new camera instance with the given index
    /// The camera stream is opened immediately with automatic format detection
    #[napi(constructor)]
    pub fn new(camera_index: String) -> Result<Self> {
        let nokhwa_index = parse_camera_index(camera_index)?;

        let mut camera = create_camera_with_fallback(nokhwa_index)?;

        camera.open_stream()
            .map_err(|e| Error::from_reason(format!("Failed to open camera stream: {}", e)))?;

        Ok(Self { camera })
    }

    /// Capture a single frame from the camera
    /// Returns the frame as RGBA buffer with width and height
    #[napi]
    pub fn capture_frame(&mut self, _env: Env) -> Result<Frame> {
        let rgba_frame = capture_frame(&mut self.camera)
            .map_err(|e| Error::from_reason(e.to_string()))?;
        
        convert_to_napi_frame(rgba_frame)
    }

    /// Get the camera index
    #[napi]
    pub fn index(&self) -> String {
        self.camera.index().as_string()
    }

    /// Get the backend being used
    #[napi]
    pub fn backend(&self) -> ApiBackend {
        convert_backend_to_napi(self.camera.backend())
    }

    /// Get camera information
    #[napi]
    pub fn info(&self) -> CameraDevice {
        let info = self.camera.info();
        CameraDevice {
            index: info.index().as_string(),
            name: info.human_name(),
        }
    }

    /// Get the current camera format
    #[napi]
    pub fn camera_format(&self) -> CameraFormat {
        let fmt = self.camera.camera_format();
        CameraFormat {
            resolution: Resolution {
                width: fmt.width(),
                height: fmt.height(),
            },
            frame_rate: fmt.frame_rate(),
            format: convert_frame_format(fmt.format()),
        }
    }

    /// Refresh and get the camera format
    #[napi]
    pub fn refresh_camera_format(&mut self) -> Result<CameraFormat> {
        let fmt = self.camera.refresh_camera_format()
            .map_err(|e| Error::from_reason(format!("Failed to refresh camera format: {}", e)))?;
        
        Ok(CameraFormat {
            resolution: Resolution {
                width: fmt.width(),
                height: fmt.height(),
            },
            frame_rate: fmt.frame_rate(),
            format: convert_frame_format(fmt.format()),
        })
    }

    /// Set camera format with requested configuration
    #[napi]
    pub fn set_camera_request(&mut self, request: RequestedFormatConfig) -> Result<CameraFormat> {
        let nokhwa_format = convert_requested_format(request)?;
        let fmt = self.camera.set_camera_requset(nokhwa_format)
            .map_err(|e| Error::from_reason(format!("Failed to set camera format: {}", e)))?;
        
        Ok(CameraFormat {
            resolution: Resolution {
                width: fmt.width(),
                height: fmt.height(),
            },
            frame_rate: fmt.frame_rate(),
            format: convert_frame_format(fmt.format()),
        })
    }

    /// Get compatible camera formats
    #[napi]
    pub fn compatible_camera_formats(&mut self) -> Result<Vec<CameraFormat>> {
        let formats = self.camera.compatible_camera_formats()
            .map_err(|e| Error::from_reason(format!("Failed to get compatible formats: {}", e)))?;
        
        Ok(formats.into_iter().map(|fmt| CameraFormat {
            resolution: Resolution {
                width: fmt.width(),
                height: fmt.height(),
            },
            frame_rate: fmt.frame_rate(),
            format: convert_frame_format(fmt.format()),
        }).collect())
    }

    /// Get supported camera controls
    #[napi]
    pub fn supported_camera_controls(&self) -> Result<Vec<KnownCameraControl>> {
        let controls = self.camera.supported_camera_controls()
            .map_err(|e| Error::from_reason(format!("Failed to get supported controls: {}", e)))?;
        
        Ok(controls.into_iter().map(convert_known_control).collect())
    }

    /// Get all camera controls
    #[napi]
    pub fn camera_controls(&self) -> Result<Vec<CameraControl>> {
        let controls = self.camera.camera_controls()
            .map_err(|e| Error::from_reason(format!("Failed to get camera controls: {}", e)))?;
        
        Ok(controls.into_iter().map(convert_camera_control).collect())
    }

    /// Set a camera control value
    #[napi]
    pub fn set_camera_control(
        &mut self,
        control: KnownCameraControl,
        value: ControlValueSetter,
    ) -> Result<()> {
        let nokhwa_control = convert_known_control_to_nokhwa(control);
        let nokhwa_value = convert_control_value(value);
        
        self.camera.set_camera_control(nokhwa_control, nokhwa_value)
            .map_err(|e| Error::from_reason(format!("Failed to set camera control: {}", e)))?;
        
        Ok(())
    }

    /// Check if stream is open
    #[napi]
    pub fn is_stream_open(&self) -> bool {
        self.camera.is_stream_open()
    }

    /// Open the camera stream
    #[napi]
    pub fn open_stream(&mut self) -> Result<()> {
        self.camera.open_stream()
            .map_err(|e| Error::from_reason(format!("Failed to open stream: {}", e)))?;
        Ok(())
    }

    /// Stop the camera stream
    #[napi]
    pub fn stop_stream(&mut self) -> Result<()> {
        self.camera.stop_stream()
            .map_err(|e| Error::from_reason(format!("Failed to stop stream: {}", e)))?;
        Ok(())
    }

    /// Get raw frame data
    #[napi]
    pub fn frame_raw(&mut self) -> Result<CameraBuffer> {
        let resolution = self.camera.resolution();
        let frame_format = self.camera.frame_format();
        let raw = self.camera.frame_raw()
            .map_err(|e| Error::from_reason(format!("Failed to get raw frame: {}", e)))?;
        
        Ok(CameraBuffer {
            resolution: Resolution {
                width: resolution.width(),
                height: resolution.height(),
            },
            data: raw.to_vec(),
            source_frame_format: convert_frame_format(frame_format),
        })
    }
}

// ============================================================================
// Utility Functions
// ============================================================================

/// List all available cameras
#[napi]
pub fn list_cameras() -> Result<Vec<CameraDevice>> {
    let cameras = list_cameras_internal()
        .map_err(|e| Error::from_reason(e.to_string()))?;
    
    Ok(cameras
        .into_iter()
        .map(|cam| CameraDevice {
            index: cam.index,
            name: cam.name,
        })
        .collect())
}

/// Query available cameras with specific backend
#[napi]
pub fn query(backend: ApiBackend) -> Result<Vec<CameraDevice>> {
    let nokhwa_backend = convert_backend(backend);
    let cameras = nokhwa::query(nokhwa_backend)
        .map_err(|e| Error::from_reason(format!("Failed to query cameras: {}", e)))?;
    
    Ok(cameras
        .into_iter()
        .map(|cam| CameraDevice {
            index: cam.index().as_string(),
            name: cam.human_name(),
        })
        .collect())
}

/// Check if nokhwa is initialized
#[napi]
pub fn nokhwa_check() -> bool {
    nokhwa::nokhwa_check()
}

/// Get native API backend
#[napi]
pub fn native_api_backend() -> Option<ApiBackend> {
    nokhwa::native_api_backend().map(convert_backend_to_napi)
}

/// Get all known camera controls
#[napi]
pub fn all_known_camera_controls() -> Vec<KnownCameraControl> {
    nokhwa::utils::all_known_camera_controls()
        .into_iter()
        .map(convert_known_control)
        .collect()
}

/// Get all available frame formats
#[napi]
pub fn frame_formats() -> Vec<FrameFormat> {
    nokhwa::utils::frame_formats()
        .iter()
        .map(|fmt| convert_frame_format(*fmt))
        .collect()
}

/// Get all color frame formats
#[napi]
pub fn color_frame_formats() -> Vec<FrameFormat> {
    nokhwa::utils::color_frame_formats()
        .iter()
        .map(|fmt| convert_frame_format(*fmt))
        .collect()
}

/// Convert BGR buffer to RGB
#[napi]
pub fn buf_bgr_to_rgb(width: u32, height: u32, bgr: Buffer) -> Result<Buffer> {
    let resolution = nokhwa::utils::Resolution::new(width, height);
    let mut dest = vec![0u8; width as usize * height as usize * 3];
    let _ = nokhwa::utils::buf_bgr_to_rgb(resolution, &bgr, &mut dest);
    Ok(Buffer::from(dest))
}

/// Convert MJPEG buffer to RGB
#[napi]
pub fn buf_mjpeg_to_rgb(width: u32, height: u32, mjpeg: Buffer) -> Result<Buffer> {
    let mut dest = vec
![0u8; width as usize * height as usize * 3];
    nokhwa::utils::buf_mjpeg_to_rgb(&mjpeg, &mut dest, false)
        .map_err(|e| Error::from_reason(format!("Failed to convert MJPEG: {}", e)))?;
    Ok(Buffer::from(dest))
}

/// Convert NV12 buffer to RGB
#[napi]
pub fn buf_nv12_to_rgb(width: u32, height: u32, nv12: Buffer) -> Result<Buffer> {
    let resolution = nokhwa::utils::Resolution::new(width, height);
    let mut dest = vec![0u8; width as usize * height as usize * 3];
    nokhwa::utils::buf_nv12_to_rgb(resolution, &nv12, &mut dest, false)
        .map_err(|e| Error::from_reason(format!("Failed to convert NV12: {}", e)))?;
    Ok(Buffer::from(dest))
}

/// Convert YUYV422 buffer to RGB
#[napi]
pub fn buf_yuyv422_to_rgb(width: u32, height: u32, yuyv: Buffer) -> Result<Buffer> {
    let mut dest = vec
![0u8; width as usize * height as usize * 3];
    nokhwa::utils::buf_yuyv422_to_rgb(&yuyv, &mut dest, false)
        .map_err(|e| Error::from_reason(format!("Failed to convert YUYV: {}", e)))?;
    Ok(Buffer::from(dest))
}

/// Convert MJPEG to RGB (convenience function)
#[napi]
pub fn mjpeg_to_rgb(mjpeg: Buffer, _width: u32, _height: u32) -> Result<Buffer> {
    let rgb = nokhwa::utils::mjpeg_to_rgb(&mjpeg, false)
        .map_err(|e| Error::from_reason(format!("Failed to convert MJPEG: {}", e)))?;
    Ok(Buffer::from(rgb))
}

/// Convert NV12 to RGB (convenience function)
#[napi]
pub fn nv12_to_rgb(nv12: Buffer, width: u32, height: u32) -> Result<Buffer> {
    let resolution = nokhwa::utils::Resolution::new(width, height);
    let rgb = nokhwa::utils::nv12_to_rgb(resolution, &nv12, false)
        .map_err(|e| Error::from_reason(format!("Failed to convert NV12: {}", e)))?;
    Ok(Buffer::from(rgb))
}

/// Get predicted size for YUYV422 format
#[napi]
pub fn yuyv422_predicted_size(width: u32, height: u32) -> u32 {
    nokhwa::utils::yuyv422_predicted_size(width as usize * height as usize * 2, false) as u32
}

/// Convert YUYV422 to RGB (convenience function)
#[napi]
pub fn yuyv422_to_rgb(yuyv: Buffer, _width: u32, _height: u32) -> Result<Buffer> {
    let rgb = nokhwa::utils::yuyv422_to_rgb(&yuyv, false)
        .map_err(|e| Error::from_reason(format!("Failed to convert YUYV: {}", e)))?;
    Ok(Buffer::from(rgb))
}

// ============================================================================
// Internal Conversion Functions
// ============================================================================

fn parse_camera_index(index: String) -> Result<nokhwa::utils::CameraIndex> {
    Ok(match index.parse::<u32>() {
        Ok(i) => nokhwa::utils::CameraIndex::Index(i),
        Err(_) => nokhwa::utils::CameraIndex::String(index),
    })
}

fn convert_backend(backend: ApiBackend) -> nokhwa::utils::ApiBackend {
    match backend {
        ApiBackend::Auto => nokhwa::utils::ApiBackend::Auto,
        ApiBackend::MediaFoundation => nokhwa::utils::ApiBackend::MediaFoundation,
        ApiBackend::AVFoundation => nokhwa::utils::ApiBackend::AVFoundation,
        ApiBackend::OpenCv => nokhwa::utils::ApiBackend::OpenCv,
        ApiBackend::Browser => nokhwa::utils::ApiBackend::Browser,
    }
}

fn convert_backend_to_napi(backend: nokhwa::utils::ApiBackend) -> ApiBackend {
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

fn convert_frame_format(format: nokhwa::utils::FrameFormat) -> FrameFormat {
    match format {
        nokhwa::utils::FrameFormat::MJPEG => FrameFormat::MJPEG,
        nokhwa::utils::FrameFormat::YUYV => FrameFormat::YUYV,
        nokhwa::utils::FrameFormat::NV12 => FrameFormat::NV12,
        nokhwa::utils::FrameFormat::RAWRGB => FrameFormat::RGB,
        nokhwa::utils::FrameFormat::GRAY => FrameFormat::GRAY,
        _ => FrameFormat::RGB,
    }
}

fn convert_requested_format(config: RequestedFormatConfig) -> Result<nokhwa::utils::RequestedFormat<'static>> {
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

fn convert_known_control(control: nokhwa::utils::KnownCameraControl) -> KnownCameraControl {
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

fn convert_known_control_to_nokhwa(control: KnownCameraControl) -> nokhwa::utils::KnownCameraControl {
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

fn convert_camera_control(control: nokhwa::utils::CameraControl) -> CameraControl {
    CameraControl {
        name: control.name().to_string(),
        control_type: format!("{:?}", control.control()),
    }
}

fn convert_control_value(value: ControlValueSetter) -> nokhwa::utils::ControlValueSetter {
    match value {
        ControlValueSetter::Integer(i) => nokhwa::utils::ControlValueSetter::Integer(i),
        ControlValueSetter::Float(f) => nokhwa::utils::ControlValueSetter::Float(f),
        ControlValueSetter::Boolean(b) => nokhwa::utils::ControlValueSetter::Boolean(b),
        ControlValueSetter::String(s) => nokhwa::utils::ControlValueSetter::String(s),
    }
}

fn create_camera_with_fallback(
    index: nokhwa::utils::CameraIndex,
) -> Result<nokhwa::Camera> {
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
