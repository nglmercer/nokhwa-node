/**
 * Simple benchmark to measure camera framerate for 5 seconds
 * Usage: bun run examples/benchmark-simple.ts
 */

import { listCameras, Camera,RequestedFormatType,FrameFormat } from '../index.js';

async function main(): Promise<void> {
  console.log('NOKHWA BENCHMARK - 5 seconds');

  const cameras = listCameras();
  if (cameras.length === 0) {
    console.log('[!] No cameras found');
    process.exit(1);
  }
  console.log("cameras", cameras)
  // Use first camera with default format
  const camera = Camera.newWithFormat(cameras[0].index, { requestType: RequestedFormatType.AbsoluteHighestFrameRate,format:FrameFormat.NV12 });
  console.log('[>] Camera:', cameras[0].name);
  console.log('[>] Backend:', camera.backend());
  console.log('[>] Format:', camera.cameraFormat());

  const startTime = Date.now();
  let frameCount = 0;
  const duration = 5000; // 5 seconds

  console.log('[>] Starting benchmark...');

  // Capture frames for 5 seconds
  while (Date.now() - startTime < duration) {
    try {
      camera.captureFrame();
      frameCount++;
    } catch {
      console.log('[!] Frame capture failed');
      break;
    }
  }

  const elapsed = (Date.now() - startTime) / 1000;
  const fps = frameCount / elapsed;

  console.log('[>] Results:');
  console.log('    Frames:', frameCount);
  console.log('    Time:', elapsed.toFixed(2), 's');
  console.log('    FPS:', fps.toFixed(2));

  camera.stopStream();
  console.log('[OK] Done');
}

main().catch(console.error);
