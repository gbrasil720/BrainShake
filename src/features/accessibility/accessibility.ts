export const FONT_SIZES = ['small', 'default', 'large', 'extra-large'] as const
export type FontSize = (typeof FONT_SIZES)[number]

export const COLOR_VISION_MODES = [
  'none',
  'protanopia',
  'deuteranopia',
  'tritanopia',
  'achromatopsia'
] as const
export type ColorVisionMode = (typeof COLOR_VISION_MODES)[number]

export function normalizeFontSize(value: string): FontSize {
  return FONT_SIZES.includes(value as FontSize) ? (value as FontSize) : 'default'
}

export function normalizeColorVision(value: string): ColorVisionMode {
  return COLOR_VISION_MODES.includes(value as ColorVisionMode) ? (value as ColorVisionMode) : 'none'
}
