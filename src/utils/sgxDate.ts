export function formatDateStr(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function todayStr(): string {
  return formatDateStr(new Date())
}

export function parseDate(str: string): Date {
  return new Date(`${str}T00:00:00`)
}

export function addDays(dateStr: string, delta: number): string {
  const d = parseDate(dateStr)
  d.setDate(d.getDate() + delta)
  return formatDateStr(d)
}

export function startOfWeek(dateStr: string): string {
  const d = parseDate(dateStr)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return formatDateStr(d)
}

export function endOfWeek(dateStr: string): string {
  return addDays(startOfWeek(dateStr), 6)
}

export function isDateInRange(dateStr: string, start: string, end: string): boolean {
  return dateStr >= start && dateStr <= end
}

export function monthDays(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function weekDayLabels(): string[] {
  return ['一', '二', '三', '四', '五', '六', '日']
}

export interface MonthGridCell {
  date: string
  day: number
  inCurrentMonth: boolean
  isToday: boolean
}

/** 固定 6 行 × 7 列月历（含上月/下月补位），对齐常见日历 App */
export function buildMonthGrid(year: number, month: number): MonthGridCell[] {
  const today = todayStr()
  const first = new Date(year, month - 1, 1)
  const startPad = (first.getDay() + 6) % 7
  const total = monthDays(year, month)
  const cells: MonthGridCell[] = []

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const prevTotal = monthDays(prevYear, prevMonth)
  for (let i = startPad - 1; i >= 0; i--) {
    const d = prevTotal - i
    const date = `${prevYear}-${`${prevMonth}`.padStart(2, '0')}-${`${d}`.padStart(2, '0')}`
    cells.push({ date, day: d, inCurrentMonth: false, isToday: date === today })
  }

  for (let d = 1; d <= total; d++) {
    const date = `${year}-${`${month}`.padStart(2, '0')}-${`${d}`.padStart(2, '0')}`
    cells.push({ date, day: d, inCurrentMonth: true, isToday: date === today })
  }

  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  let nextDay = 1
  while (cells.length < 42) {
    const date = `${nextYear}-${`${nextMonth}`.padStart(2, '0')}-${`${nextDay}`.padStart(2, '0')}`
    cells.push({ date, day: nextDay, inCurrentMonth: false, isToday: date === today })
    nextDay++
  }

  return cells
}

export const HOUR_SLOTS = Array.from({ length: 24 }, (_, i) => i)

export function parseHour(time?: string): number {
  if (!time) return -1
  const [h] = time.split(':')
  const hour = parseInt(h, 10)
  return Number.isNaN(hour) ? -1 : Math.min(23, Math.max(0, hour))
}

export function formatHourLabel(h: number): string {
  return `${`${h}`.padStart(2, '0')}:00`
}
