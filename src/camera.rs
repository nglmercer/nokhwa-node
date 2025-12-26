//! Camera module for nokhwa-node
//! 
//! This module provides camera listing and discovery functionality.

use anyhow::Result;
use nokhwa::utils::ApiBackend;

use crate::types::CameraDevice;

/// Gets information about available cameras
pub fn list_cameras() -> Result<Vec<CameraDevice>> {
    let cameras = nokhwa::query(ApiBackend::Auto)?;
    
    let camera_info: Result<Vec<CameraDevice>> = cameras
        .into_iter()
        .map(|cam| {
            Ok(CameraDevice {
                index: cam.index().as_string(),
                name: cam.human_name(),
            })
        })
        .collect();
    
    camera_info
}
