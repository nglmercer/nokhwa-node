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
 * Demonstrate all TypeScript types and interfaces
 */
export function demonstrateTypes(): void {
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

  const variants: ControlValueSetter[] = [
    { type: 'Integer', field0: 100 },
    { type: 'Float', field0: 2.5 },
    { type: 'Boolean', field0: true },
    { type: 'String', field0: 'manual' }
  ];

  variants.forEach(variant => {
    console.log(`  ${variant.type} value:`, variant);
  });
}
