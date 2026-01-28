import {
  nokhwaCheck,
  nativeApiBackend,
  frameFormats,
  colorFrameFormats,
  allKnownCameraControls,
  yuyv422PredictedSize,
} from '../../index.js';

/**
 * Demonstrate utility functions
 */
export function demonstrateUtilityFunctions(): void {
  console.log('\n=== UTILITY FUNCTIONS ===\n');

  // Check if nokhwa is initialized
  const isInitialized = nokhwaCheck();
  console.log('Nokhwa initialized:', isInitialized);

  // Get native API backend
  const backend = nativeApiBackend();
  console.log('Native API backend:', backend || 'Not available');

  // Get all frame formats
  const allFormats = frameFormats();
  console.log('All available frame formats:', allFormats);

  // Get color frame formats only
  const colorFormats = colorFrameFormats();
  console.log('Color frame formats:', colorFormats);

  // Get all known camera controls
  const knownControls = allKnownCameraControls();
  console.log('Known camera controls:', knownControls);

  // Calculate predicted size for YUYV422 format
  const width = 640;
  const height = 480;
  const predictedSize = yuyv422PredictedSize(width, height);
  console.log(`Predicted YUYV422 size for ${width}x${height}:`, predictedSize, 'bytes');
}

/**
 * Demonstrate all enum values
 */
import { ApiBackend, FrameFormat, KnownCameraControl, RequestedFormatType } from '../../index.js';

export function demonstrateEnums(): void {
  console.log('\n=== ENUM VALUES ===\n');

  // ApiBackend enum
  console.log('ApiBackend values:');
  console.log('  - Auto:', ApiBackend.Auto);
  console.log('  - MediaFoundation:', ApiBackend.MediaFoundation);
  console.log('  - AVFoundation:', ApiBackend.AVFoundation);
  console.log('  - OpenCv:', ApiBackend.OpenCv);
  console.log('  - Browser:', ApiBackend.Browser);

  // FrameFormat enum
  console.log('\nFrameFormat values:');
  console.log('  - MJPEG:', FrameFormat.MJPEG);
  console.log('  - YUYV:', FrameFormat.YUYV);
  console.log('  - NV12:', FrameFormat.NV12);
  console.log('  - RGB:', FrameFormat.RGB);
  console.log('  - RGBA:', FrameFormat.RGBA);
  console.log('  - GRAY:', FrameFormat.GRAY);

  // KnownCameraControl enum
  console.log('\nKnownCameraControl values:');
  console.log('  - Brightness:', KnownCameraControl.Brightness);
  console.log('  - Contrast:', KnownCameraControl.Contrast);
  console.log('  - Saturation:', KnownCameraControl.Saturation);
  console.log('  - Hue:', KnownCameraControl.Hue);
  console.log('  - WhiteBalance:', KnownCameraControl.WhiteBalance);
  console.log('  - Gamma:', KnownCameraControl.Gamma);
  console.log('  - Sharpness:', KnownCameraControl.Sharpness);
  console.log('  - BacklightComp:', KnownCameraControl.BacklightComp);
  console.log('  - Gain:', KnownCameraControl.Gain);
  console.log('  - Pan:', KnownCameraControl.Pan);
  console.log('  - Tilt:', KnownCameraControl.Tilt);
  console.log('  - Zoom:', KnownCameraControl.Zoom);
  console.log('  - Exposure:', KnownCameraControl.Exposure);
  console.log('  - Iris:', KnownCameraControl.Iris);
  console.log('  - Focus:', KnownCameraControl.Focus);

  // RequestedFormatType enum
  console.log('\nRequestedFormatType values:');
  console.log('  - AbsoluteHighestResolution:', RequestedFormatType.AbsoluteHighestResolution);
  console.log('  - AbsoluteHighestFrameRate:', RequestedFormatType.AbsoluteHighestFrameRate);
}
