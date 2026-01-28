import { Camera, CameraBuffer, type Frame } from '../../index.js';

/**
 * Demonstrate frame capture operations
 */
export async function demonstrateCaptureOperations(cameraIndex: string): Promise<void> {
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

/**
 * Demonstrate CameraBuffer class usage
 */
import { FrameFormat, type Resolution } from '../../index.js';

export function demonstrateCameraBuffer(): void {
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
