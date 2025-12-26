import { Bench } from 'tinybench';
import {listCameras,Camera} from '../index.js';

async function main() {
    console.log('🎥 Nokhwa-Node Optimized Benchmark\n' + '='.repeat(40));

    const cameras = listCameras();
    if (cameras.length === 0) throw new Error('No cameras found');

    const camera = new Camera(cameras[0].index);
    
    // IMPORTANTE: Para benchmarks de captura real, 
    // necesitamos iniciar el stream fuera del loop.
    camera.openStream(); 

    const format = camera.cameraFormat();
    console.log(`Device:`,cameras[0]);
    console.log(`Config:`,format);

    const bench = new Bench({ time: 5000 });

    // --- Definición de Tests ---

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
    console.log('\n✅ Done.');
}

main().catch(console.error);