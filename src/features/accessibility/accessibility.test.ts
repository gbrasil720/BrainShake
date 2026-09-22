import assert from 'node:assert/strict'
import test from 'node:test'
import { COLOR_VISION_OPTIONS, FONT_SIZE_OPTIONS, getFontScale, normalizeColorVisionMode } from './accessibility.ts'

test('font size options expose stable scales', () => {
  assert.deepEqual(FONT_SIZE_OPTIONS, ['small', 'default', 'large', 'extra-large'])
  assert.equal(getFontScale('small'), 0.92)
  assert.equal(getFontScale('default'), 1)
  assert.equal(getFontScale('large'), 1.12)
  assert.equal(getFontScale('extra-large'), 1.24)
})

test('unsupported color vision modes normalize to none', () => {
  assert.equal(normalizeColorVisionMode('protanopia'), 'protanopia')
  assert.equal(normalizeColorVisionMode('deuteranopia'), 'deuteranopia')
  assert.equal(normalizeColorVisionMode('unknown'), 'none')
  assert.deepEqual(COLOR_VISION_OPTIONS, ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'])
})
