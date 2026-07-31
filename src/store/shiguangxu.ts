import { defineStore } from 'pinia'
import {
  formatDateStr,
  todayStr,
  startOfWeek,
  endOfWeek,
  isDateInRange,
} from '@/utils/sgxDate'
import {
  fetchSgxTodoCloudSnapshot,
  saveSgxTodoCloudSnapshot,
} from '@/services/sgxTodoCloud'

const STORAGE_PREFIX = 'sgx_'
const TODO_CLOUD_UPDATED_AT_KEY = 'todos_cloud_updated_at'
const TODO_CLOUD_AUTOSAVE_DELAY = 800

// 待办云同步使用防抖保存，避免用户连续编辑时频繁写云数据库。
let todoCloudAutosaveTimer: ReturnType<typeof setTimeout> | null = null

export type TodoPriority = 'urgent_important' | 'important' | 'urgent' | 'normal'
export type TodoColorStyle = 'auto' | 'manual' | 'custom'
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
  /** 背景色来源：自动分配 / 预置色 / 自定义 */
  colorStyle: TodoColorStyle
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

function normalizeTodoColorKey(title: string): string {
  return title.trim().replace(/\s+/g, ' ').toLowerCase()
}

function hashTodoColorKey(key: string): number {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  }
  return hash
}

function pickTodoDefaultColor(title: string): string {
  const key = normalizeTodoColorKey(title)
  if (!key) return TODO_EVENT_COLORS[0]
  return TODO_EVENT_COLORS[hashTodoColorKey(key) % TODO_EVENT_COLORS.length]
}

function isTodoColorStyle(value: unknown): value is TodoColorStyle {
  return value === 'auto' || value === 'manual' || value === 'custom'
}

/** 解析展示色：自定义色优先；默认色按待办内容稳定生成，同内容保持同色 */
export function resolveTodosDisplayColors(scopeTodos: TodoItem[]): Record<string, string> {
  const result: Record<string, string> = {}

  for (const item of scopeTodos) {
    const custom = item.color?.trim()
    result[item.id] = custom || pickTodoDefaultColor(item.title)
  }
  return result
}

export function resolveTodoDisplayColor(item: TodoItem, _allTodos: TodoItem[]): string {
  const map = resolveTodosDisplayColors([item])
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
  /** 目标主题色，用于卡片与进度条区分 */
  color: string
  createdAt: number
}

/** 目标选色板（与待办色板一致，便于区分不同目标） */
export const GOAL_COLORS = [...TODO_EVENT_COLORS] as const

/** 为新建目标自动分配尚未使用的颜色 */
export function pickNextGoalColor(existing: GoalItem[]): string {
  const used = new Set(existing.map((g) => g.color?.trim().toUpperCase()).filter(Boolean))
  for (const c of GOAL_COLORS) {
    if (!used.has(c.toUpperCase())) return c
  }
  return GOAL_COLORS[existing.length % GOAL_COLORS.length]
}

export interface HabitItem {
  id: string
  name: string
  icon: string
  checks: string[]
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

function hasJson(key: string): boolean {
  try {
    return !!uni.getStorageSync(STORAGE_PREFIX + key)
  } catch {
    return false
  }
}

// 统一封装时光序本地缓存写入，所有 key 都加 sgx_ 前缀。
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
  const rawColorStyle = (raw as Partial<TodoItem>).colorStyle
  const colorStyle = isTodoColorStyle(rawColorStyle)
    ? rawColorStyle
    : color
      ? 'custom'
      : 'auto'
  return { ...raw, dueDate, dueTime, color, colorStyle }
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
    colorStyle: 'auto',
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
    colorStyle: 'auto',
  },
]

function migrateGoal(raw: GoalItem, index: number): GoalItem {
  const color = raw.color?.trim() || GOAL_COLORS[index % GOAL_COLORS.length]
  return { ...raw, color }
}

const defaultGoals: GoalItem[] = [
  {
    id: 'g_1',
    title: '学会 Vue3 组合式 API',
    color: '#8B5CF6',
    steps: [
      { id: 'gs_1', title: '看完官方文档', done: true },
      { id: 'gs_2', title: '完成小项目练习', done: false },
      { id: 'gs_3', title: '阅读源码片段', done: false },
    ],
    createdAt: Date.now() - 86400000 * 3,
  },
]

const defaultHabits: HabitItem[] = [
  { id: 'h_1', name: '早起', icon: '🌅', checks: [] },
  { id: 'h_2', name: '运动', icon: '🏃', checks: [] },
]

