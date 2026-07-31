<template>
  <view class="sgx-todo" :class="{ 'sgx-todo--dark': userStore.isDark }">
    <view class="todo-top">
      <PageHeader title="待办事项" tone="soft">
        <template #right>
          <view class="add-pill" @tap="openAdd">
            <text class="add-pill-icon">+</text>
            <text class="add-pill-text">添加</text>
          </view>
        </template>
      </PageHeader>

      <view class="todo-toolbar">
        <scroll-view class="view-tabs-scroll" scroll-x :show-scrollbar="false">
          <view class="view-tabs">
            <view
              v-for="tab in viewTabs"
              :key="tab.id"
              class="view-tab"
              :class="{ 'view-tab--active': activeView === tab.id }"
              @tap="activeView = tab.id"
            >
              <text class="view-tab-text">{{ tab.label }}</text>
            </view>
          </view>
        </scroll-view>

        <view v-if="showCalNav" class="cal-nav">
          <view class="cal-nav-arrow" @tap="onCalNavPrev">
            <text class="cal-nav-arrow-icon">‹</text>
          </view>
          <text class="cal-nav-title">{{ calNavTitle }}</text>
          <view class="cal-nav-arrow" @tap="onCalNavNext">
            <text class="cal-nav-arrow-icon">›</text>
          </view>
          <view class="cal-nav-today" @tap="goToday">
            <text class="cal-nav-today-text">今天</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 列表 -->
    <scroll-view v-if="activeView === 'list'" class="todo-scroll" scroll-y>
      <view v-if="store.activeTodos.length" class="todo-list">
        <view v-for="item in store.activeTodos" :key="item.id" class="todo-row">
          <view class="check-circle" @tap.stop="store.toggleTodo(item.id)" />
          <view class="todo-body" @tap="openEdit(item)">
            <view class="todo-color-dot" :style="{ background: todoColor(item) }" />
            <view class="todo-body-main">
            <text class="todo-title">{{ item.title }}</text>
            <view class="todo-meta">
              <text class="meta-tag">{{ item.category }}</text>
              <text class="meta-date">{{ item.dueDate }}</text>
            </view>
            </view>
          </view>
          <text class="todo-del" @tap.stop="store.removeTodo(item.id)">×</text>
        </view>
      </view>
      <view v-else class="empty-block"><text class="empty-text">暂无待办</text></view>
      <view v-if="store.doneTodos.length" class="done-section">
        <text class="done-label">已完成 {{ store.doneTodos.length }}</text>
        <view v-for="item in store.doneTodos" :key="item.id" class="todo-row todo-row--done">
          <view class="check-circle check-circle--done" @tap.stop="store.toggleTodo(item.id)">
            <text class="check-mark">✓</text>
          </view>
          <view class="todo-body todo-body--done">
            <text class="todo-title todo-title--done">{{ item.title }}</text>
          </view>
        </view>
      </view>
      <view style="height: 120rpx;" />
    </scroll-view>

    <!-- 日视图：时间轴（对齐官方「按日查看日程」） -->
    <view v-else-if="activeView === 'day'" class="cal-panel">
      <scroll-view class="timeline-scroll" scroll-y>
        <view v-if="dayAllDayTodos.length" class="allday-block">
          <text class="allday-label">全天</text>
          <view class="allday-list">
            <view
              v-for="item in dayAllDayTodos"
              :key="item.id"
              class="event-chip"
              :class="{ 'event-chip--done': item.done }"
              :style="{ background: todoColor(item) }"
              @tap="openEdit(item)"
            >
              <text class="event-chip-text" :class="{ 'event-chip-text--done': item.done }">{{ item.title }}</text>
            </view>
          </view>
        </view>
        <view v-for="h in hourSlots" :key="h" class="hour-row">
          <text class="hour-label">{{ formatHourLabel(h) }}</text>
          <view class="hour-content">
            <view
              v-for="item in dayBucket.hourBuckets[h] ?? []"
              :key="item.id"
              class="event-bar"
              :class="{ 'event-bar--done': item.done }"
              :style="{ borderLeftColor: todoColor(item) }"
              @tap="openEdit(item)"
            >
              <text class="event-bar-title" :class="{ 'event-bar-title--done': item.done }">{{ item.title }}</text>
              <text v-if="item.dueTime" class="event-bar-time">{{ item.dueTime }}</text>
            </view>
          </view>
        </view>
        <view v-if="!dayTodos.length" class="empty-block"><text class="empty-text">该日无日程</text></view>
        <view style="height: 80rpx;" />
      </scroll-view>
    </view>

    <!-- 周视图：24 小时 × 7 天（官方描述） -->
    <view v-else-if="activeView === 'week'" class="cal-panel cal-panel--week">
      <scroll-view class="week-h-scroll" scroll-x :show-scrollbar="false">
        <view class="week-board" :style="{ width: weekBoardWidth + 'px' }">
          <view class="week-head-row">
            <view class="week-gutter" />
            <view
              v-for="day in weekDays"
              :key="day.date"
              class="week-head-cell"
              :class="{ 'week-head-cell--today': day.isToday }"
              @tap="goDay(day.date)"
            >
              <text class="week-head-wd">{{ day.weekLabel }}</text>
              <text class="week-head-dn">{{ day.dayNum }}</text>
            </view>
          </view>
          <scroll-view class="week-v-scroll" scroll-y>
            <view class="week-allday-row">
              <text class="week-gutter-text">全天</text>
              <view v-for="day in weekDays" :key="`ad-${day.date}`" class="week-mini-cell">
                <view
                  v-for="item in day.allDay"
                  :key="item.id"
                  class="week-mini-event"
                  :class="{ 'week-mini-event--done': item.done }"
                  :style="{ background: todoColor(item) }"
                  @tap="openEdit(item)"
                >
                  <text class="week-mini-text" :class="{ 'week-mini-text--done': item.done }">{{ item.title }}</text>
                </view>
              </view>
            </view>
            <view v-for="h in hourSlots" :key="`h-${h}`" class="week-hour-row">
              <text class="week-gutter-text">{{ formatHourLabel(h) }}</text>
              <view v-for="day in weekDays" :key="`${day.date}-${h}`" class="week-mini-cell">
                <view
                  v-for="item in day.hourBuckets[h] ?? []"
                  :key="item.id"
                  class="week-mini-event week-mini-event--timed"
                  :class="{ 'week-mini-event--done': item.done }"
                  :style="{ borderLeftColor: todoColor(item) }"
                  @tap="openEdit(item)"
                >
                  <text class="week-mini-text" :class="{ 'week-mini-text--done': item.done }">{{ item.title }}</text>
                </view>
              </view>
            </view>
            <view style="height: 40rpx;" />
          </scroll-view>
        </view>
      </scroll-view>
    </view>

    <!-- 月视图：格内展示事项条，点日期进日视图（官方：展示整月安排，想看哪天点哪天） -->
    <view v-else-if="activeView === 'month'" class="cal-panel cal-panel--month">
      <view class="month-weekdays">
        <text v-for="w in weekLabels" :key="w" class="weekday-cell">{{ w }}</text>
      </view>
      <scroll-view class="month-grid-scroll" scroll-y>
        <view class="month-grid">
          <view
            v-for="cell in monthCells"
            :key="cell.date"
            class="month-cell"
            :class="{
              'month-cell--other': !cell.inCurrentMonth,
              'month-cell--today': cell.isToday,
            }"
            @tap="openMonthDay(cell)"
          >
            <view class="month-day-head">
              <view v-if="cell.isToday" class="month-day-badge">
                <text class="month-day-num month-day-num--in-badge">{{ cell.day }}</text>
              </view>
              <text v-else class="month-day-num">{{ cell.day }}</text>
            </view>
            <view class="month-events">
              <view
                v-for="item in cell.todos"
                :key="item.id"
                class="month-event"
                :class="{ 'month-event--done': item.done }"
                :style="{ background: todoColor(item) }"
                @tap.stop="openEdit(item)"
              >
                <text class="month-event-text" :class="{ 'month-event-text--done': item.done }">{{ item.title }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="month-hint">
        <text class="month-hint-text">点击日期查看当日日程</text>
      </view>
    </view>

    <!-- 四象限 -->
    <scroll-view v-else class="todo-scroll" scroll-y>
      <view v-for="quad in quadrants" :key="quad.priority" class="quad-block">
        <view class="quad-head" :style="{ borderColor: quad.color }">
          <text class="quad-title" :style="{ color: quad.color }">{{ quad.label }}</text>
          <text class="quad-count">{{ store.todosByPriority[quad.priority].length }}</text>
        </view>
        <view v-for="item in store.todosByPriority[quad.priority]" :key="item.id" class="quad-item">
          <view class="check-circle check-circle--sm" @tap.stop="store.toggleTodo(item.id)" />
          <text class="quad-item-title" @tap="openEdit(item)">{{ item.title }}</text>
        </view>
        <view v-if="!store.todosByPriority[quad.priority].length" class="quad-empty">
          <text class="quad-empty-text">暂无</text>
        </view>
      </view>
      <view style="height: 120rpx;" />
    </scroll-view>

    <view v-if="showAdd" class="add-mask" @tap="closeForm">
      <view class="add-panel" @tap.stop>
        <text class="add-title">{{ editingId ? '编辑待办' : '新建待办' }}</text>
        <input v-model="newTitle" class="add-input" placeholder="输入待办内容" placeholder-style="color:#B8BCC8" />
        <picker mode="date" :value="newDueDate" @change="onDueChange">
          <view class="date-picker">
            <text class="date-label">日程日期</text>
            <text class="date-value">{{ newDueDate }}</text>
          </view>
        </picker>
        <picker mode="time" :value="newDueTime || '09:00'" @change="onTimeChange">
          <view class="date-picker">
            <text class="date-label">时刻（可选）</text>
            <text class="date-value">{{ newDueTime || '全天' }}</text>
          </view>
        </picker>
        <text class="add-label">分类</text>
        <view class="chip-row">
          <view
            v-for="cat in categories"
            :key="cat"
            class="chip"
            :class="{ 'chip--active': newCategory === cat }"
            @tap="newCategory = cat"
          >
            <text class="chip-text">{{ cat }}</text>
          </view>
        </view>
        <text class="add-label">背景颜色</text>
        <view class="color-source-row">
          <view
            class="color-source-chip"
            :class="{ 'color-source-chip--active': colorSource === 'default' }"
            @tap="colorSource = 'default'"
          >
            <text class="color-source-chip-text">默认</text>
          </view>
          <view
            class="color-source-chip"
            :class="{ 'color-source-chip--active': colorSource === 'custom' }"
            @tap="colorSource = 'custom'"
          >
            <text class="color-source-chip-text">自定义</text>
          </view>
        </view>
        <view v-if="colorSource === 'default'">
          <view class="color-mode-row">
            <view
              class="color-mode-chip"
              :class="{ 'color-mode-chip--active': defaultColorMode === 'auto' }"
              @tap="defaultColorMode = 'auto'"
            >
              <text class="color-mode-chip-text">自动分配</text>
            </view>
            <view
              class="color-mode-chip"
              :class="{ 'color-mode-chip--active': defaultColorMode === 'manual' }"
              @tap="defaultColorMode = 'manual'"
            >
              <text class="color-mode-chip-text">手动选择</text>
            </view>
          </view>
          <text v-if="defaultColorMode === 'auto'" class="color-hint">
            自动分配颜色，内容一致时保持同色
          </text>
          <view v-else class="color-palette">
            <view
              v-for="color in manualColorOptions"
              :key="color"
              class="color-option"
              :class="{ 'color-option--active': newManualColor === color }"
              :style="{ background: color }"
              @tap="newManualColor = color"
            >
              <text v-if="newManualColor === color" class="color-option-check">✓</text>
            </view>
          </view>
        </view>
        <RgbColorPicker v-else v-model="newCustomColor" />
        <text class="add-label">重要紧急程度</text>
        <view class="chip-row chip-row--wrap">
          <view
            v-for="p in priorityOptions"
            :key="p.value"
            class="chip chip--sm"
            :class="{ 'chip--active': newPriority === p.value }"
            @tap="newPriority = p.value"
          >
            <text class="chip-text">{{ p.label }}</text>
          </view>
        </view>
        <view class="add-actions">
          <view class="add-btn add-btn--ghost" @tap="closeForm"><text>取消</text></view>
          <view class="add-btn add-btn--primary" @tap="submitForm"><text>保存</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import {
  useShiguangxuStore,
  TODO_CATEGORIES,
  TODO_PRIORITY_LABEL,
  TODO_EVENT_COLORS,
  resolveTodoDisplayColor,
  todoDueDate,
  type TodoPriority,
  type TodoItem,
} from '@/store/shiguangxu'
import {
  todayStr,
  addDays,
  startOfWeek,
  endOfWeek,
  weekDayLabels,
  buildMonthGrid,
  HOUR_SLOTS,
  formatHourLabel,
  parseHour,
} from '@/utils/sgxDate'
import PageHeader from '../components/PageHeader.vue'
import RgbColorPicker from '../components/RgbColorPicker.vue'

type TodoColorSource = 'default' | 'custom'
type DefaultColorMode = 'auto' | 'manual'
const WEEK_COL_WIDTH = 88

const userStore = useUserStore()
const store = useShiguangxuStore()
const today = todayStr()
const weekLabels = weekDayLabels()
const hourSlots = HOUR_SLOTS

onShow(() => {
  void store.syncTodosFromCloud()
})

const viewTabs = [
  { id: 'list', label: '列表' },
  { id: 'day', label: '日' },
  { id: 'week', label: '周' },
  { id: 'month', label: '月' },
  { id: 'matrix', label: '四象限' },
] as const

type ViewId = (typeof viewTabs)[number]['id']

const activeView = ref<ViewId>('list')
const selectedDate = ref(today)
const weekStart = ref(startOfWeek(today))
const calYear = ref(new Date().getFullYear())
const calMonth = ref(new Date().getMonth() + 1)

const showAdd = ref(false)
const editingId = ref<string | null>(null)
const newTitle = ref('')
const newCategory = ref<string>(TODO_CATEGORIES[0])
const newPriority = ref<TodoPriority>('important')
const newDueDate = ref(today)
const newDueTime = ref('09:00')
const colorSource = ref<TodoColorSource>('default')
const defaultColorMode = ref<DefaultColorMode>('auto')
const newManualColor = ref<string>(TODO_EVENT_COLORS[0])
const newCustomColor = ref('#8B5CF6')

type DayBucket = {
  todos: TodoItem[]
  allDay: TodoItem[]
  hourBuckets: Record<number, TodoItem[]>
}

const EMPTY_DAY_BUCKET: DayBucket = {
  todos: [],
  allDay: [],
  hourBuckets: {},
}

const todoColor = (item: TodoItem) => resolveTodoDisplayColor(item, store.todos)

function compareTodos(a: TodoItem, b: TodoItem) {
  if (!a.dueTime && b.dueTime) return -1
  if (a.dueTime && !b.dueTime) return 1
  const timeCmp = (a.dueTime || '').localeCompare(b.dueTime || '')
  if (timeCmp !== 0) return timeCmp
  return a.createdAt - b.createdAt || a.id.localeCompare(b.id)
}

function buildTodosByDate(todos: TodoItem[]) {
  const map = new Map<string, DayBucket>()

  for (const todo of todos) {
    const date = todoDueDate(todo)
    let bucket = map.get(date)
    if (!bucket) {
      bucket = { todos: [], allDay: [], hourBuckets: {} }
      map.set(date, bucket)
    }

    bucket.todos.push(todo)
    if (!todo.dueTime) {
      bucket.allDay.push(todo)
      continue
    }

    const hour = parseHour(todo.dueTime)
    if (Number.isNaN(hour)) {
      bucket.allDay.push(todo)
      continue
    }

    const list = bucket.hourBuckets[hour] ?? (bucket.hourBuckets[hour] = [])
    list.push(todo)
  }

  for (const bucket of map.values()) {
    bucket.todos.sort(compareTodos)
    bucket.allDay.sort(compareTodos)
    for (const key of Object.keys(bucket.hourBuckets)) {
      bucket.hourBuckets[Number(key)].sort(compareTodos)
    }
  }

  return map
}

const todosByDate = computed(() => buildTodosByDate(store.todos))
const dayBucket = computed(() => todosByDate.value.get(selectedDate.value) ?? EMPTY_DAY_BUCKET)

const resetForm = (dueDate = today) => {
  editingId.value = null
  newTitle.value = ''
  newCategory.value = TODO_CATEGORIES[0]
  newPriority.value = 'important'
  newDueDate.value = dueDate
  newDueTime.value = '09:00'
  colorSource.value = 'default'
  defaultColorMode.value = 'auto'
  newManualColor.value = TODO_EVENT_COLORS[0]
  newCustomColor.value = '#8B5CF6'
}

const openAdd = () => {
  resetForm(selectedDate.value)
  showAdd.value = true
}

const openEdit = (item: TodoItem) => {
  if (item.done) return
  editingId.value = item.id
  newTitle.value = item.title
  newCategory.value = item.category
  newPriority.value = item.priority
  newDueDate.value = item.dueDate
  newDueTime.value = item.dueTime || ''
  if (item.colorStyle === 'manual') {
    colorSource.value = 'default'
    defaultColorMode.value = 'manual'
    newManualColor.value = item.color || TODO_EVENT_COLORS[0]
  } else if (item.colorStyle === 'custom' || item.color?.trim()) {
    colorSource.value = 'custom'
    newCustomColor.value = item.color || '#8B5CF6'
  } else {
    colorSource.value = 'default'
    defaultColorMode.value = 'auto'
    newManualColor.value = TODO_EVENT_COLORS[0]
    newCustomColor.value = '#8B5CF6'
  }
  showAdd.value = true
}

const closeForm = () => {
  showAdd.value = false
  resetForm()
}

const weekBoardWidth = computed(() => {
  try {
    const sys = uni.getSystemInfoSync()
    return Math.max(sys.windowWidth, 52 + 7 * uni.upx2px(WEEK_COL_WIDTH))
  } catch {
    return 700
  }
})

const categories = TODO_CATEGORIES
const priorityOptions = (Object.keys(TODO_PRIORITY_LABEL) as TodoPriority[]).map((value) => ({
  value,
  label: TODO_PRIORITY_LABEL[value],
}))

const manualColorOptions = computed(() => {
  const options: string[] = [
    '#2563EB',
    '#06B6D4',
    '#14B8A6',
    '#10B981',
    '#84CC16',
    '#F59E0B',
    '#F97316',
    '#EF4444',
    '#DB2777',
    '#8B5CF6',
  ]
  if (defaultColorMode.value === 'manual' && newManualColor.value && !options.includes(newManualColor.value)) {
    options.unshift(newManualColor.value)
  }
  return options
})

const quadrants: { priority: TodoPriority; label: string; color: string }[] = [
  { priority: 'urgent_important', label: '重要且紧急', color: '#EF4444' },
  { priority: 'important', label: '重要不紧急', color: '#8B5CF6' },
  { priority: 'urgent', label: '紧急不重要', color: '#F59E0B' },
  { priority: 'normal', label: '不重要不紧急', color: '#94A3B8' },
]

const dayTodos = computed(() => dayBucket.value.todos)
const dayAllDayTodos = computed(() => dayBucket.value.allDay)
const dayTitle = computed(() => {
  const d = selectedDate.value
  if (d === today) return `今天 · ${d.replace(/-/g, '.')}`
  return d.replace(/-/g, '.')
})

const showCalNav = computed(() => ['day', 'week', 'month'].includes(activeView.value))

const calNavTitle = computed(() => {
  if (activeView.value === 'month') return `${calYear.value}年${calMonth.value}月`
  if (activeView.value === 'week') return weekRangeLabel.value
  return dayTitle.value
})

const onCalNavPrev = () => {
  if (activeView.value === 'month') shiftMonth(-1)
  else if (activeView.value === 'week') shiftWeek(-1)
  else shiftDay(-1)
}

const onCalNavNext = () => {
  if (activeView.value === 'month') shiftMonth(1)
  else if (activeView.value === 'week') shiftWeek(1)
  else shiftDay(1)
}

const weekRangeLabel = computed(() => {
  const end = endOfWeek(weekStart.value)
  return `${weekStart.value.slice(5)} ~ ${end.slice(5)}`
})

const weekDays = computed(() => {
  const wd = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return wd.map((weekLabel, i) => {
    const date = addDays(weekStart.value, i)
    const bucket = todosByDate.value.get(date) ?? EMPTY_DAY_BUCKET
    return {
      weekLabel,
      date,
      dayNum: parseInt(date.slice(8), 10),
      isToday: date === today,
      todos: bucket.todos,
      allDay: bucket.allDay,
      hourBuckets: bucket.hourBuckets,
    }
  })
})

const monthCells = computed(() => {
  const grid = buildMonthGrid(calYear.value, calMonth.value)
  return grid.map((cell) => ({
    ...cell,
    todos: todosByDate.value.get(cell.date)?.todos ?? EMPTY_DAY_BUCKET.todos,
  }))
})

const shiftDay = (delta: number) => {
  selectedDate.value = addDays(selectedDate.value, delta)
}

const shiftWeek = (delta: number) => {
  weekStart.value = addDays(weekStart.value, delta * 7)
}

const shiftMonth = (delta: number) => {
  let m = calMonth.value + delta
  let y = calYear.value
  if (m > 12) {
    m = 1
    y++
  } else if (m < 1) {
    m = 12
    y--
  }
  calMonth.value = m
  calYear.value = y
}

const openMonthDay = (cell: { date: string; inCurrentMonth: boolean }) => {
  selectedDate.value = cell.date
  if (!cell.inCurrentMonth) {
    const [y, m] = cell.date.split('-').map(Number)
    calYear.value = y
    calMonth.value = m
  }
  activeView.value = 'day'
}

const goDay = (date: string) => {
  selectedDate.value = date
  activeView.value = 'day'
}

const goToday = () => {
  selectedDate.value = today
  const now = new Date()
  calYear.value = now.getFullYear()
  calMonth.value = now.getMonth() + 1
  weekStart.value = startOfWeek(today)
}

const onDueChange = (e: { detail: { value: string } }) => {
  newDueDate.value = e.detail.value
}

const onTimeChange = (e: { detail: { value: string } }) => {
  newDueTime.value = e.detail.value
}

const submitForm = () => {
  const time = newDueTime.value === '全天' ? '' : newDueTime.value
  const colorStyle = colorSource.value === 'custom'
    ? 'custom'
    : defaultColorMode.value === 'manual'
      ? 'manual'
      : 'auto'
  const color = colorStyle === 'custom'
    ? newCustomColor.value.trim()
    : colorStyle === 'manual'
      ? newManualColor.value.trim()
      : ''
  const isEdit = !!editingId.value
  const ok = isEdit
    ? store.updateTodo(
        editingId.value!,
        newTitle.value,
        newCategory.value,
        newPriority.value,
        newDueDate.value,
        time,
        color,
        colorStyle,
      )
    : store.addTodo(
        newTitle.value,
        newCategory.value,
        newPriority.value,
        newDueDate.value,
        time,
        color,
        colorStyle,
      )
  if (!ok) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }
  closeForm()
  uni.showToast({ title: isEdit ? '已保存' : '已添加', icon: 'success' })
}
</script>

