import { defineStore } from 'pinia'
import {
  formatDateStr,
  todayStr,
  startOfWeek,
  endOfWeek,
  isDateInRange,
} from '@/utils/sgxDate'

const STORAGE_PREFIX = 'sgx_'

export type TodoPriority = 'urgent_important' | 'important' | 'urgent' | 'normal'
export type BillType = 'income' | 'expense'

export interface TodoItem {
  id: string
  title: string
  category: string
  priority: TodoPriority
  done: boolean
  createdAt: number
  dueDate: string
  /** 日程时刻 HH:mm，空表示全天 */
  dueTime: string
  /** 自定义背景色，空表示按规则自动分配 */
  color: string
}

export const TODO_CATEGORY_COLOR: Record<string, string> = {
  工作: '#5B7FFF',
  生活: '#10B981',
  学习: '#F59E0B',
}

/** 待办可选/自动分配色板（深色底 + 白字可读） */
export const TODO_EVENT_COLORS = [
  '#2563EB',
  '#059669',
  '#B45309',
  '#7C3AED',
  '#DC2626',
  '#0E7490',
  '#BE185D',
  '#4338CA',
  '#0F766E',
  '#9333EA',
] as const

export function todoSlotKey(t: TodoItem): string {
  return `${todoDueDate(t)}|${(t.dueTime || '').trim()}`
}

function sortTodosInOrder(a: TodoItem, b: TodoItem) {
  return a.createdAt - b.createdAt || a.id.localeCompare(b.id)
}

/** 同一日期内解析展示色：未自定义则同刻不重色，同日尽量不重色 */
export function resolveTodosDisplayColors(scopeTodos: TodoItem[]): Record<string, string> {
  const sorted = [...scopeTodos].sort(sortTodosInOrder)
  const result: Record<string, string> = {}
  const usedInDay = new Set<string>()

  for (const item of sorted) {
    const custom = item.color?.trim()
    if (custom) {
      result[item.id] = custom
      usedInDay.add(custom)
      continue
    }

    const slot = todoSlotKey(item)
    const slotPeers = sorted.filter((t) => todoSlotKey(t) === slot)
    const slotIndex = slotPeers.findIndex((t) => t.id === item.id)
    const usedSlot = new Set<string>()
    for (const t of slotPeers) {
      if (t.id === item.id) break
      const c = result[t.id]
      if (c) usedSlot.add(c)
    }

    let picked = ''
    for (let i = 0; i < TODO_EVENT_COLORS.length; i++) {
      const c = TODO_EVENT_COLORS[(slotIndex + i) % TODO_EVENT_COLORS.length]
      if (!usedSlot.has(c) && !usedInDay.has(c)) {
        picked = c
        break
      }
    }
    if (!picked) {
      for (let i = 0; i < TODO_EVENT_COLORS.length; i++) {
        const c = TODO_EVENT_COLORS[(slotIndex + i) % TODO_EVENT_COLORS.length]
        if (!usedSlot.has(c)) {
          picked = c
          break
        }
      }
    }
    if (!picked) {
      const hue = (slotIndex * 53 + sorted.indexOf(item)) % 360
      picked = `hsl(${hue}, 58%, 38%)`
    }
    result[item.id] = picked
    usedInDay.add(picked)
  }
  return result
}

export function resolveTodoDisplayColor(item: TodoItem, allTodos: TodoItem[]): string {
  const day = todoDueDate(item)
  const dayTodos = allTodos.filter((t) => todoDueDate(t) === day)
  const map = resolveTodosDisplayColors(dayTodos)
  return map[item.id] ?? TODO_EVENT_COLORS[0]
}

export interface GoalStep {
  id: string
  title: string
  done: boolean
}

export interface GoalItem {
  id: string
  title: string
  steps: GoalStep[]
  createdAt: number
}

export interface BillRecord {
  id: string
  type: BillType
  amount: number
  category: string
  note: string
  date: string
}

export interface DiaryEntry {
  id: string
  title: string
  content: string
  mood: string
  date: string
  updatedAt: number
}

export interface CountdownItem {
  id: string
  title: string
  targetDate: string
  icon: string
}

export interface HabitItem {
  id: string
  name: string
  icon: string
  checks: string[]
}

export interface MemoItem {
  id: string
  content: string
  updatedAt: number
}

export interface StatSlice {
  label: string
  value: number
  color: string
}

export const TODO_PRIORITY_LABEL: Record<TodoPriority, string> = {
  urgent_important: '重要且紧急',
  important: '重要不紧急',
  urgent: '紧急不重要',
  normal: '不重要不紧急',
}

