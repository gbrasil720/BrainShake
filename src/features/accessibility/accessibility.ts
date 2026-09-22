export const FONT_SIZE_OPTIONS = ['small', 'default', 'large', 'extra-large'] as const
export const COLOR_VISION_OPTIONS = [
  'none',
  'protanopia',
  'deuteranopia',
  'tritanopia',
  'achromatopsia'
] as const

export type FontSizeOption = (typeof FONT_SIZE_OPTIONS)[number]
export type ColorVisionMode = (typeof COLOR_VISION_OPTIONS)[number]

export function getFontScale(size: string): number {
  switch (size) {
    case 'small':
      return 0.92
    case 'large':
      return 1.12
    case 'extra-large':
      return 1.24
    case 'default':
    default:
      return 1
  }
}

export function normalizeColorVisionMode(value: string): ColorVisionMode {
  return COLOR_VISION_OPTIONS.includes(value as ColorVisionMode)
    ? (value as ColorVisionMode)
    : 'none'
}
