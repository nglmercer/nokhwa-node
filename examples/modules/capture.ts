import { Camera, CameraBuffer, type Frame } from '../../index.js';

/**
 * Demonstrate frame capture operations - minimal output
 */
export async function demonstrateCaptureOperations(camera: Camera): Promise<void> {
  console.log('[Capture] Opening stream...');
  if (!camera.isStreamOpen()) {
    camera.openStream();
  }

  console.log('[Capture] Capturing frame...');
  const frame: Frame = camera.captureFrame();
  console.log('[Capture] Frame:', frame.width, 'x', frame.height, '-', frame.data.length, 'bytes');

  console.log('[Capture] Raw buffer:', camera.frameRaw().width(), 'x', camera.frameRaw().height());
}

/**
 * Demonstrate CameraBuffer class usage - minimal output
 */
import { FrameFormat, type Resolution } from '../../index.js';

export function demonstrateCameraBuffer(): void {
  console.log('[Buffer] Creating test buffer...');
  const resolution: Resolution = { width: 640, height: 480 };
  const sampleData = Buffer.alloc(resolution.width * resolution.height * 3);
  const cameraBuffer = new CameraBuffer(resolution, sampleData, FrameFormat.RGB);

  console.log('[Buffer]', cameraBuffer.width(), 'x', cameraBuffer.height(), '-', cameraBuffer.size(), 'bytes');
  console.log('[Buffer] Empty:', cameraBuffer.isEmpty(), '- Format:', cameraBuffer.sourceFrameFormat());
}
