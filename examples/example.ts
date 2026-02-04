/**
 * Comprehensive example demonstrating all methods, functions, classes, types, and enums
 * available in nokhwa-node - Optimizado con logs mínimos
 */

import { listCameras, Camera } from '../index.js';
import { demonstrateUtilityFunctions, demonstrateEnums } from './modules/utilities.js';
import { demonstrateCameraDiscovery } from './modules/discovery.js';
import { demonstrateBasicCameraOperations, demonstrateAdvancedCameraOperations } from './modules/camera.js';
import { demonstrateCaptureOperations, demonstrateCameraBuffer } from './modules/capture.js';
import { demonstrateBufferConversions } from './modules/conversions.js';
import { demonstrateTypes } from './modules/types.js';

/**
 * Main function to run all demonstrations
 */
async function main(): Promise<void> {
  console.log('NOKHWA-NODE EXAMPLE');

  try {
    // Utility and basic demonstrations
    demonstrateUtilityFunctions();
    demonstrateEnums();
    demonstrateTypes();

    // Discovery demonstration
    await demonstrateCameraDiscovery();

    // Buffer and conversion demonstrations
    demonstrateCameraBuffer();
    demonstrateBufferConversions();

    // Get first available camera for hardware demonstrations
    const cameras = listCameras();
    if (cameras.length === 0) {
      console.log('[!] No cameras found');
    } else {
      console.log('[>] Using camera:', cameras[0].name);
      const camera = new Camera(cameras[0].index);

      try {
        // Basic camera operations
        await demonstrateBasicCameraOperations(camera);

        // Advanced camera operations
        await demonstrateAdvancedCameraOperations(camera);

        // Capture operations
        await demonstrateCaptureOperations(camera);
      } finally {
        camera.stopStream();
      }
    }

    console.log('[OK] Done');
  } catch (error) {
    console.error('[ERROR]', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error('[FATAL]', error);
  process.exit(1);
});
