export interface IncomeRecord {
  id: string
  amount: number
  date: string
  source: string
  remark: string
  createdAt: number
}

export interface IncomeRecordInput {
  amount: number
  date: string
  source: string
  remark: string
  now?: number
}

export interface IncomeSummary {
  day: number
  month: number
  year: number
  total: number
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

export function normalizeIncomeAmount(value: string | number): number {
  const amount = typeof value === 'number'
    ? value
    : Number.parseFloat(String(value).trim().startsWith('-')
      ? 'NaN'
      : String(value).replace(/[^\d.]/g, ''))
  if (!Number.isFinite(amount) || amount <= 0) return 0
  return roundMoney(amount)
}

export function validateIncomeRecordInput(
  amount: string,
  date: string,
  source: string,
): string | null {
  if (!amount.trim()) return '请输入收入金额'
  if (normalizeIncomeAmount(amount) <= 0) return '收入金额需大于 0'
  if (!date.trim()) return '请选择收入日期'
  if (!DATE_PATTERN.test(date.trim())) return '收入日期格式无效'
  if (!source.trim()) return '请输入收入来源'
  return null
}

export function createIncomeRecord(input: IncomeRecordInput): IncomeRecord {
  const now = input.now ?? Date.now()
  return {
    id: `income_${now}_${Math.random().toString(36).slice(2, 8)}`,
    amount: normalizeIncomeAmount(input.amount),
    date: input.date.trim(),
    source: input.source.trim().slice(0, 20),
    remark: input.remark.trim().slice(0, 60),
    createdAt: now,
  }
}

export function normalizeIncomeRecord(raw: Partial<IncomeRecord>): IncomeRecord | null {
  const amount = normalizeIncomeAmount(raw.amount ?? 0)
  const date = String(raw.date || '').trim()
  const source = String(raw.source || '').trim()
  if (amount <= 0 || !DATE_PATTERN.test(date) || !source) return null
  const createdAt = typeof raw.createdAt === 'number' ? raw.createdAt : Date.now()
  return {
    id: String(raw.id || `income_${createdAt}_${Math.random().toString(36).slice(2, 8)}`),
    amount,
    date,
    source: source.slice(0, 20),
    remark: String(raw.remark || '').trim().slice(0, 60),
    createdAt,
  }
}

export function sortIncomeRecords(records: IncomeRecord[]): IncomeRecord[] {
  return [...records].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date)
    if (byDate !== 0) return byDate
    return b.createdAt - a.createdAt
  })
}

export function buildIncomeSummary(records: IncomeRecord[], today: string): IncomeSummary {
  const monthPrefix = today.slice(0, 7)
  const yearPrefix = today.slice(0, 4)
  const summary = records.reduce<IncomeSummary>(
    (acc, item) => {
      acc.total += item.amount
      if (item.date === today) acc.day += item.amount
      if (item.date.startsWith(monthPrefix)) acc.month += item.amount
      if (item.date.startsWith(yearPrefix)) acc.year += item.amount
      return acc
    },
    { day: 0, month: 0, year: 0, total: 0 },
  )
  return {
    day: roundMoney(summary.day),
    month: roundMoney(summary.month),
    year: roundMoney(summary.year),
    total: roundMoney(summary.total),
  }
}
