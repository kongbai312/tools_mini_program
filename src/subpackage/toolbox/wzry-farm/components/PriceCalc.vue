<template>
  <view class="price-calc">
    <view class="card">
      <text class="card-title">收益估算</text>
      <text class="card-desc">最终收益 ≈ 等级单价 × 地块产量 × 小摊加成 × 周末双倍</text>

      <view class="field-row">
        <text class="field-label">作物单价</text>
        <view class="level-badge">
          <text>{{ cropLevel >= 10 ? '满级' : `${cropLevel}级` }}</text>
        </view>
      </view>
      <text class="unit-display">单价 {{ unitPrice }} 农场币/个，单块产量 {{ cropYield }}</text>
      <text v-if="crop && !crop.priceVerified" class="unit-warn">该作物单价为社区估算，建议以游戏内为准</text>

      <view class="control-list">
        <view class="number-row">
          <view class="number-copy">
            <text class="field-label">地块数量</text>
            <text class="field-tip">最多 24 块</text>
          </view>
          <view class="stepper">
            <view class="stepper-btn" @tap="changePlotCount(-1)"><text>-</text></view>
            <input
              v-model="plotCountStr"
              class="stepper-input"
              type="number"
              @blur="syncPlotCount"
            />
            <view class="stepper-btn" @tap="changePlotCount(1)"><text>+</text></view>
          </view>
        </view>

        <view class="number-row">
          <view class="number-copy">
            <text class="field-label">作物等级</text>
            <text class="field-tip">{{ cropLevelBonusText }}</text>
          </view>
          <view class="stepper">
            <view class="stepper-btn" @tap="changeCropLevel(-1)"><text>-</text></view>
            <input
              v-model="cropLevelStr"
              class="stepper-input"
              type="number"
              @blur="syncCropLevel"
            />
            <view class="stepper-btn" @tap="changeCropLevel(1)"><text>+</text></view>
          </view>
        </view>

        <view class="number-row">
          <view class="number-copy">
            <text class="field-label">二级地数量</text>
            <text class="field-tip">二级地产量 +50%</text>
          </view>
          <view class="stepper">
            <view class="stepper-btn" @tap="changeSecondLevelPlotCount(-1)"><text>-</text></view>
            <input
              v-model="secondLevelPlotCountStr"
              class="stepper-input"
              type="number"
              @blur="syncSecondLevelPlotCount"
            />
            <view class="stepper-btn" @tap="changeSecondLevelPlotCount(1)"><text>+</text></view>
          </view>
        </view>
      </view>

      <view class="stall-card">
        <view class="field-row field-row--tight">
          <view>
            <text class="field-label">小摊加成</text>
            <text class="field-tip field-tip--block">{{ stallRateText }}</text>
          </view>
          <view class="price-toggle">
            <view
              class="price-toggle-item"
              :class="{ 'price-toggle-item--active': stallInputMode === 'level' }"
              @tap="setStallInputMode('level')"
            >
              <text>等级</text>
            </view>
            <view
              class="price-toggle-item"
              :class="{ 'price-toggle-item--active': stallInputMode === 'percent' }"
              @tap="setStallInputMode('percent')"
            >
              <text>加成%</text>
            </view>
          </view>
        </view>
        <input
          v-model="stallInputStr"
          class="stall-input"
          type="digit"
          :placeholder="stallInputPlaceholder"
          @blur="syncStallInput"
        />
      </view>

      <view class="formula-box">
        <text class="formula-text">
          总产量 {{ totalYieldText }} = 单块产量 {{ cropYield }} × 产量份数 {{ yieldUnitsText }}
        </text>
        <text class="formula-text">
          产量份数 {{ yieldUnitsText }} = 二级地 {{ secondLevelPlotCount }} × 150% + 一级地 {{ firstLevelPlotCount }}
        </text>
      </view>

      <view class="switch-row">
        <text class="switch-label">周末双倍（周五18:00-周日24:00）</text>
        <switch :checked="weekendDouble" color="#8b5cf6" @change="onWeekendSwitch" />
      </view>
    </view>

    <view class="card card--result">
      <text class="result-label">预计总收益</text>
      <text class="result-value">{{ formatPrice(totalPrice) }}</text>
      <text class="result-unit">农场币</text>
    </view>

    <view class="disclaimer">
      <text class="disclaimer-text">数据来源于社区攻略整理，仅供参考，以游戏内实际数值为准。小摊等级按资料表自动换算为售卖加成。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CROP_BY_ID } from '../data/crops'
