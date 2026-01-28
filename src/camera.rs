//! Camera module for nokhwa-node
//!
//! This module provides camera listing and discovery functionality.

use anyhow::Result;
use nokhwa::utils::ApiBackend;

use crate::types::CameraDevice;

/// Gets information about available cameras
pub fn list_cameras() -> Result<Vec<CameraDevice>> {
  use nokhwa::pixel_format::RgbFormat;
  use nokhwa::utils::{RequestedFormat, RequestedFormatType};

  let cameras = nokhwa::query(ApiBackend::Auto)?;

  let mut camera_info = Vec::new();

  for cam in cameras {
    let index = cam.index();

    // Check if the camera can be opened with a basic format
    // This effectively filters out metadata-only devices on Linux
    let request = RequestedFormat::new::<RgbFormat>(RequestedFormatType::AbsoluteHighestResolution);
    if nokhwa::Camera::new(index.clone(), request).is_ok() {
      camera_info.push(CameraDevice {
        index: index.as_string(),
        name: cam.human_name(),
      });
    }
  }

  Ok(camera_info)
}
