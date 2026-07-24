import type { CropDuration } from './crops'

export interface WaterNode {
  /** 第几次浇水（1-4） */
  index: number
  /** 相对种植时刻的偏移（分钟） */
  offsetMinutes: number
  label: string
}

export interface WaterRule {
  durationHours: CropDuration
  baseMinutes: number
  minMinutes: number
  nodes: WaterNode[]
}

/** 满 4 次浇水后的最短成熟时间与各节点（公开攻略整理） */
export const WATER_RULES: Record<CropDuration, WaterRule> = {
  1: {
    durationHours: 1,
    baseMinutes: 60,
    minMinutes: 44,
    nodes: [
      { index: 1, offsetMinutes: 0, label: '种植时' },
      { index: 2, offsetMinutes: 20, label: '种植后 20 分钟' },
      { index: 3, offsetMinutes: 40, label: '种植后 40 分钟' },
      { index: 4, offsetMinutes: 44, label: '催熟（最短 44 分钟）' },
    ],
  },
  8: {
    durationHours: 8,
    baseMinutes: 480,
    minMinutes: 352,
    nodes: [
      { index: 1, offsetMinutes: 0, label: '种植时' },
      { index: 2, offsetMinutes: 160, label: '种植后 2 小时 40 分' },
      { index: 3, offsetMinutes: 320, label: '种植后 5 小时 20 分' },
      { index: 4, offsetMinutes: 352, label: '催熟（最短 5 小时 52 分）' },
    ],
  },
  16: {
    durationHours: 16,
    baseMinutes: 960,
    minMinutes: 704,
    nodes: [
      { index: 1, offsetMinutes: 0, label: '种植时' },
      { index: 2, offsetMinutes: 320, label: '种植后 5 小时 20 分' },
      { index: 3, offsetMinutes: 640, label: '种植后 10 小时 40 分' },
      { index: 4, offsetMinutes: 704, label: '催熟（最短 11 小时 44 分）' },
    ],
  },
  32: {
    durationHours: 32,
    baseMinutes: 1920,
    minMinutes: 1408,
    nodes: [
      { index: 1, offsetMinutes: 0, label: '种植时' },
      { index: 2, offsetMinutes: 640, label: '种植后 10 小时 40 分' },
      { index: 3, offsetMinutes: 1280, label: '种植后 21 小时 20 分' },
      { index: 4, offsetMinutes: 1408, label: '催熟（最短 23 小时 28 分）' },
    ],
  },
}

export function getWaterRule(durationHours: CropDuration): WaterRule {
  return WATER_RULES[durationHours]
}
