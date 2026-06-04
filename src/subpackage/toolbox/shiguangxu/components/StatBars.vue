<template>
  <view v-if="slices.length" class="stat-bars">
    <view v-for="item in slices" :key="item.label" class="bar-row">
      <text class="bar-label">{{ item.label }}</text>
      <view class="bar-track">
        <view
          class="bar-fill"
          :style="{ width: barWidth(item.value) + '%', background: item.color }"
        />
      </view>
      <text class="bar-value">{{ formatValue(item.value) }}</text>
    </view>
  </view>
  <view v-else class="stat-empty">
    <text class="stat-empty-text">暂无数据</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StatSlice } from '@/store/shiguangxu'

const props = defineProps<{
  slices: StatSlice[]
  valueSuffix?: string
}>()

const maxVal = computed(() => Math.max(...props.slices.map((s) => s.value), 1))

const barWidth = (v: number) => Math.round((v / maxVal.value) * 100)

const formatValue = (v: number) => {
  if (props.valueSuffix) return `${v}${props.valueSuffix}`
  return String(v)
}
</script>

<style lang="scss" scoped>
.stat-bars {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.bar-label {
  width: 80rpx;
  font-size: 24rpx;
  color: #666;
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 20rpx;
  background: #f0f0f5;
  border-radius: 10rpx;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 10rpx;
  min-width: 4rpx;
  transition: width 0.3s;
}

.bar-value {
  flex-shrink: 0;
  min-width: 96rpx;
  text-align: right;
  font-size: 24rpx;
  color: #333;
  font-weight: 600;
  white-space: nowrap;
}

.stat-empty {
  padding: 40rpx 0;
  text-align: center;
}

.stat-empty-text {
  font-size: 24rpx;
  color: #bbb;
}
</style>
