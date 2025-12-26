import test from 'ava'

import { nokhwaCheck, frameFormats, allKnownCameraControls } from '../index'

test('nokhwa check function', (t) => {
  const result = nokhwaCheck()
  t.is(typeof result, 'boolean')
  // Don't require nokhwaCheck to be true - it returns false in headless/CI environments
})

test('frame formats function', (t) => {
  const formats = frameFormats()
  t.is(Array.isArray(formats), true)
  t.true(formats.length > 0)
})

test('all known camera controls function', (t) => {
  const controls = allKnownCameraControls()
  t.is(Array.isArray(controls), true)
  t.true(controls.length > 0)
})
