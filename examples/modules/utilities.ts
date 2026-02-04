import {
  nokhwaCheck,
  nativeApiBackend,
  frameFormats,
  colorFrameFormats,
  allKnownCameraControls,
  yuyv422PredictedSize,
} from '../../index.js';

/**
 * Demonstrate utility functions - minimal output
 */
export function demonstrateUtilityFunctions(): void {
  console.log('[Utility] Init:', nokhwaCheck());
  console.log('[Utility] Backend:', nativeApiBackend() || 'N/A');
  console.log('[Utility] Formats:', frameFormats().length, 'total,', colorFrameFormats().length, 'color');
  console.log('[Utility] Controls:', allKnownCameraControls().length, 'known');
  console.log('[Utility] YUYV422 size for 640x480:', yuyv422PredictedSize(640, 480), 'bytes');
}

/**
 * Demonstrate all enum values - compact output
 */
import { ApiBackend, FrameFormat, KnownCameraControl, RequestedFormatType } from '../../index.js';

export function demonstrateEnums(): void {
  console.log('[Enums] ApiBackend: Auto, MediaFoundation, AVFoundation, OpenCv, Browser');
  console.log('[Enums] FrameFormat: MJPEG, YUYV, NV12, RGB, RGBA, GRAY');
  console.log('[Enums] KnownCameraControl: Brightness, Contrast, Saturation, Hue, WhiteBalance, Gamma, Sharpness, BacklightComp, Gain, Pan, Tilt, Zoom, Exposure, Iris, Focus, Other');
  console.log('[Enums] RequestedFormatType: AbsoluteHighestResolution, AbsoluteHighestFrameRate');
}
