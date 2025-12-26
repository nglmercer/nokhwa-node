use anyhow::{anyhow, Result};
use nokhwa::pixel_format::*;
use nokhwa::utils::FrameFormat;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};

/// Handle to abort a camera stream
#[derive(Clone)]
#[allow(dead_code)]
pub struct CameraAbort(Arc<AtomicBool>);

#[allow(dead_code)]
impl CameraAbort {
    pub fn new() -> Self {
        Self(Arc::new(AtomicBool::new(false)))
    }

    pub fn abort(&self) {
        self.0.store(true, Ordering::Release);
    }

    pub fn is_aborted(&self) -> bool {
        self.0.load(Ordering::Acquire)
    }
}

impl Drop for CameraAbort {
    fn drop(&mut self) {
        self.0.store(true, Ordering::Relaxed);
    }
}

/// Frame buffer containing RGBA pixel data
#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct FrameBuffer {
    pub data: Vec<u8>,
    pub width: u32,
    pub height: u32,
    pub fps: f64,
}

#[allow(dead_code)]
impl FrameBuffer {
    pub fn new(data: Vec<u8>, width: u32, height: u32, fps: f64) -> Self {
        Self {
            data,
            width,
            height,
            fps,
        }
    }
}

/// Creates a camera stream that captures frames continuously
#[allow(dead_code)]
pub fn create_camera_stream(
    mut camera: nokhwa::Camera,
    callback: impl Fn(Result<FrameBuffer>) + Send + 'static,
) -> CameraAbort {
    let abort = CameraAbort::new();
    let abort_clone = abort.clone();

    std::thread::spawn(move || {
        let mut frame_times = [0.0f64; 60];
        let mut frame_index = 0usize;
        let mut frame_count = 0usize;
        let mut last_fps_update = Instant::now();
        let mut cached_fps = 60.0;
        let target_frame_time = Duration::from_millis(16);

        loop {
            let frame_start = Instant::now();

            match capture_frame(&mut camera) {
                Ok(frame) => {
                    let processing_time = frame_start.elapsed();

                    // Update frame times
                    frame_times[frame_index] = processing_time.as_secs_f64();
                    frame_index = (frame_index + 1) % 60;
                    if frame_count < 60 {
                        frame_count += 1;
                    }

                    // Update FPS every 200ms
                    let now = Instant::now();
                    if now.duration_since(last_fps_update).as_millis() >= 200 {
                        let avg_time = frame_times.iter().take(frame_count).sum::<f64>() / frame_count as f64;
                        if avg_time > 0.0 {
                            cached_fps = 1.0 / avg_time;
                        }
                        last_fps_update = now;
                    }

                    let frame_buffer = FrameBuffer {
                        data: frame.data,
                        width: frame.width,
                        height: frame.height,
                        fps: cached_fps,
                    };

                    callback(Ok(frame_buffer));
                }
                Err(e) => {
                    callback(Err(e));
                }
            }

            if abort_clone.is_aborted() {
                break;
            }

            // Throttle to target frame rate
            let processing_time = frame_start.elapsed();
            if processing_time < target_frame_time {
                std::thread::sleep(target_frame_time - processing_time);
            }
        }
    });

    abort
}

/// Captures a single frame from camera and converts to RGBA
pub fn capture_frame(camera: &mut nokhwa::Camera) -> Result<RgbaFrame> {
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
            // YUYV returns RGB, convert to RGBA
            rgb_to_rgba(&decoded)
        }
        // NV12 format - decode as RGBA
        FrameFormat::NV12 => {
            let decoded = buffer.decode_image::<RgbAFormat>()
                .map_err(|e| anyhow!("Decoding NV12: {}", e))?;
            decoded.to_vec()
        }
        // For other formats, try RGBA decoder
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

/// Converts RGB buffer to RGBA by adding alpha channel (255)
fn rgb_to_rgba(rgb: &[u8]) -> Vec<u8> {
    let mut rgba = Vec::with_capacity(rgb.len() / 3 * 4);
    for chunk in rgb.chunks(3) {
        rgba.push(chunk[0]); // R
        rgba.push(chunk[1]); // G
        rgba.push(chunk[2]); // B
        rgba.push(255);       // A
    }
    rgba
}

pub struct RgbaFrame {
    pub data: Vec<u8>,
    pub width: u32,
    pub height: u32,
}
