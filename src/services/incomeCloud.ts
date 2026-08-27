import { getWechatCloud } from '@/services/wechatCloud'
import type { IncomeRecord } from '@/utils/incomeCore'

export interface IncomeCloudSnapshot {
  records: IncomeRecord[]
  updatedAt: number
}

interface IncomeCloudResult<T> {
  ok: boolean
  message?: string
  data?: T
}

async function callIncomeCloud<T>(
  action: string,
  payload: Record<string, unknown> = {},
): Promise<T | null> {
  const cloud = getWechatCloud()
  if (!cloud) return null

  try {
    const response = await (cloud as any).callFunction({
      name: 'income',
      data: { action, ...payload },
    })
    const result = response?.result as IncomeCloudResult<T> | undefined
    if (!result?.ok || result.data === undefined) return null
    return result.data
  } catch {
    return null
  }
}

export async function fetchIncomeCloudSnapshot(): Promise<IncomeCloudSnapshot | null> {
  return callIncomeCloud<IncomeCloudSnapshot>('fetch')
}

export async function saveIncomeCloudSnapshot(
  records: IncomeRecord[],
  updatedAt = Date.now(),
): Promise<boolean> {
  const result = await callIncomeCloud<{ saved: boolean }>('save', { records, updatedAt })
  return Boolean(result?.saved)
}