export const TODO_CATEGORIES = ['工作', '生活', '学习'] as const
export const BILL_EXPENSE_CATEGORIES = ['餐饮', '交通', '购物', '娱乐', '其他'] as const
export const BILL_INCOME_CATEGORIES = ['工资', '奖金', '兼职', '其他'] as const
export const DIARY_MOODS = ['😊', '😌', '😐', '😢', '😤', '🥳'] as const

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = uni.getStorageSync(STORAGE_PREFIX + key)
    if (raw) {
      const parsed = JSON.parse(raw) as T
      return parsed
    }
  } catch {
    /* ignore */
  }
  return fallback
}

function saveJson(key: string, data: unknown) {
  uni.setStorageSync(STORAGE_PREFIX + key, JSON.stringify(data))
}

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function dueFromCreated(createdAt: number): string {
  return formatDateStr(new Date(createdAt))
}

function migrateTodo(raw: TodoItem): TodoItem {
  const dueDate = raw.dueDate || dueFromCreated(raw.createdAt)
  const dueTime = raw.dueTime ?? ''
  const color = raw.color ?? ''
  return { ...raw, dueDate, dueTime, color }
}

const defaultTodos: TodoItem[] = [
  {
    id: 'demo_1',
    title: '整理本周待办清单',
    category: '工作',
    priority: 'urgent_important',
    done: false,
    createdAt: Date.now() - 86400000,
    dueDate: todayStr(),
    dueTime: '09:00',
    color: '',
  },
  {
    id: 'demo_2',
    title: '阅读 30 分钟',
    category: '学习',
    priority: 'important',
    done: false,
    createdAt: Date.now() - 43200000,
    dueDate: todayStr(),
    dueTime: '20:00',
    color: '',
  },
]

const defaultGoals: GoalItem[] = [
  {
    id: 'g_1',
    title: '学会 Vue3 组合式 API',
    steps: [
      { id: 'gs_1', title: '看完官方文档', done: true },
      { id: 'gs_2', title: '完成小项目练习', done: false },
      { id: 'gs_3', title: '阅读源码片段', done: false },
    ],
    createdAt: Date.now() - 86400000 * 3,
  },
]

const defaultBills: BillRecord[] = [
  {
    id: 'b_1',
    type: 'expense',
    amount: 28.5,
    category: '餐饮',
    note: '午餐',
    date: todayStr(),
  },
  {
    id: 'b_2',
    type: 'income',
    amount: 8000,
    category: '工资',
    note: '月薪',
    date: todayStr(),
  },
]

const defaultDiaries: DiaryEntry[] = [
  {
    id: 'd_1',
    title: '开始记录',
    content: '今天决定用时光序好好规划生活。',
    mood: '😊',
    date: todayStr(),
    updatedAt: Date.now(),
  },
]

const defaultCountdowns: CountdownItem[] = [
  { id: 'cd_1', title: '新年', targetDate: '2027-01-01', icon: '🎆' },
]

const defaultHabits: HabitItem[] = [
  { id: 'h_1', name: '早起', icon: '🌅', checks: [] },
  { id: 'h_2', name: '运动', icon: '🏃', checks: [] },
]

const defaultMemos: MemoItem[] = [
  { id: 'm_1', content: '记录灵感，让生活更有序~', updatedAt: Date.now() },
]

export function todoDueDate(t: TodoItem): string {
  return t.dueDate || dueFromCreated(t.createdAt)
}

export function daysUntil(targetDate: string): number {
  const target = new Date(`${targetDate}T00:00:00`)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / 86400000)
}

