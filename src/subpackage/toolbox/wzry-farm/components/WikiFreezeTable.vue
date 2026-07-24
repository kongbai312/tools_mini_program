<template>
  <view
    class="freeze-table"
    :class="{ 'freeze-table--header-locked': headerLocked }"
    :style="{ '--table-body-height-adjust': `${bodyHeightAdjust}rpx` }"
  >
    <view class="freeze-toolbar">
      <view
        class="tool-btn"
        :class="{ 'tool-btn--active': headerLocked }"
        @tap="headerLocked = !headerLocked"
      >
        <text>表头锁定</text>
      </view>
      <view
        class="tool-btn"
        :class="{ 'tool-btn--active': lockCols }"
        @tap="lockCols = !lockCols"
      >
        <text>锁定前列</text>
      </view>
    </view>

    <view class="freeze-wrap">
      <scroll-view
        v-if="headerLocked"
        class="table-x-scroll table-head-scroll"
        scroll-x
        :scroll-left="scrollLeft"
        :enable-flex="true"
        :show-scrollbar="false"
      >
        <view class="table-inner" :style="{ width: `${tableWidth}rpx` }">
          <view
            class="tr tr--head"
            :class="`tr--head-${theme}`"
          >
            <view
              v-for="(col, ci) in columns"
              :key="`lh-${col.key}`"
              class="td td--head"
              :class="frozenClass(ci, true)"
              :style="tdStyle(col, ci)"
            >
              <text class="td-text td-text--head">{{ col.label }}</text>
            </view>
          </view>
        </view>
      </scroll-view>

      <scroll-view
        v-if="headerLocked"
        class="table-body-scroll"
        scroll-y
        :enable-flex="true"
        :show-scrollbar="false"
      >
        <scroll-view
          class="table-x-scroll"
          scroll-x
          :enable-flex="true"
          :show-scrollbar="false"
          @scroll="handleXScroll"
        >
          <view class="table-inner" :style="{ width: `${tableWidth}rpx` }">
            <view
              v-for="(row, ri) in rows"
              :key="rowKey(row, ri)"
              class="tr"
              :class="[{ 'tr--even': ri % 2 === 1 }, rowClass(row)]"
            >
              <view
                v-for="(col, ci) in columns"
                :key="`${rowKey(row, ri)}-${col.key}`"
                class="td td--body"
                :class="[frozenClass(ci, false), bodyCellClass(col, row)]"
                :style="tdStyle(col, ci)"
              >
                <text class="td-text">{{ cellText(col, row) }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </scroll-view>

      <scroll-view
        v-else
        class="table-x-scroll table-page-scroll"
        scroll-x
        :enable-flex="true"
        :show-scrollbar="false"
      >
        <view class="table-inner" :style="{ width: `${tableWidth}rpx` }">
          <view
            class="tr tr--head"
            :class="`tr--head-${theme}`"
          >
            <view
              v-for="(col, ci) in columns"
              :key="`uh-${col.key}`"
              class="td td--head"
              :class="frozenClass(ci, true)"
              :style="tdStyle(col, ci)"
            >
              <text class="td-text td-text--head">{{ col.label }}</text>
            </view>
          </view>

          <view
            v-for="(row, ri) in rows"
            :key="rowKey(row, ri)"
            class="tr"
            :class="[{ 'tr--even': ri % 2 === 1 }, rowClass(row)]"
          >
            <view
              v-for="(col, ci) in columns"
              :key="`${rowKey(row, ri)}-${col.key}`"
              class="td td--body"
              :class="[frozenClass(ci, false), bodyCellClass(col, row)]"
              :style="tdStyle(col, ci)"
            >
              <text class="td-text">{{ cellText(col, row) }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface WikiTableColumn {
  key: string
  label: string
  width: number
  align?: 'left' | 'center' | 'right'
  format?: (row: Record<string, unknown>) => string | number
  cellClass?: (row: Record<string, unknown>) => string
  rowClass?: (row: Record<string, unknown>) => string
}

const props = withDefaults(
  defineProps<{
    columns: WikiTableColumn[]
    rows: Record<string, unknown>[]
    rowKeyField?: string
    freezeColCount?: number
    theme?: 'green' | 'purple'
    lockHeader?: boolean
    bodyHeightAdjust?: number
  }>(),
  {
    rowKeyField: 'id',
    freezeColCount: 2,
    theme: 'green',
    lockHeader: true,
    bodyHeightAdjust: 0,
  },
)

const emit = defineEmits<{
  (e: 'update:lockHeader', value: boolean): void
}>()

const headerLocked = computed({
  get: () => props.lockHeader,
  set: (value: boolean) => emit('update:lockHeader', value),
})
const bodyHeightAdjust = computed(() => props.bodyHeightAdjust)
const lockCols = ref(true)
const scrollLeft = ref(0)

const tableWidth = computed(() =>
  props.columns.reduce((sum, c) => sum + c.width, 0),
)

const frozenLeftMap = computed(() => {
  const map: Record<number, number> = {}
  let left = 0
  props.columns.forEach((col, i) => {
    if (i < props.freezeColCount) {
      map[i] = left
      left += col.width
    }
  })
  return map
})

function tdStyle(col: WikiTableColumn, colIndex: number) {
  const style: Record<string, string> = {
    width: `${col.width}rpx`,
    minWidth: `${col.width}rpx`,
    maxWidth: `${col.width}rpx`,
  }
  if (lockCols.value && colIndex < props.freezeColCount) {
    style.left = `${frozenLeftMap.value[colIndex] ?? 0}rpx`
  }
  return style
}

function frozenClass(colIndex: number, isHead: boolean) {
  if (!lockCols.value || colIndex >= props.freezeColCount) return ''
  return isHead ? 'td--frozen td--frozen-head' : 'td--frozen'
}

function handleXScroll(e: { detail?: { scrollLeft?: number } }) {
  scrollLeft.value = e.detail?.scrollLeft ?? 0
}

function bodyCellClass(col: WikiTableColumn, row: Record<string, unknown>) {
  const parts: string[] = []
  if (col.align === 'left') parts.push('td--left')
  const extra = col.cellClass?.(row)
  if (extra) parts.push(extra)
  return parts.join(' ')
}

function cellText(col: WikiTableColumn, row: Record<string, unknown>) {
  if (col.format) return String(col.format(row))
  const v = row[col.key]
  if (v === null || v === undefined) return '—'
  return String(v)
}

function rowKey(row: Record<string, unknown>, index: number) {
  const k = row[props.rowKeyField]
  return k != null ? String(k) : `row-${index}`
}

function rowClass(row: Record<string, unknown>) {
  const firstColumn = props.columns[0]
  return firstColumn?.rowClass?.(row) ?? ''
}
</script>

<style lang="scss" scoped>
.freeze-table {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.freeze-table--header-locked {
  flex: 1;
  min-height: 0;
}

.freeze-toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 12rpx;
  margin-bottom: 12rpx;
  flex-shrink: 0;
}

.tool-btn {
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: #f3f4f6;
  font-size: 22rpx;
  color: #6b7280;
}

.tool-btn--active {
  background: #d1fae5;
  color: #059669;
  font-weight: 600;
}

.freeze-wrap {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);
}

.freeze-table--header-locked .freeze-wrap {
  flex: 1;
  min-height: 0;
}

.table-x-scroll {
  width: 100%;
  white-space: nowrap;
}

.table-head-scroll {
  flex-shrink: 0;
}

.table-inner {
  display: block;
}

.table-body-scroll {
  height: calc(100vh - 560rpx - env(safe-area-inset-bottom) - var(--table-body-height-adjust, 0rpx));
  min-height: 360rpx;
}

.tr {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  background: #fff;
}

.tr--even {
  background: #fafafa;
}

.tr--tier2 {
  background: #ecfdf5 !important;
}

.tr--head-green {
  background: #059669;
}

.tr--head-purple {
  background: #7c3aed;
}

.td {
  flex-shrink: 0;
  box-sizing: border-box;
  padding: 16rpx 8rpx;
  min-height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: inherit;
}

.td--head {
  min-height: 64rpx;
}

.td--frozen {
  position: sticky;
  z-index: 4;
  background: #fff;
}

.tr--even .td--frozen {
  background: #fafafa;
}

.tr--tier2 .td--frozen {
  background: #ecfdf5;
}

.td--frozen-head {
  z-index: 11;
  background: #059669;
}

.tr--head-purple .td--frozen-head {
  background: #7c3aed;
}

.td-text {
  font-size: 22rpx;
  color: #374151;
  line-height: 1.35;
  word-break: break-all;
}

.td-text--head {
  color: #fff;
  font-weight: 600;
  font-size: 20rpx;
}

.td--left {
  justify-content: flex-start;
  padding-left: 12rpx;
}

.td--left .td-text {
  text-align: left;
}

.cell--gold,
.td--gold .td-text {
  color: #d97706;
  font-weight: 600;
}

.cell--accent,
.td--accent .td-text {
  color: #059669;
  font-weight: 600;
}

.rarity--gold .td-text {
  color: #d97706;
  font-weight: 600;
}

.rarity--blue .td-text {
  color: #2563eb;
  font-weight: 600;
}

.rarity--pink .td-text {
  color: #db2777;
  font-weight: 600;
}
</style>
