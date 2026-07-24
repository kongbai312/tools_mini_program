import type { CropDuration } from './crops'

/** 生长时间文案 → 分钟 */
export function parseGrowMinutes(label: string): number {
  if (label.endsWith('秒')) return parseFloat(label) / 60
  if (label.endsWith('分钟')) return parseFloat(label)
  if (label === '1小时') return 60
  if (label === '8小时') return 480
  if (label === '16小时') return 960
  if (label === '32小时') return 1920
  return 60
}

/** 可套用浇水规则的时长桶；短时作物返回 null */
export function getWaterBucket(minutes: number): CropDuration | null {
  if (minutes >= 1920) return 32
  if (minutes >= 960) return 16
  if (minutes >= 480) return 8
  if (minutes >= 60) return 1
  return null
}

export type GrowFilter = 'all' | 'short' | CropDuration

export function matchGrowFilter(growMinutes: number, filter: GrowFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'short') return growMinutes < 60
  const bucket = getWaterBucket(growMinutes)
  return bucket === filter
}
