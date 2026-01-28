import { listCameras, query, ApiBackend, type CameraDevice } from '../../index.js';

/**
 * Demonstrate camera discovery using different methods
 */
export async function demonstrateCameraDiscovery(): Promise<void> {
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
  const backends = [
    { name: 'MediaFoundation', backend: ApiBackend.MediaFoundation },
    { name: 'AVFoundation', backend: ApiBackend.AVFoundation },
    { name: 'OpenCv', backend: ApiBackend.OpenCv }
  ];

  for (const { name, backend } of backends) {
    console.log(`\nQuerying cameras with ${name} backend:`);
    try {
      const queriedCameras = query(backend);
      console.log(`${name} cameras:`, queriedCameras);
    } catch (error) {
      console.log(`${name} backend not available:`, error instanceof Error ? error.message : error);
    }
  }
}
