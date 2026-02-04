#![deny(clippy::all)]

//! # nokhwa-node
//!
//! Node.js bindings for the nokhwa camera library using napi-rs.
//!
//! This library provides access to webcams and other video capture devices
//! with support for multiple backends and frame formats.

mod buffer;
mod camera;
mod conversions;
mod types;

use std::mem::ManuallyDrop;
use std::panic::{catch_unwind, AssertUnwindSafe};

use napi::bindgen_prelude::*;
use napi_derive::napi;

// Re-export public types from modules
pub use buffer::CameraBuffer;
pub use conversions::Frame;
pub use types::*;

use camera::list_cameras as list_cameras_internal;
use conversions::{
  capture_frame, convert_backend, convert_backend_to_napi, convert_camera_control,
  convert_control_value, convert_frame_format, convert_known_control,
  convert_known_control_to_nokhwa, convert_requested_format, convert_to_napi_frame,
  create_camera_with_fallback, parse_camera_index,
};

// ============================================================================
// Camera Class
// ============================================================================

/// Camera instance for capturing frames with full nokhwa functionality
#[napi]
pub struct Camera {
  // Use ManuallyDrop to control when the camera is actually dropped
  // This prevents double-free and ensures proper cleanup during GC
  camera: Option<ManuallyDrop<nokhwa::Camera>>,
}

impl Drop for Camera {
  fn drop(&mut self) {
    // First try to stop the stream if it exists
    // This is critical on Windows with MediaFoundation backend
    if let Some(cam) = self.camera.as_mut() {
      let _ = catch_unwind(AssertUnwindSafe(|| cam.stop_stream()));
    }
    // Then drop the camera
    let _ = self.camera.take();
  }
}

#[napi]
impl Camera {
  /// Create a new camera instance with the given index
  /// The camera stream is opened immediately with automatic format detection
  #[napi(constructor)]
  pub fn new(camera_index: String) -> Result<Self> {
    let nokhwa_index = parse_camera_index(camera_index)?;
    let camera = create_camera_with_fallback(nokhwa_index)?;
    Ok(Self {
      camera: Some(ManuallyDrop::new(camera)),
    })
  }

  /// Capture a single frame from the camera
  /// Returns the frame as RGBA buffer with width and height
  #[napi]
  pub fn capture_frame(&mut self) -> Result<Frame> {
    let cam = self
      .camera
      .as_mut()
      .ok_or_else(|| Error::from_reason("Camera is closed or has been stopped"))?;
    let rgba_frame = capture_frame(cam).map_err(|e| Error::from_reason(e.to_string()))?;
    convert_to_napi_frame(rgba_frame)
  }

  /// Get the camera index
  #[napi]
  pub fn index(&self) -> String {
    self
      .camera
      .as_ref()
      .expect("Camera is closed or has been stopped")
      .index()
      .as_string()
  }

  /// Get the backend being used
  #[napi]
  pub fn backend(&self) -> ApiBackend {
    convert_backend_to_napi(
      self
        .camera
        .as_ref()
        .expect("Camera is closed or has been stopped")
        .backend(),
    )
  }

  /// Get camera information
  #[napi]
  pub fn info(&self) -> CameraDevice {
    let cam = self
      .camera
      .as_ref()
      .expect("Camera is closed or has been stopped");
    let info = cam.info();
    CameraDevice {
      index: info.index().as_string(),
      name: info.human_name(),
    }
  }

  /// Get the current camera format
  /// Note: This returns the requested frame rate. Use refresh_camera_format()
  /// to get the actual active frame rate from the camera.
  #[napi]
  pub fn camera_format(&self) -> CameraFormat {
    let cam = self
      .camera
      .as_ref()
      .expect("Camera is closed or has been stopped");
    let fmt = cam.camera_format();
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
    let cam = self
      .camera
      .as_mut()
      .ok_or_else(|| Error::from_reason("Camera is closed or has been stopped"))?;
    let fmt = cam
      .refresh_camera_format()
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
    let cam = self
      .camera
      .as_mut()
      .ok_or_else(|| Error::from_reason("Camera is closed or has been stopped"))?;
    let nokhwa_format = convert_requested_format(request)?;
    let fmt = cam
      .set_camera_requset(nokhwa_format)
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
    let cam = self
      .camera
      .as_mut()
      .ok_or_else(|| Error::from_reason("Camera is closed or has been stopped"))?;
    let formats = cam
      .compatible_camera_formats()
      .map_err(|e| Error::from_reason(format!("Failed to get compatible formats: {}", e)))?;
    Ok(
      formats
        .into_iter()
        .map(|fmt| CameraFormat {
          resolution: Resolution {
            width: fmt.width(),
            height: fmt.height(),
          },
          frame_rate: fmt.frame_rate(),
          format: convert_frame_format(fmt.format()),
        })
        .collect(),
    )
  }

