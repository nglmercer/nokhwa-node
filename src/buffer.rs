//! Buffer module for handling camera frame data
//!
//! This module provides the CameraBuffer struct for managing raw camera frame data.

use crate::types::{FrameFormat, Resolution};
use napi::bindgen_prelude::*;
use napi_derive::napi;

/// Buffer struct representing raw camera frame data
#[napi]
pub struct CameraBuffer {
  pub(crate) resolution: Resolution,
  pub(crate) data: Vec<u8>,
  pub(crate) source_frame_format: FrameFormat,
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
    // IMPORTANT: Clone the data to ensure we return a独立-owned Buffer
    // This prevents dangling references when Bun accesses the buffer later
    let owned_data = self.data.clone();
    Buffer::from(owned_data)
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

  /// Get the size of the buffer in bytes
  #[napi]
  pub fn size(&self) -> u32 {
    self.data.len() as u32
  }

  /// Check if the buffer is empty
  #[napi]
  pub fn is_empty(&self) -> bool {
    self.data.is_empty()
  }
}