export function todoDueDate(t: TodoItem): string {
  return t.dueDate || dueFromCreated(t.createdAt)
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
    // 待办 / 目标 / 习惯默认走本地缓存，待办额外支持云同步。
    todos: loadJson<TodoItem[]>('todos', defaultTodos).map(migrateTodo),
    todoCloudUpdatedAt: loadJson<number>(
      TODO_CLOUD_UPDATED_AT_KEY,
      hasJson('todos') ? 1 : 0,
    ),
    todoCloudLoading: false,
    todoCloudSaving: false,
    todoCloudPendingSave: false,
    todoCloudPulling: false,
    goals: loadJson<GoalItem[]>('goals', defaultGoals).map(migrateGoal),
    habits: loadJson<HabitItem[]>('habits', defaultHabits),
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
      // 待办修改后先落本地，再安排一次云端防抖同步。
      const updatedAt = Date.now()
      saveJson('todos', this.todos)
      saveJson(TODO_CLOUD_UPDATED_AT_KEY, updatedAt)
      this.todoCloudUpdatedAt = updatedAt
      this.scheduleTodosCloudSync()
    },
    persistGoals() {
      saveJson('goals', this.goals)
    },
    persistHabits() {
      saveJson('habits', this.habits)
    },
    persistPomodoroSessions() {
      saveJson('pomodoro_sessions', this.pomodoroSessionsToday)
    },

    applyTodosFromCloud(todos: TodoItem[], updatedAt: number) {
      // 云端数据较新时覆盖本地，并同步本地更新时间。
      this.todos = todos.map(migrateTodo)
      this.todoCloudUpdatedAt = updatedAt
      saveJson('todos', this.todos)
      saveJson(TODO_CLOUD_UPDATED_AT_KEY, updatedAt)
    },

    async syncTodosFromCloud() {
      // 拉取云端快照后按 updatedAt 决定覆盖本地或反向上传。
      if (this.todoCloudLoading || this.todoCloudPulling) return
      this.todoCloudLoading = true
      try {
        const cloud = await fetchSgxTodoCloudSnapshot()
        if (!cloud) {
          if (this.todoCloudUpdatedAt > 0) {
            await this.syncTodosToCloud()
          }
          return
        }

        if (cloud.updatedAt > this.todoCloudUpdatedAt) {
          this.applyTodosFromCloud(cloud.todos, cloud.updatedAt)
          return
        }

        if (this.todoCloudUpdatedAt > cloud.updatedAt) {
          await this.syncTodosToCloud()
        }
      } finally {
        this.todoCloudLoading = false
      }
    },

    async syncTodosToCloud(): Promise<boolean> {
      // 如果正在保存，标记 pending，当前保存结束后再补一次。
      if (this.todoCloudUpdatedAt <= 0) return false
      if (this.todoCloudSaving) {
        this.todoCloudPendingSave = true
        return false
      }
      this.todoCloudSaving = true
      let ok = false
      try {
        ok = await saveSgxTodoCloudSnapshot(this.todos, this.todoCloudUpdatedAt)
      } finally {
        this.todoCloudSaving = false
        if (this.todoCloudPendingSave) {
          this.todoCloudPendingSave = false
          void this.syncTodosToCloud()
        }
      }
      return ok
    },

    scheduleTodosCloudSync() {
      if (todoCloudAutosaveTimer) {
        clearTimeout(todoCloudAutosaveTimer)
      }
      todoCloudAutosaveTimer = setTimeout(() => {
        todoCloudAutosaveTimer = null
        void this.syncTodosToCloud()
      }, TODO_CLOUD_AUTOSAVE_DELAY)
    },

    async uploadTodosToCloud(): Promise<boolean> {
      if (todoCloudAutosaveTimer) {
        clearTimeout(todoCloudAutosaveTimer)
        todoCloudAutosaveTimer = null
      }
      const updatedAt = Date.now()
      this.todoCloudUpdatedAt = updatedAt
      saveJson('todos', this.todos)
      saveJson(TODO_CLOUD_UPDATED_AT_KEY, updatedAt)
      return this.syncTodosToCloud()
    },

    async pullTodosFromCloud(): Promise<boolean> {
      if (this.todoCloudPulling) return false
      if (todoCloudAutosaveTimer) {
        clearTimeout(todoCloudAutosaveTimer)
        todoCloudAutosaveTimer = null
      }
      this.todoCloudPulling = true
      try {
        const cloud = await fetchSgxTodoCloudSnapshot()
        if (!cloud) return false
        this.applyTodosFromCloud(cloud.todos, cloud.updatedAt)
        return true
      } finally {
        this.todoCloudPulling = false
      }
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
      colorStyle: TodoColorStyle = 'auto',
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
        colorStyle,
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
      colorStyle?: TodoColorStyle,
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
      item.colorStyle = colorStyle ?? item.colorStyle
      this.persistTodos()
      return true
    },

    removeTodo(id: string) {
      this.todos = this.todos.filter((t) => t.id !== id)
      this.persistTodos()
    },

    addGoal(title: string, color: string, stepTitles: string[] = []) {
      const text = title.trim()
      if (!text) return false
      const theme = color.trim() || pickNextGoalColor(this.goals)
      const steps = stepTitles
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => ({ id: uid(), title: t, done: false }))
      this.goals.unshift({
        id: uid(),
        title: text,
        color: theme,
        steps,
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

    recordPomodoroSession() {
      this.pomodoroSessionsToday += 1
      this.persistPomodoroSessions()
    },

    setPomodoroMinutes(minutes: number) {
      this.pomodoroMinutes = Math.min(60, Math.max(5, minutes))
    },
  },
})
