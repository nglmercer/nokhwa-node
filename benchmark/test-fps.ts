import { Camera, listCameras, RequestedFormatConfig, RequestedFormatType } from '../index.js';

async function main() {
    console.log('🎥 Testing Camera FPS Configuration\n');

    const cameras = listCameras();
    if (cameras.length === 0) {
        console.log('❌ No cameras found');
        return;
    }

    const camera = new Camera(cameras[0].index);
    
    // Test 1: Current format
    console.log('📊 Test 1: Current Format (from constructor)');
    let format = camera.cameraFormat();
    console.log(`   Resolution: ${format.resolution.width}x${format.resolution.height}`);
    console.log(`   Frame Rate: ${format.frameRate} fps\n`);

    // Test 2: Try setting to highest frame rate
    console.log('📊 Test 2: Request Highest Frame Rate');
    const maxFpsRequest = { requestType: RequestedFormatType.AbsoluteHighestFrameRate };
    format = camera.setCameraRequest(maxFpsRequest);
    console.log(`   Resolution: ${format.resolution.width}x${format.resolution.height}`);
    console.log(`   Frame Rate: ${format.frameRate} fps\n`);

    // Test 3: Try setting to highest resolution
    console.log('📊 Test 3: Request Highest Resolution');
    const maxResRequest = { requestType: RequestedFormatType.AbsoluteHighestResolution };
    format = camera.setCameraRequest(maxResRequest);
    console.log(`   Resolution: ${format.resolution.width}x${format.resolution.height}`);
    console.log(`   Frame Rate: ${format.frameRate} fps\n`);

    // Test 4: Refresh format
    console.log('📊 Test 4: Refresh Format');
    format = camera.refreshCameraFormat();
    console.log(`   Resolution: ${format.resolution.width}x${format.resolution.height}`);
    console.log(`   Frame Rate: ${format.frameRate} fps\n`);

    // Test 5: Check all available formats
    console.log('📊 Test 5: Available Formats');
    const formats = camera.compatibleCameraFormats();
    const uniqueFps = [...new Set(formats.map(f => f.frameRate))];
    console.log(`   Unique frame rates: ${uniqueFps.sort((a, b) => b - a).join(', ')} fps`);

    const highFpsFormats = formats.filter(f => f.frameRate >= 30);
    console.log(`   Formats with >=30fps: ${highFpsFormats.length}`);
    if (highFpsFormats.length > 0) {
        const best = highFpsFormats[0];
        console.log(`   Best format: ${best.resolution.width}x${best.resolution.height} @ ${best.frameRate}fps`);
    }

    camera.stopStream();
}

main().catch(error => {
    console.error('❌ Error:', error);
});
