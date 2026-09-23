export const FONT_SIZES = ['small', 'default', 'large', 'extra-large'] as const
export const FONT_SIZE_OPTIONS = FONT_SIZES
export type FontSize = (typeof FONT_SIZES)[number]

export const COLOR_VISION_MODES = [
  'none',
  'protanopia',
  'deuteranopia',
  'tritanopia',
  'achromatopsia'
] as const
export const COLOR_VISION_OPTIONS = COLOR_VISION_MODES
export type ColorVisionMode = (typeof COLOR_VISION_MODES)[number]

const FONT_SCALES: Record<FontSize, number> = {
  small: 0.92,
  default: 1,
  large: 1.12,
  'extra-large': 1.24
}

export function normalizeFontSize(value: string): FontSize {
  return FONT_SIZES.includes(value as FontSize) ? (value as FontSize) : 'default'
}

export function getFontScale(value: string): number {
  return FONT_SCALES[normalizeFontSize(value)]
}

export function normalizeColorVision(value: string): ColorVisionMode {
  return COLOR_VISION_MODES.includes(value as ColorVisionMode) ? (value as ColorVisionMode) : 'none'
}

export function normalizeColorVisionMode(value: string): ColorVisionMode {
  return normalizeColorVision(value)
}
