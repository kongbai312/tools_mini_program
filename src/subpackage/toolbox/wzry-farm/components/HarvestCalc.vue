<template>
  <view class="harvest-calc">
    <view class="card">
      <text class="card-title">选择作物</text>
      <CropPicker :model-value="cropId" @update:model-value="onCropChange" />
    </view>

    <view class="card">
      <text class="card-title">种植时间</text>
      <picker mode="date" :value="plantDate" @change="onDateChange">
        <view class="picker-row">
          <text class="picker-label">日期</text>
          <text class="picker-value">{{ plantDate }}</text>
        </view>
      </picker>
      <picker mode="time" :value="plantTime" @change="onTimeChange">
        <view class="picker-row">
          <text class="picker-label">时刻</text>
          <text class="picker-value">{{ plantTime }}</text>
        </view>
      </picker>
      <view class="quick-row">
        <text class="quick-btn" @tap="setNow">设为当前时间</text>
      </view>
    </view>

    <view class="card">
      <text class="card-title">浇水策略</text>
      <view v-if="selectedCrop.waterBucket" class="switch-row">
        <text class="switch-label">按满 4 次浇水（最短成熟）</text>
        <switch :checked="fullWater" color="#10b981" @change="onWaterSwitch" />
      </view>
      <text class="switch-hint">
        <template v-if="!selectedCrop.waterBucket">
          短时作物（{{ selectedCrop.growTime }}），按自然生长计算
        </template>
        <template v-else-if="fullWater && rule">
          最短 {{ formatDuration(rule.minMinutes) }}
        </template>
        <template v-else>
          不浇水 {{ selectedCrop.growTime }}
        </template>
      </text>
    </view>

    <view v-if="result" class="card card--result">
      <text class="result-label">预计成熟</text>
      <text class="result-time">{{ formatDateTime(result.matureAt) }}</text>
      <text class="result-sub">耗时 {{ formatDuration(result.durationMinutes) }}</text>
      <view v-if="weekendHint.message" class="hint" :class="`hint--${weekendHint.type}`">
        <text class="hint-text">{{ weekendHint.message }}</text>
      </view>
    </view>

    <view v-if="result && result.fullWater" class="card">
      <text class="card-title">浇水节点</text>
      <view v-for="node in result.waterNodes" :key="node.index" class="node-row">
        <text class="node-index">{{ node.index }}</text>
        <view class="node-body">
          <text class="node-time">{{ formatDateTime(node.at) }}</text>
          <text class="node-label">{{ node.label }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CROP_BY_ID, FARM_CROPS } from '../data/crops'
import { getWaterRule } from '../data/waterRules'
import {
  calculateHarvest,
  formatDateTime,
  formatDuration,
  getWeekendHint,
  nowDateStr,
  nowTimeStr,
  parsePlantDateTime,
} from '../utils/farmCalc'
import CropPicker from './CropPicker.vue'

const props = defineProps<{
  cropId: string
}>()

const emit = defineEmits<{
  'update:cropId': [string]
}>()

const plantDate = ref(nowDateStr())
const plantTime = ref(nowTimeStr())
const fullWater = ref(true)

const selectedCrop = computed(() => CROP_BY_ID[props.cropId] ?? FARM_CROPS[0])
const rule = computed(() => {
  const bucket = selectedCrop.value.waterBucket
  return bucket ? getWaterRule(bucket) : null
})

const onCropChange = (id: string) => {
  emit('update:cropId', id)
}

const result = computed(() => {
  const plantedAt = parsePlantDateTime(plantDate.value, plantTime.value)
  if (Number.isNaN(plantedAt.getTime())) return null
  const crop = selectedCrop.value
  return calculateHarvest(plantedAt, crop.growMinutes, crop.waterBucket, fullWater.value)
})

const weekendHint = computed(() => {
  if (!result.value) return { type: 'none' as const, message: '' }
  return getWeekendHint(result.value.matureAt)
})

const onDateChange = (e: { detail: { value: string } }) => {
  plantDate.value = e.detail.value
}

const onTimeChange = (e: { detail: { value: string } }) => {
  plantTime.value = e.detail.value
}

const onWaterSwitch = (e: Event) => {
  fullWater.value = (e as unknown as { detail: { value: boolean } }).detail.value
}

const setNow = () => {
  plantDate.value = nowDateStr()
  plantTime.value = nowTimeStr()
}
</script>

<style lang="scss" scoped>
.harvest-calc {
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
  background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%);
  border: 1rpx solid rgba(139, 92, 246, 0.15);
}

.card-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 20rpx;
}

.picker-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80rpx;
  background: #f5f3ff;
  border-radius: 16rpx;
  padding: 0 24rpx;
  margin-bottom: 16rpx;
}

.picker-label {
  font-size: 28rpx;
  color: #666;
}

.picker-value {
  font-size: 28rpx;
  color: #7c3aed;
  font-weight: 600;
}

.quick-row {
  display: flex;
  justify-content: flex-end;
}

.quick-btn {
  font-size: 24rpx;
  color: #8b5cf6;
  font-weight: 600;
}

.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.switch-label {
  font-size: 28rpx;
  color: #374151;
  flex: 1;
  padding-right: 16rpx;
}

.switch-hint {
  font-size: 22rpx;
  color: #9ca3af;
}

.result-label {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
  margin-bottom: 8rpx;
}

.result-time {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: #7c3aed;
  line-height: 1.2;
}

.result-sub {
  display: block;
  font-size: 24rpx;
  color: #8b5cf6;
  margin-top: 8rpx;
}

.hint {
  margin-top: 16rpx;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
}

.hint--in_window {
  background: rgba(16, 185, 129, 0.12);
}

.hint--before_friday_double {
  background: rgba(245, 158, 11, 0.12);
}

.hint-text {
  font-size: 24rpx;
  line-height: 1.5;
}

.hint--in_window .hint-text {
  color: #059669;
}

.hint--before_friday_double .hint-text {
  color: #d97706;
}

.node-row {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f5;
}

.node-row:last-child {
  border-bottom: none;
}

.node-index {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #ede9fe;
  color: #7c3aed;
  font-size: 24rpx;
  font-weight: 700;
  text-align: center;
  line-height: 40rpx;
  flex-shrink: 0;
}

.node-body {
  flex: 1;
}

.node-time {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a2e;
}

.node-label {
  font-size: 22rpx;
  color: #9ca3af;
  margin-top: 4rpx;
}
</style>
