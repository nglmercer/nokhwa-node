import {
  FrameFormat,
  RequestedFormatType,
  type CameraDevice,
  type Resolution,
  type CameraFormat,
  type Frame,
  type CameraControl,
  type RequestedFormatConfig,
  type ControlValueSetter,
} from '../../index.js';

/**
 * Demonstrate all TypeScript types and interfaces - minimal output
 */
export function demonstrateTypes(): void {
  console.log('[Types] CameraDevice:', { index: '0', name: 'Integrated Camera' });
  console.log('[Types] Resolution:', { width: 1920, height: 1080 });
  console.log('[Types] CameraFormat:', { width: 1920, height: 1080, frameRate: 30, format: 'MJPEG' });
  console.log('[Types] Frame:', { width: 1920, height: 1080, dataSize: 8294400 });
  console.log('[Types] CameraControl:', { name: 'Brightness', controlType: 'Integer' });
  console.log('[Types] RequestedFormatConfig:', { requestType: 'AbsoluteHighestResolution' });
  console.log('[Types] ControlValueSetter: Integer, Float, Boolean, String');
}
