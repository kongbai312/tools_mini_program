import type { CropDuration } from '../data/crops'
import { STALL_LEVELS } from '../data/stallLevels'
import { getWaterRule } from '../data/waterRules'

export interface HarvestResult {
  matureAt: Date
  durationMinutes: number
  waterNodes: { index: number; at: Date; label: string }[]
  fullWater: boolean
}

export interface WeekendHint {
  type: 'in_window' | 'before_friday_double' | 'none'
  message: string
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000)
}

export function pad2(n: number) {
  return `${n}`.padStart(2, '0')
}

/** 格式化日期时间 YYYY-MM-DD HH:mm */
export function formatDateTime(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

/** 格式化时长 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) return `${Math.round(minutes * 60)} 秒`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h <= 0) return `${m} 分钟`
  if (m <= 0) return `${h} 小时`
  return `${h} 小时 ${m} 分钟`
}

export function parsePlantDateTime(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}:00`)
}

export function nowDateStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export function nowTimeStr(): string {
  const d = new Date()
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

/** 计算成熟时间与浇水节点 */
export function calculateHarvest(
  plantedAt: Date,
  growMinutes: number,
  waterBucket: CropDuration | null,
  fullWater: boolean,
): HarvestResult {
  if (!waterBucket) {
    const matureAt = addMinutes(plantedAt, growMinutes)
    return {
      matureAt,
      durationMinutes: growMinutes,
      waterNodes: [{ index: 1, at: plantedAt, label: '短时作物，按自然生长' }],
      fullWater: false,
    }
  }
  const rule = getWaterRule(waterBucket)
  const durationMinutes = fullWater ? rule.minMinutes : rule.baseMinutes
  const matureAt = addMinutes(plantedAt, durationMinutes)
  const nodes = (fullWater ? rule.nodes : [{ index: 1, offsetMinutes: 0, label: '仅种植，不额外浇水' }]).map(
    (n) => ({
      index: n.index,
      at: addMinutes(plantedAt, n.offsetMinutes),
      label: n.label,
    }),
  )
  return { matureAt, durationMinutes, waterNodes: nodes, fullWater }
}

/** 周五 18:00 – 周日 24:00 周末双倍窗口 */
export function isWeekendDoubleWindow(d: Date): boolean {
  const day = d.getDay()
  const h = d.getHours()
  const m = d.getMinutes()
  const mins = h * 60 + m
  if (day === 5 && mins >= 18 * 60) return true
  if (day === 6) return true
  if (day === 0 && mins < 24 * 60) return true
  return false
}

/** 成熟时刻是否在周末双倍窗口内 */
export function getWeekendHint(matureAt: Date): WeekendHint {
  if (isWeekendDoubleWindow(matureAt)) {
    return { type: 'in_window', message: '成熟时间在周末双倍窗口内，售价可享双倍加成' }
  }
  const day = matureAt.getDay()
  const mins = matureAt.getHours() * 60 + matureAt.getMinutes()
  if (day === 5 && mins < 18 * 60) {
    return {
      type: 'before_friday_double',
      message: '成熟时间在周五 18:00 前，可延迟末次浇水，争取周末双倍',
    }
  }
  return { type: 'none', message: '' }
}

export interface PriceEstimateInput {
  unitPrice: number
  yieldPerPlot: number
  plotCount: number
  stallRate: number
  secondLevelPlotCount: number
  weekendDouble: boolean
}

export function cropLevelBonusRate(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(10, Math.round(level)))
  if (normalizedLevel >= 10) return 2
  return 1 + (normalizedLevel - 1) * 0.1
}

export function cropLevelUnitPrice(basePrice: number, level: number): number {
  return Math.round(basePrice * cropLevelBonusRate(level))
}

export function stallBonusRateFromLevel(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(40, Math.round(level)))
  const stall = STALL_LEVELS.find((item) => item.level === normalizedLevel)
  return 1 + (stall?.priceBonusPercent ?? 0) / 100
}

export function stallBonusRateFromPercent(percent: number): number {
  return 1 + Math.max(0, percent) / 100
}

export function stallLevelFromBonusPercent(percent: number): number {
  const normalizedPercent = Math.max(0, percent)
  const nearest = STALL_LEVELS.reduce((best, item) => {
    return Math.abs(item.priceBonusPercent - normalizedPercent) <
      Math.abs(best.priceBonusPercent - normalizedPercent)
      ? item
      : best
  }, STALL_LEVELS[0])
  return nearest.level
}

export function estimatePrice(input: PriceEstimateInput): number {
  const {
    unitPrice,
    yieldPerPlot,
    plotCount,
    stallRate,
    secondLevelPlotCount,
    weekendDouble,
  } = input
  const normalizedPlotCount = Math.max(1, Math.min(24, Math.round(plotCount)))
  const normalizedSecondLevelPlotCount = Math.max(
    0,
    Math.min(normalizedPlotCount, Math.round(secondLevelPlotCount)),
  )
  const firstLevelPlotCount = normalizedPlotCount - normalizedSecondLevelPlotCount
  const yieldUnits = firstLevelPlotCount + normalizedSecondLevelPlotCount * 1.5
  let total = unitPrice * Math.max(1, yieldPerPlot) * yieldUnits * stallRate
  if (weekendDouble) total *= 2
  return Math.round(total)
}