  /// Get supported camera controls
  #[napi]
  pub fn supported_camera_controls(&self) -> Result<Vec<KnownCameraControl>> {
    let cam = self
      .camera
      .as_ref()
      .ok_or_else(|| Error::from_reason("Camera is closed or has been stopped"))?;
    let controls = cam
      .supported_camera_controls()
      .map_err(|e| Error::from_reason(format!("Failed to get supported controls: {}", e)))?;
    Ok(controls.into_iter().map(convert_known_control).collect())
  }

  /// Get all camera controls
  #[napi]
  pub fn camera_controls(&self) -> Result<Vec<CameraControl>> {
    let cam = self
      .camera
      .as_ref()
      .ok_or_else(|| Error::from_reason("Camera is closed or has been stopped"))?;
    let controls = cam
      .camera_controls()
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
    let cam = self
      .camera
      .as_mut()
      .ok_or_else(|| Error::from_reason("Camera is closed or has been stopped"))?;
    let nokhwa_control = convert_known_control_to_nokhwa(control);
    let nokhwa_value = convert_control_value(value);
    cam
      .set_camera_control(nokhwa_control, nokhwa_value)
      .map_err(|e| Error::from_reason(format!("Failed to set camera control: {}", e)))?;
    Ok(())
  }

  /// Check if stream is open
  #[napi]
  pub fn is_stream_open(&self) -> bool {
    self.camera.as_ref().is_some_and(|cam| cam.is_stream_open())
  }

  /// Open the camera stream
  #[napi]
  pub fn open_stream(&mut self) -> Result<()> {
    let cam = self
      .camera
      .as_mut()
      .ok_or_else(|| Error::from_reason("Camera is closed or has been stopped"))?;
    cam
      .open_stream()
      .map_err(|e| Error::from_reason(format!("Failed to open stream: {}", e)))?;
    Ok(())
  }

  /// Stop the camera stream
  #[napi]
  pub fn stop_stream(&mut self) -> Result<()> {
    // Get reference to camera without taking ownership
    let cam = self
      .camera
      .as_mut()
      .ok_or_else(|| Error::from_reason("Camera is already stopped or closed"))?;

    // Close the stream
    // This is critical on Windows with MediaFoundation backend
    // to avoid segmentation faults during cleanup
    let close_result = catch_unwind(AssertUnwindSafe(|| cam.stop_stream()));

    // Ignore errors from close - the camera will be dropped anyway
    let _ = close_result;

    // Note: We don't take ownership here - Drop will handle cleanup
    // This prevents double-close issues

    Ok(())
  }

