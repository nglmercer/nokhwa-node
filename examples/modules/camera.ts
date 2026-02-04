import {
  Camera,
  RequestedFormatType,
  KnownCameraControl,
  type RequestedFormatConfig,
  type CameraControl,
  type ControlValueSetter,
} from '../../index.js';

/**
 * Demonstrate basic Camera class operations - minimal output
 */
export async function demonstrateBasicCameraOperations(camera: Camera): Promise<void> {
  console.log('[Camera] Index:', camera.index());
  console.log('[Camera] Backend:', camera.backend());
  console.log('[Camera] Format:', camera.cameraFormat());
  console.log('[Camera] Stream open:', camera.isStreamOpen());
  console.log('[Camera] Compatible formats:', camera.compatibleCameraFormats().length, 'available');
}

/**
 * Demonstrate advanced Camera class operations - minimal output
 */
export async function demonstrateAdvancedCameraOperations(camera: Camera): Promise<void> {
  console.log('[Camera] Refreshing format...');
  console.log('[Camera] Refreshed:', camera.refreshCameraFormat());

  // Request highest resolution
  const highResRequest: RequestedFormatConfig = {
    requestType: RequestedFormatType.AbsoluteHighestResolution,
  };
  console.log('[Camera] Highest resolution:', camera.setCameraRequest(highResRequest));

  // Request highest frame rate
  const highFpsRequest: RequestedFormatConfig = {
    requestType: RequestedFormatType.AbsoluteHighestFrameRate,
  };
  console.log('[Camera] Highest FPS:', camera.setCameraRequest(highFpsRequest));

  // Camera controls
  const supportedControls = camera.supportedCameraControls();
  console.log('[Camera] Supported controls:', supportedControls.length);

  const allControls = camera.cameraControls();
  console.log('[Camera] All controls:', allControls.map((c: CameraControl) => c.name).join(', '));

  // Test setting controls (silently)
  const controlsToTest: [KnownCameraControl, ControlValueSetter][] = [
    [KnownCameraControl.BacklightComp, { type: 'Boolean', field0: true }]
  ];

  for (const [control, value] of controlsToTest) {
    try {
      camera.setCameraControl(control, value);
      console.log(`[Camera] Set ${control}: OK`);
    } catch (error) {
      console.log(`[Camera] Set ${control}: FAILED`);
    }
  }
}
