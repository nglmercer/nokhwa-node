import test from 'node:test'
import assert from 'node:assert'
import { nokhwaCheck, frameFormats, allKnownCameraControls } from '../index.js'

test('nokhwa check function should return a boolean', () => {
  const result = nokhwaCheck()
  assert.strictEqual(typeof result, 'boolean')
})

test('frame formats function should return a non-empty array', () => {
  const formats = frameFormats()
  assert.strictEqual(Array.isArray(formats), true)
  assert.ok(formats.length > 0)
})

test('all known camera controls function should return a non-empty array', () => {
  const controls = allKnownCameraControls()
  assert.strictEqual(Array.isArray(controls), true)
  assert.ok(controls.length > 0)
})