  /// Get raw frame data
  #[napi]
  pub fn frame_raw(&mut self) -> Result<CameraBuffer> {
    let cam = self
      .camera
      .as_mut()
      .ok_or_else(|| Error::from_reason("Camera is closed or has been stopped"))?;
    let resolution = cam.resolution();
    let frame_format = cam.frame_format();
    let raw = cam
      .frame_raw()
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
// Utility Functions - Camera Discovery
// ============================================================================

/// List all available cameras
#[napi]
pub fn list_cameras() -> Result<Vec<CameraDevice>> {
  let cameras = list_cameras_internal().map_err(|e| Error::from_reason(e.to_string()))?;
  Ok(
    cameras
      .into_iter()
      .map(|cam| CameraDevice {
        index: cam.index,
        name: cam.name,
      })
      .collect(),
  )
}

/// Query available cameras with specific backend
#[napi]
pub fn query(backend: ApiBackend) -> Result<Vec<CameraDevice>> {
  let nokhwa_backend = convert_backend(backend);
  let cameras = nokhwa::query(nokhwa_backend)
    .map_err(|e| Error::from_reason(format!("Failed to query cameras: {}", e)))?;
  Ok(
    cameras
      .into_iter()
      .map(|cam| CameraDevice {
        index: cam.index().as_string(),
        name: cam.human_name(),
      })
      .collect(),
  )
}

// ============================================================================
// Utility Functions - System Information
// ============================================================================

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

// ============================================================================
// Utility Functions - Buffer Conversions
// ============================================================================

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
  if mjpeg.is_empty() {
    return Err(Error::from_reason("Empty MJPEG buffer".to_string()));
  }

  let mut dest = vec![0u8; width as usize * height as usize * 3];

  // Nokhwa's MJPEG conversion can panic on invalid data in some cases
  // We wrap it in catch_unwind to prevent process-wide abortion
  let mjpeg_ref = &mjpeg;
  let dest_ref = &mut dest;

  let result = catch_unwind(AssertUnwindSafe(move || {
    nokhwa::utils::buf_mjpeg_to_rgb(mjpeg_ref, dest_ref, false)
  }));

  match result {
    Ok(Ok(_)) => Ok(Buffer::from(dest)),
    Ok(Err(e)) => Err(Error::from_reason(format!(
      "Failed to convert MJPEG: {}",
      e
    ))),
    Err(_) => Err(Error::from_reason(
      "MJPEG conversion panicked internally (likely due to invalid JPEG data)".to_string(),
    )),
  }
}

/// Convert NV12 buffer to RGB
#[napi]
pub fn buf_nv12_to_rgb(width: u32, height: u32, nv12: Buffer) -> Result<Buffer> {
  let resolution = nokhwa::utils::Resolution::new(width, height);
  let mut dest = vec![0u8; width as usize * height as usize * 3];

  let nv12_ref = &nv12;
  let dest_ref = &mut dest;

  let result = catch_unwind(AssertUnwindSafe(move || {
    nokhwa::utils::buf_nv12_to_rgb(resolution, nv12_ref, dest_ref, false)
  }));

  match result {
    Ok(Ok(_)) => Ok(Buffer::from(dest)),
    Ok(Err(e)) => Err(Error::from_reason(format!("Failed to convert NV12: {}", e))),
    Err(_) => Err(Error::from_reason(
      "NV12 conversion panicked internally".to_string(),
    )),
  }
}

/// Convert YUYV422 buffer to RGB
#[napi]
pub fn buf_yuyv422_to_rgb(width: u32, height: u32, yuyv: Buffer) -> Result<Buffer> {
  let mut dest = vec![0u8; width as usize * height as usize * 3];

  let yuyv_ref = &yuyv;
  let dest_ref = &mut dest;

  let result = catch_unwind(AssertUnwindSafe(move || {
    nokhwa::utils::buf_yuyv422_to_rgb(yuyv_ref, dest_ref, false)
  }));

  match result {
    Ok(Ok(_)) => Ok(Buffer::from(dest)),
    Ok(Err(e)) => Err(Error::from_reason(format!("Failed to convert YUYV: {}", e))),
    Err(_) => Err(Error::from_reason(
      "YUYV conversion panicked internally".to_string(),
    )),
  }
}

/// Convert MJPEG to RGB (convenience function)
#[napi]
pub fn mjpeg_to_rgb(mjpeg: Buffer, _width: u32, _height: u32) -> Result<Buffer> {
  if mjpeg.is_empty() {
    return Err(Error::from_reason("Empty MJPEG buffer".to_string()));
  }

  let mjpeg_ref = &mjpeg;
  let result = catch_unwind(AssertUnwindSafe(move || {
    nokhwa::utils::mjpeg_to_rgb(mjpeg_ref, false)
  }));

  match result {
    Ok(Ok(rgb)) => Ok(Buffer::from(rgb)),
    Ok(Err(e)) => Err(Error::from_reason(format!(
      "Failed to convert MJPEG: {}",
      e
    ))),
    Err(_) => Err(Error::from_reason(
      "MJPEG conversion panicked internally (likely due to invalid JPEG data)".to_string(),
    )),
  }
}

/// Convert NV12 to RGB (convenience function)
#[napi]
pub fn nv12_to_rgb(nv12: Buffer, width: u32, height: u32) -> Result<Buffer> {
  let resolution = nokhwa::utils::Resolution::new(width, height);

  let nv12_ref = &nv12;
  let result = catch_unwind(AssertUnwindSafe(move || {
    nokhwa::utils::nv12_to_rgb(resolution, nv12_ref, false)
  }));

  match result {
    Ok(Ok(rgb)) => Ok(Buffer::from(rgb)),
    Ok(Err(e)) => Err(Error::from_reason(format!("Failed to convert NV12: {}", e))),
    Err(_) => Err(Error::from_reason(
      "NV12 conversion panicked internally".to_string(),
    )),
  }
}

/// Get predicted size for YUYV422 format
#[napi]
pub fn yuyv422_predicted_size(width: u32, height: u32) -> u32 {
  nokhwa::utils::yuyv422_predicted_size(width as usize * height as usize * 2, false) as u32
}

/// Convert YUYV422 to RGB (convenience function)
#[napi]
pub fn yuyv422_to_rgb(yuyv: Buffer, _width: u32, _height: u32) -> Result<Buffer> {
  let yuyv_ref = &yuyv;
  let result = catch_unwind(AssertUnwindSafe(move || {
    nokhwa::utils::yuyv422_to_rgb(yuyv_ref, false)
  }));

  match result {
    Ok(Ok(rgb)) => Ok(Buffer::from(rgb)),
    Ok(Err(e)) => Err(Error::from_reason(format!("Failed to convert YUYV: {}", e))),
    Err(_) => Err(Error::from_reason(
      "YUYV conversion panicked internally".to_string(),
    )),
  }
}
