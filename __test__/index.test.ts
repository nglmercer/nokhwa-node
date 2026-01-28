import { describe, it, expect } from 'bun:test'
import { nokhwaCheck, frameFormats, allKnownCameraControls } from '../index.js'

describe('nokhwa-node', () => {
  it('nokhwa check function should return a boolean', () => {
    const result = nokhwaCheck()
    expect(typeof result).toBe('boolean')
    // Don't require nokhwaCheck to be true - it returns false in headless/CI environments
  })

  it('frame formats function should return a non-empty array', () => {
    const formats = frameFormats()
    expect(Array.isArray(formats)).toBe(true)
    expect(formats.length).toBeGreaterThan(0)
  })

  it('all known camera controls function should return a non-empty array', () => {
    const controls = allKnownCameraControls()
    expect(Array.isArray(controls)).toBe(true)
    expect(controls.length).toBeGreaterThan(0)
  })
})
