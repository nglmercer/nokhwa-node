#![deny(clippy::all)]

mod camera;
mod stream;
mod types;

use napi::bindgen_prelude::*;
use napi_derive::napi;

use camera::list_cameras;
use stream::capture_frame;

#[napi(object)]
pub struct CameraDevice {
    pub index: String,
    pub name: String,
}

#[napi(object)]
pub struct Frame {
    pub data: Buffer,
    pub width: u32,
    pub height: u32,
    pub fps: f64,
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
#[napi]
pub struct Camera {
    camera: nokhwa::Camera,
}

impl Camera {
    /// Get a mutable reference to the underlying camera
    fn camera_mut(&mut self) -> &mut nokhwa::Camera {
        &mut self.camera
    }
}

#[napi]
impl Camera {
    /// Create a new camera instance
    #[napi(constructor)]
    pub fn new(camera_index: String) -> Result<Self> {
        let nokhwa_index = match camera_index.parse::<u32>() {
            Ok(i) => nokhwa::utils::CameraIndex::Index(i),
            Err(_) => nokhwa::utils::CameraIndex::String(camera_index.clone()),
        };

        let mut camera = nokhwa::Camera::new(
            nokhwa_index,
            nokhwa::utils::RequestedFormat::new::<nokhwa::pixel_format::RgbAFormat>(
                nokhwa::utils::RequestedFormatType::AbsoluteHighestResolution,
            ),
        )
        .map_err(|e| Error::from_reason(e.to_string()))?;

        // Open the camera stream
        camera.open_stream()
            .map_err(|e| Error::from_reason(format!("Failed to open camera stream: {}", e)))?;

        Ok(Self { camera })
    }

    /// Capture a single frame from camera
    #[napi]
    #[allow(non_snake_case)]
    pub fn captureFrame(&mut self, _env: Env) -> Result<Frame> {
        let camera = self.camera_mut();
        let rgba_frame = capture_frame(camera)
            .map_err(|e| Error::from_reason(e.to_string()))?;
        
        let buffer = Buffer::from(rgba_frame.data);

        Ok(Frame {
            data: buffer,
            width: rgba_frame.width,
            height: rgba_frame.height,
            fps: 0.0,
        })
    }
}
