import { listCameras, query, ApiBackend, type CameraDevice } from '../../index.js';

/**
 * Demonstrate camera discovery - minimal output
 */
export async function demonstrateCameraDiscovery(): Promise<void> {
  console.log('[Discovery] Listing cameras...');
  const cameras = listCameras();
  console.log('[Discovery] Found:', cameras.length, 'camera(s)');
  cameras.forEach((camera: CameraDevice) => {
    console.log(`  [${camera.index}] ${camera.name}`);
  });

  // Try MediaFoundation backend if available (Windows default)
  console.log('[Discovery] Backend MediaFoundation:', query(ApiBackend.MediaFoundation).length, 'cameras');
}
