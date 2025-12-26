import { Bench } from 'tinybench';
import {listCameras,Camera} from '../index.js';

async function main() {
    console.log('🎥 Nokhwa-Node Optimized Benchmark\n' + '='.repeat(40));

    const cameras = listCameras();
    if (cameras.length === 0) throw new Error('No cameras found');

    const camera = new Camera(cameras[0].index);
    
    // Refresh format to get actual active format (not just requested)
    camera.refreshCameraFormat();
    
    // Get all compatible formats to see what's available
    const compatibleFormats = camera.compatibleCameraFormats();
    
    // Read format after initialization (constructor now auto-optimizes to 30fps+)
    const currentFormat = camera.cameraFormat();
    
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
                     fmt.frameRate === currentFormat.frameRate ? '✓' : ''
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
            const _ = frame.data; // Simula acceso a memoria
            _;  
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
