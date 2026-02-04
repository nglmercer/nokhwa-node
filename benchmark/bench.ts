import { Bench } from 'tinybench';
import {listCameras,Camera} from '../index.js';

async function main() {
    console.log('🎥 Nokhwa-Node Optimized Benchmark\n' + '='.repeat(40));

    const cameras = listCameras();
    console.log(`Devices found:`, cameras);
    if (cameras.length === 0) {
        console.log('⏭️  No cameras available - skipping benchmark');
        return;
    }

    const camera = new Camera(cameras[0].index);
    
    // Get all compatible formats to see what's available
    const compatibleFormats = camera.compatibleCameraFormats();
    
    // Read format after initialization (constructor now auto-optimizes to 30fps+)
    let currentFormat = camera.cameraFormat();
    
    // Find the actual frame rate from compatible formats (camera_format() shows requested FPS)
    const matchingFormat = compatibleFormats.find(
        fmt => fmt.resolution.width === currentFormat.resolution.width &&
               fmt.resolution.height === currentFormat.resolution.height &&
               fmt.format === currentFormat.format
    );
    
    // Use the actual frame rate from compatible formats
    if (matchingFormat) {
        currentFormat.frameRate = matchingFormat.frameRate;
    }
    
    console.log(`Devices:`, cameras);
    console.log(`\n📷 Available Formats (${compatibleFormats.length} total):`);
    console.table(
        compatibleFormats.map((fmt, idx) => ({
            Index: idx,
            Resolution: `${fmt.resolution.width}x${fmt.resolution.height}`,
            FPS: fmt.frameRate,
            Format: fmt.format,
            Selected: fmt.resolution.width === currentFormat.resolution.width &&
                     fmt.resolution.height === currentFormat.resolution.height &&
                     fmt.format === currentFormat.format ? '✓' : ''
        }))
    );
    
    console.log(`\n✅ Selected Format:`, currentFormat);

    const bench = new Bench({ time: 5000 });

    // --- Definición de Tests ---
    // Note: Camera stream is already opened in constructor

    bench
        .add('Raw Frame Capture', () => {
            camera.captureFrame();
        })
        .add('Capture + Data Access', () => {
            const frame = camera.captureFrame();
            // Access data to simulate memory access
            void frame.data;
        })
        .add('Metadata Query', () => {
            camera.info();
            camera.cameraFormat();
        });

    // --- Ejecución ---
    
    console.log('🚀 Running Benchmarks...');
    //await bench.warmup();
    await bench.run();

    // --- Resultados ---
    // Tinybench ya tiene un formateador de tablas integrado
    console.table(bench.table());


    // Cleanup
    camera.stopStream();
}

main().catch(console.error);
