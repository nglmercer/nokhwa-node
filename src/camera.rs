use anyhow::{anyhow, Result};
use std::panic;

use nokhwa::{
    pixel_format::{RgbAFormat, RgbFormat, YuyvFormat},
    utils::{RequestedFormat, RequestedFormatType, CameraIndex as NokhwaIndex, ApiBackend},
};

/// Creates a new camera instance with the given index
#[allow(dead_code)]
pub fn create_camera(camera_index: String) -> Result<nokhwa::Camera> {
    println!("🎥 Creating VideoStream for camera {}...", camera_index);

    let nokhwa_index = match camera_index.parse::<u32>() {
        Ok(i) => NokhwaIndex::Index(i),
        Err(_) => NokhwaIndex::String(camera_index.clone()),
    };

    // Priority: RGBA first (only reorders channels), then RGB (expands), finally YUYV
    let requested_formats = vec![
        RequestedFormat::new::<RgbAFormat>(RequestedFormatType::AbsoluteHighestResolution),
        RequestedFormat::new::<RgbFormat>(RequestedFormatType::AbsoluteHighestResolution),
        RequestedFormat::new::<YuyvFormat>(RequestedFormatType::AbsoluteHighestResolution),
    ];

    for (i, format) in requested_formats.into_iter().enumerate() {
        match panic::catch_unwind(|| nokhwa::Camera::new(nokhwa_index.clone(), format)) {
            Ok(Ok(mut cam)) => {
                println!("✅ Camera created with format {}", i);
                
                // Try to open the stream immediately
                match cam.open_stream() {
                    Ok(()) => return Ok(cam),
                    Err(e) => {
                        println!("⚠️  Format {}: Error opening stream: {}", i, e);
                        continue;
                    }
                }
            }
            Ok(Err(e)) => {
                println!("⚠️  Format {} failed: {}", i, e);
                continue;
            }
            Err(_) => {
                eprintln!("❌ Panic during format {} initialization", i);
                continue;
            }
        }
    }
    
    Err(anyhow!("Could not create camera with any supported format"))
}

/// Gets information about available cameras
pub fn list_cameras() -> Result<Vec<CameraInfo>> {
    let cameras = nokhwa::query(ApiBackend::Auto)?;
    
    let camera_info: Result<Vec<CameraInfo>> = cameras
        .into_iter()
        .map(|cam| {
            Ok(CameraInfo {
                index: cam.index().as_string(),
                name: cam.human_name(),
            })
        })
        .collect();
    
    camera_info
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct CameraInfo {
    pub index: String,
    pub name: String,
}
