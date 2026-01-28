/**
 * Comprehensive example demonstrating all methods, functions, classes, types, and enums
 * available in nokhwa-node. Modularized for better readability.
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
  console.log('NOKHWA-NODE COMPREHENSIVE EXAMPLE');

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
      console.log('\n⚠️  No cameras found. Skipping camera-dependent demonstrations.');
    } else {
      const firstCameraIndex = cameras[0].index;
      console.log(`\nInitializing camera: ${cameras[0].name} (index: ${firstCameraIndex})`);
      
      const camera = new Camera(firstCameraIndex);

      try {
        // Basic camera operations
        await demonstrateBasicCameraOperations(camera);

        // Advanced camera operations
        await demonstrateAdvancedCameraOperations(camera);

        // Capture operations
        await demonstrateCaptureOperations(camera);
      } finally {
        console.log('\nStopping camera stream...');
        camera.stopStream();
      }
    }

    console.log({
      msg: "complete all demonstrations successfully"
    });
  } catch (error) {
    console.error({error});
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