import {
  cropLevelBonusRate,
  cropLevelUnitPrice,
  estimatePrice,
  stallBonusRateFromLevel,
  stallBonusRateFromPercent,
  stallLevelFromBonusPercent,
} from '../utils/farmCalc'

const props = defineProps<{
  cropId: string
}>()

type StallInputMode = 'level' | 'percent'

const MAX_PLOT_COUNT = 24
const MAX_CROP_LEVEL = 10
const MAX_STALL_LEVEL = 40

const plotCountStr = ref('24')
const cropLevelStr = ref('10')
const secondLevelPlotCountStr = ref('0')
const stallInputMode = ref<StallInputMode>('level')
const stallInputStr = ref('36')
const weekendDouble = ref(false)

const crop = computed(() => CROP_BY_ID[props.cropId])

const unitPrice = computed(() => {
  const c = crop.value
  if (!c) return 0
  return cropLevelUnitPrice(c.basePrice, cropLevel.value)
})
const cropYield = computed(() => crop.value?.yield ?? 1)

const plotCount = computed(() => clampInteger(plotCountStr.value, 1, MAX_PLOT_COUNT))
const cropLevel = computed(() => clampInteger(cropLevelStr.value, 1, MAX_CROP_LEVEL))
const secondLevelPlotCount = computed(() =>
  clampInteger(secondLevelPlotCountStr.value, 0, plotCount.value),
)
const firstLevelPlotCount = computed(() => plotCount.value - secondLevelPlotCount.value)
const yieldUnits = computed(() => firstLevelPlotCount.value + secondLevelPlotCount.value * 1.5)
const totalYield = computed(() => cropYield.value * yieldUnits.value)
const stallRate = computed(() => {
  const rawValue = Number(stallInputStr.value)
  if (!Number.isFinite(rawValue)) {
    return stallInputMode.value === 'level'
      ? stallBonusRateFromLevel(1)
      : stallBonusRateFromPercent(0)
  }
  return stallInputMode.value === 'level'
    ? stallBonusRateFromLevel(rawValue)
    : stallBonusRateFromPercent(rawValue)
})

const cropLevelBonusText = computed(() => {
  const bonus = Math.round((cropLevelBonusRate(cropLevel.value) - 1) * 100)
  return `加成 ${bonus}%`
})

const stallRateText = computed(() => `当前倍率 ${formatMultiplier(stallRate.value)}`)
const stallInputPlaceholder = computed(() =>
  stallInputMode.value === 'level' ? '输入小摊等级，如 36' : '输入加成百分比，如 175',
)
const yieldUnitsText = computed(() => formatNumber(yieldUnits.value))
const totalYieldText = computed(() => formatNumber(totalYield.value))

const totalPrice = computed(() =>
  estimatePrice({
    unitPrice: unitPrice.value,
    yieldPerPlot: cropYield.value,
    plotCount: plotCount.value,
    secondLevelPlotCount: secondLevelPlotCount.value,
    stallRate: stallRate.value,
    weekendDouble: weekendDouble.value,
  }),
)

function clampInteger(value: string | number, min: number, max: number) {
  const n = typeof value === 'number' ? value : parseInt(value, 10)
  if (!Number.isFinite(n)) return min
  return Math.max(min, Math.min(max, Math.round(n)))
}

function clampNumber(value: string | number, min: number, max: number) {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return min
  return Math.max(min, Math.min(max, n))
}