<style lang="scss" scoped>
.sgx-todo {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f6f7fb;
}

.todo-top {
  flex-shrink: 0;
  background: linear-gradient(180deg, #ede9fe 0%, #f5f3ff 55%, #f6f7fb 100%);
  padding-bottom: 8rpx;
}

.add-pill {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 10rpx 22rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  box-shadow: 0 6rpx 16rpx rgba(139, 92, 246, 0.35);
  flex-shrink: 0;
  margin-left: auto;
}

.add-pill-icon {
  font-size: 28rpx;
  color: #fff;
  font-weight: 700;
  line-height: 1;
}

.add-pill-text {
  font-size: 26rpx;
  color: #fff;
  font-weight: 600;
}

.todo-toolbar {
  margin: 0 24rpx 12rpx;
  padding: 16rpx 16rpx 12rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 28rpx rgba(91, 33, 182, 0.08);
}

.view-tabs-scroll {
  width: 100%;
  white-space: nowrap;
}

.view-tabs {
  display: inline-flex;
  width: 100%;
  padding: 6rpx;
  background: #f3f0ff;
  border-radius: 16rpx;
  box-sizing: border-box;
}

.view-tab {
  flex: 1;
  padding: 14rpx 0;
  border-radius: 12rpx;
  flex-shrink: 0;
  text-align: center;
  min-width: 88rpx;
}

.view-tab--active {
  background: #fff;
  box-shadow: 0 4rpx 12rpx rgba(139, 92, 246, 0.18);
}

.view-tab-text {
  font-size: 26rpx;
  color: #8888aa;
}

.view-tab--active .view-tab-text {
  color: #7c3aed;
  font-weight: 700;
}

.cal-nav {
  display: flex;
  align-items: center;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0ecff;
}

.cal-nav-arrow {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #f5f3ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cal-nav-arrow-icon {
  font-size: 36rpx;
  line-height: 1;
  color: #7c3aed;
  margin-top: -4rpx;
}

.cal-nav-title {
  flex: 1;
  text-align: center;
  font-size: 30rpx;
  font-weight: 700;
  color: #312e81;
  letter-spacing: 0.5rpx;
}

.cal-nav-today {
  margin-left: 8rpx;
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: #ede9fe;
  flex-shrink: 0;
}

.cal-nav-today-text {
  font-size: 24rpx;
  color: #7c3aed;
  font-weight: 600;
}

.todo-scroll {
  flex: 1;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.cal-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.month-weekdays {
  display: flex;
  padding: 12rpx 24rpx 8rpx;
  background: #fff;
  margin: 0 24rpx;
  border-radius: 16rpx 16rpx 0 0;
  box-shadow: 0 4rpx 16rpx rgba(91, 33, 182, 0.05);
}

.weekday-cell {
  flex: 1;
  text-align: center;
  font-size: 22rpx;
  color: #999;
}

/* ─── 日视图时间轴 ─── */
.timeline-scroll {
  flex: 1;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.allday-block {
  display: flex;
  gap: 12rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #eee;
  margin-bottom: 8rpx;
}

.allday-label {
  width: 72rpx;
  font-size: 22rpx;
  color: #999;
  flex-shrink: 0;
}

.allday-list {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.event-chip {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  max-width: 100%;
}

.event-chip-text {
  font-size: 24rpx;
  color: #fff;
}

.event-chip-text--done {
  text-decoration: line-through;
}

.hour-row {
  display: flex;
  min-height: 88rpx;
  border-bottom: 1rpx solid #f0f0f5;
}

.hour-label {
  width: 72rpx;
  font-size: 22rpx;
  color: #bbb;
  padding-top: 8rpx;
  flex-shrink: 0;
}

.hour-content {
  flex: 1;
  padding: 6rpx 0 6rpx 8rpx;
}

.event-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  background: #fff;
  border-left: 6rpx solid #8b5cf6;
  border-radius: 8rpx;
  padding: 12rpx 16rpx;
  margin-bottom: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
}

.event-bar-title--done {
  text-decoration: line-through;
  color: #999;
}

.event-bar-title {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #333;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-bar-time {
  flex-shrink: 0;
  font-size: 22rpx;
  color: #999;
  text-align: right;
}

/* ─── 周视图 24h ─── */
.cal-panel--week {
  min-height: 0;
}

.week-h-scroll {
  flex: 1;
  width: 100%;
}

.week-board {
  min-width: 100%;
}

.week-head-row,
.week-allday-row,
.week-hour-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

.week-gutter {
  width: 52px;
  flex-shrink: 0;
}

.week-gutter-text {
  width: 52px;
  flex-shrink: 0;
  font-size: 20rpx;
  color: #bbb;
  text-align: right;
  padding-right: 8rpx;
  padding-top: 8rpx;
  box-sizing: border-box;
  align-self: flex-start;
}

.week-head-cell {
  width: 88rpx;
  flex-shrink: 0;
  text-align: center;
  padding: 12rpx 4rpx;
  border-bottom: 1rpx solid #eee;
}

.week-head-cell--today {
  background: #ede9fe;
  border-radius: 12rpx 12rpx 0 0;
}

.week-head-wd {
  display: block;
  font-size: 22rpx;
  color: #999;
}

.week-head-dn {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
}

.week-v-scroll {
  max-height: calc(100vh - 320rpx);
}

.week-mini-cell {
  width: 88rpx;
  flex-shrink: 0;
  min-height: 56rpx;
  border-right: 1rpx solid #f5f5f8;
  border-bottom: 1rpx solid #f5f5f8;
  padding: 4rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.week-mini-event {
  border-radius: 6rpx;
  padding: 4rpx 6rpx;
  margin-bottom: 4rpx;
  background: #8b5cf6;
  width: 100%;
  box-sizing: border-box;
}

.week-mini-event--timed {
  background: #fff;
  border-left: 4rpx solid #8b5cf6;
}

.week-mini-text {
  font-size: 18rpx;
  color: #333;
  line-height: 1.4;
  word-break: break-all;
  white-space: normal;
  display: block;
}

.week-mini-event .week-mini-text {
  color: #fff;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.18);
}

.week-mini-event--timed .week-mini-text {
  color: #333;
}

.week-mini-text--done {
  text-decoration: line-through;
}

/* ─── 月视图：格内事项条 ─── */
.cal-panel--month {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.month-grid-scroll {
  flex: 1;
  padding: 0 24rpx 0;
  margin: 0 24rpx;
  background: #fff;
  border-radius: 0 0 20rpx 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(91, 33, 182, 0.06);
  box-sizing: border-box;
  width: calc(100% - 48rpx);
}

.month-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  border-top: 1rpx solid #eee;
  border-left: 1rpx solid #eee;
}

.month-cell {
  width: calc(100% / 7);
  min-height: 140rpx;
  align-self: stretch;
  border-right: 1rpx solid #eee;
  border-bottom: 1rpx solid #eee;
  padding: 8rpx 6rpx 6rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: #fff;
}

.month-day-head {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-height: 44rpx;
  margin-bottom: 10rpx;
  padding-bottom: 2rpx;
}

.month-cell--other {
  background: #fafafa;
}

.month-cell--today {
  background: #faf5ff;
}

.month-day-num {
  font-size: 24rpx;
  color: #333;
  text-align: right;
  padding: 0 4rpx;
  line-height: 1.2;
}

.month-day-badge {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #8b5cf6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;
}

.month-day-num--in-badge {
  color: #fff;
  font-size: 24rpx;
  line-height: 1;
  padding: 0;
  font-weight: 600;
}

.month-events {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  margin-top: 2rpx;
  min-width: 0;
}

.month-event {
  border-radius: 6rpx;
  padding: 4rpx 6rpx;
  box-sizing: border-box;
  width: 100%;
}

.month-event-text {
  font-size: 18rpx;
  color: #fff;
  line-height: 1.4;
  word-break: break-all;
  white-space: normal;
  display: block;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.18);
}

.month-event-text--done {
  text-decoration: line-through;
}

.month-hint {
  padding: 16rpx 24rpx 24rpx;
  text-align: center;
}

.month-hint-text {
  font-size: 22rpx;
  color: #999;
}

.todo-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.todo-row--compact {
  padding: 16rpx 20rpx;
  margin-bottom: 10rpx;
}

.check-circle {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 3rpx solid #c4b5fd;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-circle--sm {
  width: 32rpx;
  height: 32rpx;
}

.check-circle--done {
  background: #8b5cf6;
  border-color: #8b5cf6;
}

.check-mark {
  font-size: 24rpx;
  color: #fff;
  font-weight: 700;
}

.todo-body {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.todo-color-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 12rpx;
}

.todo-body-main {
  flex: 1;
  min-width: 0;
}

.todo-title {
  font-size: 30rpx;
  color: #1a1a2e;
  font-weight: 600;
  flex: 1;
}

.todo-title--sm {
  font-size: 26rpx;
}

.todo-title--done {
  text-decoration: line-through;
  color: #999;
}

.todo-meta {
  display: flex;
  gap: 12rpx;
  margin-top: 8rpx;
}

.meta-tag,
.meta-date {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: #f3f0ff;
  color: #7c3aed;
}

.todo-del {
  font-size: 40rpx;
  color: #ccc;
}

.done-label {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 12rpx;
  display: block;
}

.quad-block {
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.quad-head {
  display: flex;
  justify-content: space-between;
  padding-bottom: 12rpx;
  border-bottom: 4rpx solid;
  margin-bottom: 12rpx;
}

.quad-title {
  font-size: 28rpx;
  font-weight: 700;
}

.quad-count {
  font-size: 24rpx;
  color: #999;
}

.quad-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 0;
}

.quad-item-title {
  font-size: 28rpx;
  color: #333;
}

.empty-block {
  padding: 60rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 24rpx;
  color: #bbb;
}

.add-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.add-panel {
  width: 100%;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx 32rpx calc(32rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  max-height: 85vh;
  overflow-y: auto;
}

.add-title {
  font-size: 34rpx;
  font-weight: 700;
  margin-bottom: 24rpx;
  display: block;
}

.add-input {
  height: 80rpx;
  background: #f5f3ff;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}

.date-picker {
  display: flex;
  justify-content: space-between;
  height: 80rpx;
  background: #f5f3ff;
  border-radius: 16rpx;
  padding: 0 24rpx;
  align-items: center;
  margin-bottom: 20rpx;
}

.date-label {
  font-size: 28rpx;
  color: #666;
}

.date-value {
  font-size: 28rpx;
  color: #7c3aed;
  font-weight: 600;
}

.add-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
  display: block;
}

.color-source-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 14rpx;
}

.color-source-chip {
  display: flex;
  flex: 1;
  height: 72rpx;
  border-radius: 16rpx;
  background: #f3f4f6;
  align-items: center;
  justify-content: center;
  border: 2rpx solid transparent;
  box-sizing: border-box;
}

.color-source-chip--active {
  background: #f5f3ff;
  border-color: #8b5cf6;
}

.color-source-chip-text {
  font-size: 28rpx;
  color: #6b7280;
}

.color-source-chip--active .color-source-chip-text {
  color: #7c3aed;
  font-weight: 600;
}

.color-mode-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.color-mode-chip {
  flex: 1;
  height: 72rpx;
  border-radius: 16rpx;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid transparent;
  box-sizing: border-box;
}

.color-mode-chip--active {
  background: #f5f3ff;
  border-color: #8b5cf6;
}

.color-mode-chip-text {
  font-size: 28rpx;
  color: #6b7280;
}

.color-mode-chip--active .color-mode-chip-text {
  color: #7c3aed;
  font-weight: 600;
}

.color-hint {
  font-size: 22rpx;
  color: #9ca3af;
  line-height: 1.5;
  margin-bottom: 20rpx;
  display: block;
}

.color-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-bottom: 20rpx;
}

.color-option {
  position: relative;
  flex: 0 0 calc((100% - 56rpx) / 5);
  height: 64rpx;
  border-radius: 16rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4rpx 12rpx rgba(31, 41, 55, 0.12);
  box-sizing: border-box;
  overflow: hidden;
}

.color-option--active {
  border-color: #fff;
  box-shadow: 0 0 0 4rpx rgba(139, 92, 246, 0.36), 0 6rpx 16rpx rgba(31, 41, 55, 0.16);
}

.color-option-check {
  position: absolute;
  right: 8rpx;
  bottom: 6rpx;
  width: 26rpx;
  height: 26rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #7c3aed;
  font-size: 18rpx;
  font-weight: 800;
  line-height: 26rpx;
  text-align: center;
}

.chip-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
}

.chip {
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  background: #f0f0f5;
}

.chip--active {
  background: #ede9fe;
}

.chip--active .chip-text {
  color: #7c3aed;
  font-weight: 600;
}

.chip-text {
  font-size: 26rpx;
  color: #666;
}

.add-actions {
  display: flex;
  gap: 20rpx;
}

.add-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
}

.add-btn--ghost {
  background: #f0f0f5;
  color: #666;
}

.add-btn--primary {
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
  color: #fff;
  font-weight: 600;
}

.sgx-todo--dark {
  background: #12112a;

  .todo-top {
    background: linear-gradient(180deg, #1e1b4b 0%, #12112a 100%);
  }

  .todo-toolbar,
  .month-weekdays,
  .month-grid-scroll {
    background: rgba(30, 28, 58, 0.95);
    border: 1rpx solid #2e2c50;
    box-shadow: none;
  }

  .view-tabs {
    background: rgba(20, 18, 40, 0.8);
  }

  .view-tab--active {
    background: rgba(50, 46, 90, 0.95);
  }

  .view-tab--active .view-tab-text {
    color: #c4b5fd;
  }

  .cal-nav-title {
    color: #e0deff;
  }

  .cal-nav-arrow {
    background: rgba(40, 36, 72, 0.9);
  }

  .todo-row,
  .quad-block,
  .add-panel {
    background: rgba(30, 28, 58, 0.95);
    border: 1rpx solid #2e2c50;
  }

  .todo-title {
    color: #e0deff;
  }
}
</style>
