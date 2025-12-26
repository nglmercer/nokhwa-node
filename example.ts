/**
 * Comprehensive example demonstrating all methods, functions, classes, types, and enums
 * available in nokhwa-node
 */

import {
  // Classes
  Camera,
  CameraBuffer,
  
  // Enums
  ApiBackend,
  FrameFormat,
  KnownCameraControl,
  RequestedFormatType,
  
  // Types (used in function signatures and interfaces)
  type CameraControl,
  type CameraDevice,
  type CameraFormat,
  type ControlValueSetter,
  type Frame,
  type RequestedFormatConfig,
  type Resolution,
  
  // Functions
  allKnownCameraControls,
  bufBgrToRgb,
  bufMjpegToRgb,
  bufNv12ToRgb,
  bufYuyv422ToRgb,
  colorFrameFormats,
  frameFormats,
  listCameras,
  mjpegToRgb,
  nativeApiBackend,
  nokhwaCheck,
  nv12ToRgb,
  query,
  yuyv422PredictedSize,
  yuyv422ToRgb,
} from './index.js';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Demonstrate utility functions
 */
function demonstrateUtilityFunctions(): void {
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

// ============================================================================
// ENUM DEMONSTRATION
// ============================================================================

/**
 * Demonstrate all enum values
 */
function demonstrateEnums(): void {
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

// ============================================================================
// CAMERA DISCOVERY
// ============================================================================

/**
 * Demonstrate camera discovery using different methods
 */
async function demonstrateCameraDiscovery(): Promise<void> {
  console.log('\n=== CAMERA DISCOVERY ===\n');

  // List all cameras (default backend)
  const cameras = listCameras();
  console.log('Available cameras:', cameras);
  cameras.forEach((camera: CameraDevice) => {
    console.log(`  Camera ${camera.index}: ${camera.name}`);
  });

  // Query cameras with specific backend
  console.log('\nQuerying cameras with Auto backend:');
  const autoCameras = query(ApiBackend.Auto);
  console.log('Auto backend cameras:', autoCameras);

  // Try other backends if available
  console.log('\nQuerying cameras with MediaFoundation backend:');
  try {
    const mfCameras = query(ApiBackend.MediaFoundation);
    console.log('MediaFoundation cameras:', mfCameras);
  } catch (error) {
    console.log('MediaFoundation backend not available:', error instanceof Error ? error.message : error);
  }

  console.log('\nQuerying cameras with AVFoundation backend:');
  try {
    const avCameras = query(ApiBackend.AVFoundation);
    console.log('AVFoundation cameras:', avCameras);
  } catch (error) {
    console.log('AVFoundation backend not available:', error instanceof Error ? error.message : error);
  }

  console.log('\nQuerying cameras with OpenCv backend:');
  try {
    const cvCameras = query(ApiBackend.OpenCv);
    console.log('OpenCv cameras:', cvCameras);
  } catch (error) {
    console.log('OpenCv backend not available:', error instanceof Error ? error.message : error);
  }
}

// ============================================================================
// CAMERA BUFFER CLASS
// ============================================================================

/**
 * Demonstrate CameraBuffer class usage
 */
function demonstrateCameraBuffer(): void {
  console.log('\n=== CAMERA BUFFER CLASS ===\n');

  // Create a sample resolution
  const resolution: Resolution = {
    width: 640,
    height: 480,
  };

  // Create sample buffer data (in real usage, this would come from camera)
  const sampleData = Buffer.alloc(resolution.width * resolution.height * 3);

  // Create CameraBuffer instance
  const cameraBuffer = new CameraBuffer(
    resolution,
    sampleData,
    FrameFormat.RGB
  );

  // Demonstrate all CameraBuffer methods
  console.log('Buffer resolution:', cameraBuffer.resolution());
  console.log('Buffer width:', cameraBuffer.width());
  console.log('Buffer height:', cameraBuffer.height());
  console.log('Buffer size:', cameraBuffer.size(), 'bytes');
  console.log('Buffer is empty:', cameraBuffer.isEmpty());
  console.log('Buffer format:', cameraBuffer.sourceFrameFormat());

  // Get raw buffer data
  const bufferData = cameraBuffer.data();
  console.log('Buffer data length:', bufferData.length);
}

// ============================================================================
// CAMERA CLASS - BASIC OPERATIONS
// ============================================================================

/**
 * Demonstrate basic Camera class operations
 */
async function demonstrateBasicCameraOperations(cameraIndex: string): Promise<void> {
  console.log('\n=== BASIC CAMERA OPERATIONS ===\n');

  // Create camera instance (stream is opened automatically)
  console.log('Creating camera instance...');
  const camera = new Camera(cameraIndex);

  // Get camera index
  console.log('Camera index:', camera.index());

  // Get backend being used
  const backend = camera.backend();
  console.log('Camera backend:', backend);

  // Get camera information
  const info = camera.info();
  console.log('Camera info:', info);

  // Get current camera format
  const format = camera.cameraFormat();
  console.log('Current camera format:', format);

  // Check if stream is open
  const isOpen = camera.isStreamOpen();
  console.log('Stream open:', isOpen);

  // Get compatible camera formats
  const compatibleFormats = camera.compatibleCameraFormats();
  console.log('Compatible formats:', compatibleFormats);

  // Stop the camera stream
  console.log('\nStopping camera stream...');
  camera.stopStream();
  console.log('Stream open after stop:', camera.isStreamOpen());
}

// ============================================================================
// CAMERA CLASS - ADVANCED OPERATIONS
// ============================================================================

/**
 * Demonstrate advanced Camera class operations
 */
async function demonstrateAdvancedCameraOperations(cameraIndex: string): Promise<void> {
  console.log('\n=== ADVANCED CAMERA OPERATIONS ===\n');

  const camera = new Camera(cameraIndex);

  // Refresh camera format
  console.log('Refreshing camera format...');
  const refreshedFormat = camera.refreshCameraFormat();
  console.log('Refreshed format:', refreshedFormat);

  // Request highest resolution format
  console.log('\nRequesting highest resolution...');
  const highResRequest: RequestedFormatConfig = {
    requestType: RequestedFormatType.AbsoluteHighestResolution,
  };
  const highResFormat = camera.setCameraRequest(highResRequest);
  console.log('High resolution format:', highResFormat);

  // Request highest frame rate format
  console.log('\nRequesting highest frame rate...');
  const highFpsRequest: RequestedFormatConfig = {
    requestType: RequestedFormatType.AbsoluteHighestFrameRate,
  };
  const highFpsFormat = camera.setCameraRequest(highFpsRequest);
  console.log('High frame rate format:', highFpsFormat);

  // Get supported camera controls
  console.log('\nSupported camera controls:');
  const supportedControls = camera.supportedCameraControls();
  console.log(supportedControls);

  // Get all camera controls with values
  console.log('\nAll camera controls with values:');
  const allControls = camera.cameraControls();
  allControls.forEach((control: CameraControl) => {
    console.log(`  ${control.name}: ${control.controlType}`);
  });

  // Set camera controls with different value types
  console.log('\nSetting camera controls...');

  // Integer value
  try {
    const intValue: ControlValueSetter = { type: 'Integer', field0: 50 };
    camera.setCameraControl(KnownCameraControl.Brightness, intValue);
    console.log('Set brightness to 50');
  } catch (error) {
    console.log('Could not set brightness:', error);
  }

  // Float value
  try {
    const floatValue: ControlValueSetter = { type: 'Float', field0: 1.5 };
    camera.setCameraControl(KnownCameraControl.Contrast, floatValue);
    console.log('Set contrast to 1.5');
  } catch (error) {
    console.log('Could not set contrast:', error);
  }

  // Boolean value
  try {
    const boolValue: ControlValueSetter = { type: 'Boolean', field0: true };
    camera.setCameraControl(KnownCameraControl.BacklightComp, boolValue);
    console.log('Set backlight compensation to true');
  } catch (error) {
    console.log('Could not set backlight compensation:', error);
  }

  // String value
  try {
    const stringValue: ControlValueSetter = { type: 'String', field0: 'auto' };
    camera.setCameraControl(KnownCameraControl.WhiteBalance, stringValue);
    console.log('Set white balance to auto');
  } catch (error) {
    console.log('Could not set white balance:', error);
  }

  // Set other controls
  const controlsToSet = [
    KnownCameraControl.Saturation,
    KnownCameraControl.Sharpness,
    KnownCameraControl.Gain,
    KnownCameraControl.Gamma,
  ];

  controlsToSet.forEach((control: KnownCameraControl) => {
    try {
      const value: ControlValueSetter = { type: 'Integer', field0: 128 };
      camera.setCameraControl(control, value);
      console.log(`Set ${control} to 128`);
    } catch (error) {
      console.log(`Could not set ${control}:`, error);
    }
  });
}

// ============================================================================
// CAMERA CLASS - CAPTURE OPERATIONS
// ============================================================================

/**
 * Demonstrate frame capture operations
 */
async function demonstrateCaptureOperations(cameraIndex: string): Promise<void> {
  console.log('\n=== CAPTURE OPERATIONS ===\n');

  const camera = new Camera(cameraIndex);

  // Ensure stream is open
  if (!camera.isStreamOpen()) {
    console.log('Opening camera stream...');
    camera.openStream();
    console.log('Stream open:', camera.isStreamOpen());
  }

  // Capture a frame (returns Frame interface with RGBA data)
  console.log('\nCapturing frame...');
  const frame: Frame = camera.captureFrame();
  console.log('Frame captured:');
  console.log('  Width:', frame.width);
  console.log('  Height:', frame.height);
  console.log('  Data size:', frame.data.length, 'bytes');

  // Get raw frame data as CameraBuffer
  console.log('\nGetting raw frame buffer...');
  const rawBuffer: CameraBuffer = camera.frameRaw();
  console.log('Raw buffer:');
  console.log('  Width:', rawBuffer.width());
  console.log('  Height:', rawBuffer.height());
  console.log('  Size:', rawBuffer.size(), 'bytes');
  console.log('  Format:', rawBuffer.sourceFrameFormat());

  // Stop the camera
  console.log('\nStopping camera...');
  camera.stopStream();
}

// ============================================================================
// BUFFER CONVERSION FUNCTIONS
// ============================================================================

/**
 * Demonstrate all buffer conversion functions
 */
function demonstrateBufferConversions(): void {
  console.log('\n=== BUFFER CONVERSION FUNCTIONS ===\n');

  const width = 640;
  const height = 480;

  // Create sample buffers for each format
  const mjpegBuffer = Buffer.alloc(width * height * 2);
  const nv12Buffer = Buffer.alloc(width * height * 3 / 2);
  const yuyvBuffer = Buffer.alloc(width * height * 2);
  const bgrBuffer = Buffer.alloc(width * height * 3);

  // Demonstrate bufMjpegToRgb
  console.log('Converting MJPEG to RGB...');
  const rgbFromMjpeg = bufMjpegToRgb(width, height, mjpegBuffer);
  console.log('MJPEG to RGB result size:', rgbFromMjpeg.length, 'bytes');

  // Demonstrate mjpegToRgb (convenience function)
  console.log('\nUsing mjpegToRgb convenience function...');
  const rgbFromMjpeg2 = mjpegToRgb(mjpegBuffer, width, height);
  console.log('Result size:', rgbFromMjpeg2.length, 'bytes');

  // Demonstrate bufNv12ToRgb
  console.log('\nConverting NV12 to RGB...');
  const rgbFromNv12 = bufNv12ToRgb(width, height, nv12Buffer);
  console.log('NV12 to RGB result size:', rgbFromNv12.length, 'bytes');

  // Demonstrate nv12ToRgb (convenience function)
  console.log('\nUsing nv12ToRgb convenience function...');
  const rgbFromNv12Conv = nv12ToRgb(nv12Buffer, width, height);
  console.log('Result size:', rgbFromNv12Conv.length, 'bytes');

  // Demonstrate bufYuyv422ToRgb
  console.log('\nConverting YUYV422 to RGB...');
  const rgbFromYuyv = bufYuyv422ToRgb(width, height, yuyvBuffer);
  console.log('YUYV422 to RGB result size:', rgbFromYuyv.length, 'bytes');

  // Demonstrate yuyv422ToRgb (convenience function)
  console.log('\nUsing yuyv422ToRgb convenience function...');
  const rgbFromYuyv2 = yuyv422ToRgb(yuyvBuffer, width, height);
  console.log('Result size:', rgbFromYuyv2.length, 'bytes');

  // Demonstrate bufBgrToRgb
  console.log('\nConverting BGR to RGB...');
  const rgbFromBgr = bufBgrToRgb(width, height, bgrBuffer);
  console.log('BGR to RGB result size:', rgbFromBgr.length, 'bytes');
}

// ============================================================================
// TYPE DEMONSTRATION
// ============================================================================

/**
 * Demonstrate all TypeScript types and interfaces
 */
function demonstrateTypes(): void {
  console.log('\n=== TYPE DEMONSTRATION ===\n');

  // CameraDevice interface
  const cameraDevice: CameraDevice = {
    index: '0',
    name: 'Integrated Camera',
  };
  console.log('CameraDevice example:', cameraDevice);

  // Resolution interface
  const resolution: Resolution = {
    width: 1920,
    height: 1080,
  };
  console.log('Resolution example:', resolution);

  // CameraFormat interface
  const cameraFormat: CameraFormat = {
    resolution: resolution,
    frameRate: 30,
    format: FrameFormat.MJPEG,
  };
  console.log('CameraFormat example:', cameraFormat);

  // Frame interface
  const frame: Frame = {
    data: Buffer.alloc(1920 * 1080 * 4),
    width: 1920,
    height: 1080,
  };
  console.log('Frame example:', {
    width: frame.width,
    height: frame.height,
    dataSize: frame.data.length,
  });

  // CameraControl interface
  const cameraControl: CameraControl = {
    name: 'Brightness',
    controlType: 'Integer',
  };
  console.log('CameraControl example:', cameraControl);

  // RequestedFormatConfig interface
  const requestedFormat: RequestedFormatConfig = {
    requestType: RequestedFormatType.AbsoluteHighestResolution,
  };
  console.log('RequestedFormatConfig example:', requestedFormat);

  // ControlValueSetter union type - all variants
  console.log('\nControlValueSetter variants:');

  const intValue: ControlValueSetter = { type: 'Integer', field0: 100 };
  console.log('  Integer value:', intValue);

  const floatValue: ControlValueSetter = { type: 'Float', field0: 2.5 };
  console.log('  Float value:', floatValue);

  const boolValue: ControlValueSetter = { type: 'Boolean', field0: true };
  console.log('  Boolean value:', boolValue);

  const stringValue: ControlValueSetter = { type: 'String', field0: 'manual' };
  console.log('  String value:', stringValue);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

/**
 * Main function to run all demonstrations
 */
async function main(): Promise<void> {
  console.log('NOKHWA-NODE COMPREHENSIVE EXAMPLE');

  try {
    // Utility functions
    demonstrateUtilityFunctions();

    // Enums
    demonstrateEnums();

    // Types
    demonstrateTypes();

    // Camera discovery
    await demonstrateCameraDiscovery();

    // CameraBuffer class
    demonstrateCameraBuffer();

    // Buffer conversions
    demonstrateBufferConversions();

    // Get first available camera
    const cameras = listCameras();
    if (cameras.length === 0) {
      console.log('\n⚠️  No cameras found. Skipping camera-dependent demonstrations.');
    } else {
      const firstCameraIndex = cameras[0].index;

      // Basic camera operations
      await demonstrateBasicCameraOperations(firstCameraIndex);

      // Advanced camera operations
      await demonstrateAdvancedCameraOperations(firstCameraIndex);

      // Capture operations
      await demonstrateCaptureOperations(firstCameraIndex);
    }

    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    DEMONSTRATION COMPLETE                     ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n❌ Error during demonstration:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
