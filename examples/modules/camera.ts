import {
  Camera,
  RequestedFormatType,
  KnownCameraControl,
  type RequestedFormatConfig,
  type CameraControl,
  type ControlValueSetter,
} from '../../index.js';

/**
 * Demonstrate basic Camera class operations
 */
export async function demonstrateBasicCameraOperations(cameraIndex: string): Promise<void> {
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

/**
 * Demonstrate advanced Camera class operations
 */
export async function demonstrateAdvancedCameraOperations(cameraIndex: string): Promise<void> {
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

  const controlsToTest: [KnownCameraControl, ControlValueSetter][] = [
    [KnownCameraControl.Brightness, { type: 'Integer', field0: 50 }],
    [KnownCameraControl.Contrast, { type: 'Float', field0: 1.5 }],
    [KnownCameraControl.BacklightComp, { type: 'Boolean', field0: true }],
    [KnownCameraControl.WhiteBalance, { type: 'String', field0: 'auto' }]
  ];

  for (const [control, value] of controlsToTest) {
    try {
      camera.setCameraControl(control, value);
      console.log(`Set ${control} to ${JSON.stringify(value.field0)}`);
    } catch (error) {
      console.log(`Could not set ${control}:`, error instanceof Error ? error.message : error);
    }
  }

  camera.stopStream();
}
