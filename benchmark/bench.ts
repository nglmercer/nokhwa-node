import { Bench } from 'tinybench'
import * as nokhwa from '../index.js'
// Import the native module
// @ts-ignore - Dynamic import for the compiled module

async function main() {
  console.log('🎥 Starting Camera Benchmark...\n')

  // List available cameras first
  console.log('📷 Listing available cameras...')
  try {
    const cameras = nokhwa.listCameras()
    console.log(`Found ${cameras.length} camera(s):`)
    cameras.forEach((cam: any, i: number) => {
      console.log(`  ${i}: Index: ${cam.index}, Name: ${cam.name}`)
    })
    
    if (cameras.length === 0) {
      console.log('❌ No cameras found. Please connect a camera and try again.')
      process.exit(1)
    }
    
    const cameraIndex = cameras[0].index
    console.log(`\n🎬 Using camera: ${cameras[0].name} (Index: ${cameraIndex})\n`)
    
    // Create camera instance
    console.log('🔌 Initializing camera...')
    const camera = new nokhwa.Camera(cameraIndex)
    console.log('✅ Camera initialized successfully\n')
    
    // Warm-up capture
    console.log('⚡ Warming up camera (capturing 3 frames)...')
    for (let i = 0; i < 3; i++) {
      camera.captureFrame()
    }
    console.log('✅ Warm-up complete\n')
    
    // Benchmark setup
    const b = new Bench({
      time: 5000, // Run for 5 seconds
      iterations: 100, // Minimum iterations
      warmup: true,
      warmupIterations: 10,
      warmupTime: 1000,
    })
    
    // Test: Single frame capture
    b.add('captureFrame() - Single frame capture', () => {
      camera.captureFrame()
    })
    
    // Test: Multiple frame captures (simulating video stream)
    b.add('captureFrame() x10 - Burst capture', () => {
      for (let i = 0; i < 10; i++) {
        camera.captureFrame()
      }
    })
    
    // Test: Frame data access
    b.add('captureFrame() + data access', () => {
      const frame = camera.captureFrame()
      // Access the buffer data to simulate real usage
      const len = frame.data.length
      const w = frame.width
      const h = frame.height
      return { len, w, h }
    })
    
    // Run benchmarks
    console.log('🚀 Running benchmarks...\n')
    await b.run()
    
    // Display results
    console.log('\n📊 Benchmark Results:')
    console.table(b.table())
    
    // Calculate FPS based on frame capture
    const frameTask = b.tasks.find(t => t.name.includes('Single frame capture'))
    if (frameTask && frameTask.result) {
      // @ts-ignore - tinybench TaskResult may not have all properties typed
      const meanTime = frameTask.result!.mean || frameTask.result!.period || 0
      if (meanTime > 0) {
        const opsPerSecond = 1000 / meanTime
        console.log(`\n📈 Estimated FPS: ${opsPerSecond.toFixed(2)} frames/second`)
      }
    }
    
    console.log('\n✅ Benchmark complete!')
    
  } catch (error) {
    console.error('❌ Benchmark failed:', error)
    process.exit(1)
  }

}

main().catch(console.error)