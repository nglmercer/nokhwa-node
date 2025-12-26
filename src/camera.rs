use anyhow::Result;
use nokhwa::utils::ApiBackend;

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
