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
  const mjpegBuffer = Buffer.alloc(width * height * 2);
  const nv12Buffer = Buffer.alloc(width * height * 3 / 2);
  const yuyvBuffer = Buffer.alloc(width * height * 2);
  const bgrBuffer = Buffer.alloc(width * height * 3);

  // Demonstrate bufMjpegToRgb
  console.log('Converting MJPEG to RGB...');
  const rgbFromMjpeg = bufMjpegToRgb(width, height, mjpegBuffer);
  console.log('MJPEG to RGB result size:', rgbFromMjpeg.length, 'bytes');

  // Demonstrate mjpegToRgb (convenience function)
  console.log('\nUsing mjpegToRgb convenience function...');
  const rgbFromMjpeg2 = mjpegToRgb(mjpegBuffer, width, height);
  console.log('Result size:', rgbFromMjpeg2.length, 'bytes');

  // Demonstrate bufNv12ToRgb
  console.log('\nConverting NV12 to RGB...');
  const rgbFromNv12 = bufNv12ToRgb(width, height, nv12Buffer);
  console.log('NV12 to RGB result size:', rgbFromNv12.length, 'bytes');

  // Demonstrate nv12ToRgb (convenience function)
  console.log('\nUsing nv12ToRgb convenience function...');
  const rgbFromNv12Conv = nv12ToRgb(nv12Buffer, width, height);
  console.log('Result size:', rgbFromNv12Conv.length, 'bytes');

  // Demonstrate bufYuyv422ToRgb
  console.log('\nConverting YUYV422 to RGB...');
  const rgbFromYuyv = bufYuyv422ToRgb(width, height, yuyvBuffer);
  console.log('YUYV422 to RGB result size:', rgbFromYuyv.length, 'bytes');

  // Demonstrate yuyv422ToRgb (convenience function)
  console.log('\nUsing yuyv422ToRgb convenience function...');
  const rgbFromYuyv2 = yuyv422ToRgb(yuyvBuffer, width, height);
  console.log('Result size:', rgbFromYuyv2.length, 'bytes');

  // Demonstrate bufBgrToRgb
  console.log('\nConverting BGR to RGB...');
  const rgbFromBgr = bufBgrToRgb(width, height, bgrBuffer);
  console.log('BGR to RGB result size:', rgbFromBgr.length, 'bytes');
}
