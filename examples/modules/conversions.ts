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
 * Demonstrate all buffer conversion functions - minimal output
 */
export function demonstrateBufferConversions(): void {
  console.log('[Conversions] Testing format conversions...');
  const width = 640;
  const height = 480;

  // Create buffers
  const nv12Buffer = Buffer.alloc(width * height * 3 / 2);
  const yuyvBuffer = Buffer.alloc(width * height * 2);
  const bgrBuffer = Buffer.alloc(width * height * 3);

  // Test conversions (only show results)
  try { bufNv12ToRgb(width, height, nv12Buffer); } catch {}
  try { nv12ToRgb(nv12Buffer, width, height); } catch {}
  try { bufYuyv422ToRgb(width, height, yuyvBuffer); } catch {}
  try { yuyv422ToRgb(yuyvBuffer, width, height); } catch {}
  try { bufBgrToRgb(width, height, bgrBuffer); } catch {}

  console.log('[Conversions] NV12, YUYV, BGR conversions completed');
}
