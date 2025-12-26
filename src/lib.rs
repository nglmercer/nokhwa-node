#![deny(clippy::all)]

mod camera;
mod conversions;

use napi::bindgen_prelude::*;
use napi_derive::napi;

use camera::list_cameras;
use conversions::{capture_frame, convert_to_napi_frame, Frame};

#[napi(object)]
pub struct CameraDevice {
    pub index: String,
    pub name: String,
}

/// List all available cameras
#[napi]
#[allow(non_snake_case)]
pub fn listCameras() -> Result<Vec<CameraDevice>> {
    let cameras = list_cameras()
        .map_err(|e| Error::from_reason(e.to_string()))?;
    
    Ok(cameras
        .into_iter()
        .map(|cam| CameraDevice {
            index: cam.index,
            name: cam.name,
        })
        .collect())
}

/// Camera instance for capturing frames
/// The user is responsible for managing the lifecycle of this camera
#[napi]
pub struct Camera {
    camera: nokhwa::Camera,
}

#[napi]
impl Camera {
    /// Create a new camera instance with the given index
    /// The camera stream is opened immediately
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
    #[allow(non_snake_case)]
    pub fn captureFrame(&mut self, _env: Env) -> Result<Frame> {
        let rgba_frame = capture_frame(&mut self.camera)
            .map_err(|e| Error::from_reason(e.to_string()))?;
        
        convert_to_napi_frame(rgba_frame)
    }
}

// Internal utility functions

fn parse_camera_index(index: String) -> Result<nokhwa::utils::CameraIndex> {
    Ok(match index.parse::<u32>() {
        Ok(i) => nokhwa::utils::CameraIndex::Index(i),
        Err(_) => nokhwa::utils::CameraIndex::String(index),
    })
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
                // Try next format
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