export function habitStreak(checks: string[]): number {
  if (!checks.length) return 0
  const sorted = [...new Set(checks)].sort().reverse()
  let streak = 0
  let cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  for (let i = 0; i < 365; i++) {
    const key = formatDateStr(cursor)
    if (sorted.includes(key)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else if (i === 0) {
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export function goalProgress(goal: GoalItem): number {
  if (!goal.steps.length) return 0
  const done = goal.steps.filter((s) => s.done).length
  return Math.round((done / goal.steps.length) * 100)
}

const STAT_COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899']

export const useShiguangxuStore = defineStore('shiguangxu', {
  state: () => ({
    todos: loadJson<TodoItem[]>('todos', defaultTodos).map(migrateTodo),
    goals: loadJson<GoalItem[]>('goals', defaultGoals),
    bills: loadJson<BillRecord[]>('bills', defaultBills),
    diaries: loadJson<DiaryEntry[]>('diaries', defaultDiaries),
    countdowns: loadJson<CountdownItem[]>('countdowns', defaultCountdowns),
    habits: loadJson<HabitItem[]>('habits', defaultHabits),
    memos: loadJson<MemoItem[]>('memos', defaultMemos),
    pomodoroMinutes: 25,
    pomodoroSessionsToday: loadJson<number>('pomodoro_sessions', 0),
  }),

  getters: {
    activeTodos: (s) => s.todos.filter((t) => !t.done),
    doneTodos: (s) => s.todos.filter((t) => t.done),

    todosByPriority(): Record<TodoPriority, TodoItem[]> {
      const map: Record<TodoPriority, TodoItem[]> = {
        urgent_important: [],
        important: [],
        urgent: [],
        normal: [],
      }
      for (const t of this.activeTodos) {
        map[t.priority].push(t)
      }
      return map
    },

    todoCategoryStats(): StatSlice[] {
      const counts: Record<string, number> = {}
      for (const t of this.todos) {
        counts[t.category] = (counts[t.category] || 0) + 1
      }
      return Object.entries(counts).map(([label, value], i) => ({
        label,
        value,
        color: STAT_COLORS[i % STAT_COLORS.length],
      }))
    },

    todoCompletionRate(): number {
      if (!this.todos.length) return 0
      return Math.round((this.doneTodos.length / this.todos.length) * 100)
    },

    monthBillSummary(): { income: number; expense: number } {
      const now = new Date()
      const prefix = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}`
      let income = 0
      let expense = 0
      for (const b of this.bills) {
        if (!b.date.startsWith(prefix)) continue
        if (b.type === 'income') income += b.amount
        else expense += b.amount
      }
      return { income, expense }
    },

    billCategoryStats(): StatSlice[] {
      const counts: Record<string, number> = {}
      for (const b of this.bills.filter((x) => x.type === 'expense')) {
        counts[b.category] = (counts[b.category] || 0) + b.amount
      }
      return Object.entries(counts).map(([label, value], i) => ({
        label,
        value: Math.round(value * 100) / 100,
        color: STAT_COLORS[i % STAT_COLORS.length],
      }))
    },

    habitWeekChecks(): number {
      const start = startOfWeek(todayStr())
      const end = endOfWeek(todayStr())
      let n = 0
      for (const h of this.habits) {
        for (const d of h.checks) {
          if (isDateInRange(d, start, end)) n++
        }
      }
      return n
    },
  },

  actions: {
    persistTodos() {
      saveJson('todos', this.todos)
    },
    persistGoals() {
      saveJson('goals', this.goals)
    },
    persistBills() {
      saveJson('bills', this.bills)
    },
    persistDiaries() {
      saveJson('diaries', this.diaries)
    },
    persistCountdowns() {
      saveJson('countdowns', this.countdowns)
    },
    persistHabits() {
      saveJson('habits', this.habits)
    },
    persistMemos() {
      saveJson('memos', this.memos)
    },
    persistPomodoroSessions() {
      saveJson('pomodoro_sessions', this.pomodoroSessionsToday)
    },

    todosOnDate(dateStr: string): TodoItem[] {
      return this.todos
        .filter((t) => todoDueDate(t) === dateStr)
        .sort((a, b) => {
          if (!a.dueTime && b.dueTime) return -1
          if (a.dueTime && !b.dueTime) return 1
          return (a.dueTime || '').localeCompare(b.dueTime || '')
        })
    },

    todosForMonth(year: number, month: number): TodoItem[] {
      const prefix = `${year}-${`${month}`.padStart(2, '0')}`
      return this.todos.filter((t) => todoDueDate(t).startsWith(prefix))
    },

    todosInRange(start: string, end: string): TodoItem[] {
      return this.todos.filter((t) => isDateInRange(todoDueDate(t), start, end))
    },

    addTodo(
      title: string,
      category: string,
      priority: TodoPriority,
      dueDate?: string,
      dueTime?: string,
      color?: string,
    ) {
      const text = title.trim()
      if (!text) return false
      this.todos.unshift({
        id: uid(),
        title: text,
        category,
        priority,
        done: false,
        createdAt: Date.now(),
        dueDate: dueDate || todayStr(),
        dueTime: dueTime?.trim() || '',
        color: color?.trim() || '',
      })
      this.persistTodos()
      return true
    },

    toggleTodo(id: string) {
      const item = this.todos.find((t) => t.id === id)
      if (!item) return
      item.done = !item.done
      this.persistTodos()
    },

    updateTodo(
      id: string,
      title: string,
      category: string,
      priority: TodoPriority,
      dueDate?: string,
      dueTime?: string,
      color?: string,
    ) {
      const item = this.todos.find((t) => t.id === id)
      if (!item) return false
      const text = title.trim()
      if (!text) return false
      item.title = text
      item.category = category
      item.priority = priority
      item.dueDate = dueDate || item.dueDate
      item.dueTime = dueTime?.trim() ?? item.dueTime
      item.color = color !== undefined ? color.trim() : item.color
      this.persistTodos()
      return true
    },

    removeTodo(id: string) {
      this.todos = this.todos.filter((t) => t.id !== id)
      this.persistTodos()
    },

    addGoal(title: string) {
      const text = title.trim()
      if (!text) return false
      this.goals.unshift({
        id: uid(),
        title: text,
        steps: [],
        createdAt: Date.now(),
      })
      this.persistGoals()
      return true
    },

    addGoalStep(goalId: string, stepTitle: string) {
      const goal = this.goals.find((g) => g.id === goalId)
      const text = stepTitle.trim()
      if (!goal || !text) return false
      goal.steps.push({ id: uid(), title: text, done: false })
      this.persistGoals()
      return true
    },

    toggleGoalStep(goalId: string, stepId: string) {
      const goal = this.goals.find((g) => g.id === goalId)
      const step = goal?.steps.find((s) => s.id === stepId)
      if (!step) return
      step.done = !step.done
      this.persistGoals()
    },

    removeGoal(id: string) {
      this.goals = this.goals.filter((g) => g.id !== id)
      this.persistGoals()
    },

    addBill(type: BillType, amount: number, category: string, note: string, date: string) {
      if (amount <= 0 || !date) return false
      this.bills.unshift({
        id: uid(),
        type,
        amount: Math.round(amount * 100) / 100,
        category,
        note: note.trim(),
        date,
      })
      this.persistBills()
      return true
    },

    removeBill(id: string) {
      this.bills = this.bills.filter((b) => b.id !== id)
      this.persistBills()
    },

    addDiary(title: string, content: string, mood: string, date: string) {
      const t = title.trim()
      const c = content.trim()
      if (!t || !c) return false
      this.diaries.unshift({
        id: uid(),
        title: t,
        content: c,
        mood: mood || '😊',
        date: date || todayStr(),
        updatedAt: Date.now(),
      })
      this.persistDiaries()
      return true
    },

    updateDiary(id: string, title: string, content: string, mood: string) {
      const item = this.diaries.find((d) => d.id === id)
      if (!item) return false
      const t = title.trim()
      const c = content.trim()
      if (!t || !c) return false
      item.title = t
      item.content = c
      item.mood = mood
      item.updatedAt = Date.now()
      this.persistDiaries()
      return true
    },

    removeDiary(id: string) {
      this.diaries = this.diaries.filter((d) => d.id !== id)
      this.persistDiaries()
    },

    addCountdown(title: string, targetDate: string, icon = '📅') {
      const text = title.trim()
      if (!text || !targetDate) return false
      this.countdowns.unshift({ id: uid(), title: text, targetDate, icon })
      this.persistCountdowns()
      return true
    },

    removeCountdown(id: string) {
      this.countdowns = this.countdowns.filter((c) => c.id !== id)
      this.persistCountdowns()
    },

    addHabit(name: string, icon = '⭐') {
      const text = name.trim()
      if (!text) return false
      this.habits.unshift({ id: uid(), name: text, icon, checks: [] })
      this.persistHabits()
      return true
    },

    checkHabitToday(id: string) {
      const habit = this.habits.find((h) => h.id === id)
      if (!habit) return
      const today = todayStr()
      const idx = habit.checks.indexOf(today)
      if (idx >= 0) habit.checks.splice(idx, 1)
      else habit.checks.push(today)
      this.persistHabits()
    },

    isHabitCheckedToday(id: string): boolean {
      const habit = this.habits.find((h) => h.id === id)
      return habit?.checks.includes(todayStr()) ?? false
    },

    removeHabit(id: string) {
      this.habits = this.habits.filter((h) => h.id !== id)
      this.persistHabits()
    },

    addMemo(content: string) {
      const text = content.trim()
      if (!text) return false
      this.memos.unshift({ id: uid(), content: text, updatedAt: Date.now() })
      this.persistMemos()
      return true
    },

    updateMemo(id: string, content: string) {
      const item = this.memos.find((m) => m.id === id)
      if (!item) return false
      const text = content.trim()
      if (!text) return false
      item.content = text
      item.updatedAt = Date.now()
      this.persistMemos()
      return true
    },

    removeMemo(id: string) {
      this.memos = this.memos.filter((m) => m.id !== id)
      this.persistMemos()
    },

    recordPomodoroSession() {
      this.pomodoroSessionsToday += 1
      this.persistPomodoroSessions()
    },

    setPomodoroMinutes(minutes: number) {
      this.pomodoroMinutes = Math.min(60, Math.max(5, minutes))
    },
  },
})
