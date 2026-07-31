// 颜色工具用于时光序的自定义主题色、透明背景和 RGB 选择器。
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '').trim()
  if (h.length !== 6) return { r: 139, g: 92, b: 246 }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(Number(n))))
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')}`
}

// 统一把用户输入的颜色修正为合法 6 位大写 hex。
export function normalizeHex(hex: string, fallback = '#8B5CF6'): string {
  const raw = hex.replace('#', '').trim()
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toUpperCase()}`
  return fallback
}

// 小程序样式里经常需要 rgba，这里把 hex + alpha 转成可直接使用的字符串。
export function colorAlpha(hex: string, alpha: number, fallback = '139, 92, 246'): string {
  const h = normalizeHex(hex).replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  if (Number.isNaN(r)) return `rgba(${fallback}, ${alpha})`
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
