import {
  bufMjpegToRgb,
  mjpegToRgb,
  bufNv12ToRgb,
  nv12ToRgb,
  bufYuyv422ToRgb,
  yuyv422ToRgb,
  bufBgrToRgb,
} from '../../index.js';

/**
 * Demonstrate all buffer conversion functions
 */
export function demonstrateBufferConversions(): void {
  console.log('\n=== BUFFER CONVERSION FUNCTIONS ===\n');

  const width = 640;
  const height = 480;

  // Create sample buffers for each format
  // Create sample buffers for each format
  // For MJPEG, we need a valid JPEG header at minimum to avoid decoder panics
  const mjpegBuffer = Buffer.from([
    0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00,
    0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff,
    0xc4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
    0x00, 0x00, 0x00, 0xff, 0xd9
  ]);
  const nv12Buffer = Buffer.alloc(width * height * 3 / 2);
  const yuyvBuffer = Buffer.alloc(width * height * 2);
  const bgrBuffer = Buffer.alloc(width * height * 3);

  // Demonstrate bufMjpegToRgb
  console.log('Converting MJPEG to RGB...');
  try {
    const rgbFromMjpeg = bufMjpegToRgb(width, height, mjpegBuffer);
    console.log('MJPEG to RGB result size:', rgbFromMjpeg.length, 'bytes');
  } catch (error) {
    console.log('MJPEG conversion skipped (expected - invalid test data):', error instanceof Error ? error.message : error);
  }

  // Demonstrate mjpegToRgb (convenience function)
  console.log('\nUsing mjpegToRgb convenience function...');
  try {
    const rgbFromMjpeg2 = mjpegToRgb(mjpegBuffer, width, height);
    console.log('Result size:', rgbFromMjpeg2.length, 'bytes');
  } catch (error) {
    console.log('MJPEG convenience conversion skipped (expected - invalid test data):', error instanceof Error ? error.message : error);
  }

  // Demonstrate bufNv12ToRgb
  console.log('\nConverting NV12 to RGB...');
  try {
    const rgbFromNv12 = bufNv12ToRgb(width, height, nv12Buffer);
    console.log('NV12 to RGB result size:', rgbFromNv12.length, 'bytes');
  } catch (error) {
    console.log('NV12 conversion failed:', error instanceof Error ? error.message : error);
  }

  // Demonstrate nv12ToRgb (convenience function)
  console.log('\nUsing nv12ToRgb convenience function...');
  try {
    const rgbFromNv12Conv = nv12ToRgb(nv12Buffer, width, height);
    console.log('Result size:', rgbFromNv12Conv.length, 'bytes');
  } catch (error) {
    console.log('NV12 convenience conversion failed:', error instanceof Error ? error.message : error);
  }

  // Demonstrate bufYuyv422ToRgb
  console.log('\nConverting YUYV422 to RGB...');
  try {
    const rgbFromYuyv = bufYuyv422ToRgb(width, height, yuyvBuffer);
    console.log('YUYV422 to RGB result size:', rgbFromYuyv.length, 'bytes');
  } catch (error) {
    console.log('YUYV422 conversion failed:', error instanceof Error ? error.message : error);
  }

  // Demonstrate yuyv422ToRgb (convenience function)
  console.log('\nUsing yuyv422ToRgb convenience function...');
  try {
    const rgbFromYuyv2 = yuyv422ToRgb(yuyvBuffer, width, height);
    console.log('Result size:', rgbFromYuyv2.length, 'bytes');
  } catch (error) {
    console.log('YUYV422 convenience conversion failed:', error instanceof Error ? error.message : error);
  }

  // Demonstrate bufBgrToRgb
  console.log('\nConverting BGR to RGB...');
  try {
    const rgbFromBgr = bufBgrToRgb(width, height, bgrBuffer);
    console.log('BGR to RGB result size:', rgbFromBgr.length, 'bytes');
  } catch (error) {
    console.log('BGR conversion failed:', error instanceof Error ? error.message : error);
  }
}
