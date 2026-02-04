/**
 * Simple benchmark to measure camera framerate for 5 seconds
 * Uses lower resolution for better FPS
 * Usage: bun run examples/benchmark-simple.ts
 */

import { listCameras, Camera, RequestedFormatType, FrameFormat, type CameraFormat } from '../index.js';

async function main(): Promise<void> {
  console.log('NOKHWA BENCHMARK - 5 seconds');

  const cameras = listCameras();
  if (cameras.length === 0) {
    console.log('[!] No cameras found');
    process.exit(1);
  }

  // Use first camera
  const camera = new Camera(cameras[0].index);
  console.log('[>] Camera:', cameras[0].name);
  console.log('[>] Backend:', camera.backend());

  // Try to find best format (lower resolution = higher FPS)
  console.log('[>] Searching for best format...');
  const formats = camera.compatibleCameraFormats();
  const bestFormat = formats.find(f => f.format === FrameFormat.NV12 && f.resolution.width <= 1280)
    || formats.find(f => f.resolution.width <= 640);

  if (bestFormat) {
    console.log('[>] Setting format:', bestFormat);
    try {
      camera.stopStream();
      const fmt = camera.setCameraRequest({
        requestType: RequestedFormatType.AbsoluteHighestFrameRate,
      });
      console.log('[>] Applied format:', fmt);
      camera.openStream();
    } catch (e) {
      console.log('[!] Could not set format:', e);
    }
  }

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
