use anyhow::anyhow;
use napi::bindgen_prelude::*;
use napi_derive::napi;
use nokhwa::pixel_format::*;
use nokhwa::utils::FrameFormat;

/// RGBA frame data
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

#[napi(object)]
pub struct Frame {
    pub data: Buffer,
    pub width: u32,
    pub height: u32,
}