function formatPrice(n: number) {
  return `${n}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function formatNumber(n: number) {
  return Number.isInteger(n) ? `${n}` : n.toFixed(1)
}

function formatMultiplier(n: number) {
  return `${formatNumber(n)}x`
}

function changePlotCount(delta: number) {
  plotCountStr.value = `${clampInteger(plotCount.value + delta, 1, MAX_PLOT_COUNT)}`
  syncSecondLevelPlotCount()
}

function syncPlotCount() {
  plotCountStr.value = `${plotCount.value}`
  syncSecondLevelPlotCount()
}

function changeCropLevel(delta: number) {
  cropLevelStr.value = `${clampInteger(cropLevel.value + delta, 1, MAX_CROP_LEVEL)}`
}

function syncCropLevel() {
  cropLevelStr.value = `${cropLevel.value}`
}

function changeSecondLevelPlotCount(delta: number) {
  secondLevelPlotCountStr.value = `${clampInteger(
    secondLevelPlotCount.value + delta,
    0,
    plotCount.value,
  )}`
}

function syncSecondLevelPlotCount() {
  secondLevelPlotCountStr.value = `${secondLevelPlotCount.value}`
}

function setStallInputMode(mode: StallInputMode) {
  if (stallInputMode.value === mode) return
  if (mode === 'percent') {
    stallInputStr.value = `${Math.round((stallRate.value - 1) * 100)}`
  } else {
    stallInputStr.value = `${stallLevelFromBonusPercent(Number(stallInputStr.value))}`
  }
  stallInputMode.value = mode
}

function syncStallInput() {
  if (stallInputMode.value === 'level') {
    stallInputStr.value = `${clampInteger(stallInputStr.value, 1, MAX_STALL_LEVEL)}`
  } else {
    stallInputStr.value = `${clampNumber(stallInputStr.value, 0, 999)}`
  }
}

const onWeekendSwitch = (e: Event) => {
  weekendDouble.value = (e as unknown as { detail: { value: boolean } }).detail.value
}

watch(
  () => props.cropId,
  () => {
    cropLevelStr.value = '10'
  },
)
</script>

<style lang="scss" scoped>
.price-calc {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(91, 33, 182, 0.08);
}

.card--result {
  text-align: center;
  background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%);
  border: 1rpx solid rgba(245, 158, 11, 0.2);
}

.card-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 8rpx;
}

.card-desc {
  display: block;
  font-size: 22rpx;
  color: #9ca3af;
  line-height: 1.5;
  margin-bottom: 24rpx;
}

.field-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  gap: 16rpx;
}

.field-row--tight {
  margin-bottom: 12rpx;
}

.field-label {
  display: block;
  font-size: 28rpx;
  color: #374151;
}

.field-tip {
  display: block;
  font-size: 22rpx;
  color: #9ca3af;
  margin-top: 6rpx;
}

.field-tip--block {
  display: block;
}

.price-toggle {
  display: flex;
  flex-shrink: 0;
  gap: 8rpx;
}

.price-toggle-item {
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  background: #f3f4f6;
  font-size: 24rpx;
  color: #6b7280;
}

.price-toggle-item--active {
  background: #ede9fe;
  color: #7c3aed;
  font-weight: 600;
}

.level-badge {
  flex-shrink: 0;
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  background: #ede9fe;
  color: #7c3aed;
  font-size: 24rpx;
  font-weight: 600;
}

.unit-display {
  display: block;
  font-size: 24rpx;
  color: #8b5cf6;
  margin-bottom: 8rpx;
}

.unit-warn {
  display: block;
  font-size: 22rpx;
  color: #d97706;
  margin-bottom: 20rpx;
  line-height: 1.4;
}

.control-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 20rpx;
}

.number-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.number-copy {
  flex: 1;
  min-width: 0;
}

.stepper {
  display: flex;
  align-items: center;
  width: 248rpx;
  height: 68rpx;
  border-radius: 16rpx;
  background: #f5f3ff;
  overflow: hidden;
}

.stepper-btn {
  width: 64rpx;
  height: 68rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7c3aed;
  font-size: 34rpx;
  font-weight: 700;
}

.stepper-input {
  flex: 1;
  height: 68rpx;
  text-align: center;
  font-size: 28rpx;
  color: #1f2937;
}

.stall-card {
  margin-top: 20rpx;
  padding: 20rpx;
  border-radius: 18rpx;
  background: #faf9ff;
  border: 1rpx solid #ede9fe;
}

.stall-input {
  height: 68rpx;
  padding: 0 20rpx;
  border-radius: 14rpx;
  background: #fff;
  color: #1f2937;
  font-size: 28rpx;
}

.formula-box {
  margin-top: 18rpx;
  padding: 16rpx 18rpx;
  border-radius: 16rpx;
  background: #f8fafc;
}

.formula-text {
  display: block;
  font-size: 22rpx;
  color: #64748b;
  line-height: 1.5;
}

.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}

.switch-label {
  font-size: 26rpx;
  color: #374151;
  flex: 1;
  padding-right: 12rpx;
}

.result-label {
  display: block;
  font-size: 24rpx;
  color: #92400e;
  margin-bottom: 8rpx;
}

.result-value {
  display: block;
  font-size: 52rpx;
  font-weight: 800;
  color: #d97706;
}

.result-unit {
  font-size: 24rpx;
  color: #b45309;
}

.disclaimer {
  padding: 0 8rpx 16rpx;
}

.disclaimer-text {
  font-size: 22rpx;
  color: #9ca3af;
  line-height: 1.6;
}
</style>
