<template>
  <view class="crop-picker">
    <input
      v-model="keyword"
      class="crop-search"
      placeholder="搜索作物名称或等级"
      placeholder-style="color:#B8BCC8"
    />
    <scroll-view class="duration-scroll" scroll-x :show-scrollbar="false">
      <view class="duration-row">
        <view
          v-for="opt in DURATION_OPTIONS"
          :key="String(opt.value)"
          class="duration-chip"
          :class="{ 'duration-chip--active': durationFilter === opt.value }"
          @tap="durationFilter = opt.value"
        >
          <text class="duration-chip-text">{{ opt.label }}</text>
        </view>
      </view>
    </scroll-view>
    <scroll-view class="crop-scroll" scroll-y :style="{ maxHeight: scrollMaxHeight }">
      <view class="crop-grid">
        <view
          v-for="crop in filteredCrops"
          :key="crop.id"
          class="crop-chip"
          :class="{ 'crop-chip--active': modelValue === crop.id, 'crop-chip--gold': crop.goldCrop }"
          @tap="emit('update:modelValue', crop.id)"
        >
          <text v-if="crop.goldCrop" class="crop-gold-badge">金币</text>
          <text class="crop-chip-name">{{ crop.name }}</text>
          <text class="crop-chip-meta">{{ crop.growTime }} · Lv{{ crop.unlockLevel }}</text>
        </view>
      </view>
      <view v-if="!filteredCrops.length" class="crop-empty">
        <text class="crop-empty-text">无匹配作物</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DURATION_OPTIONS, filterCrops } from '../data/crops'
import type { GrowFilter } from '../data/parseGrow'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

const keyword = ref('')
const durationFilter = ref<GrowFilter>('all')
const scrollMaxHeight = '420rpx'

const filteredCrops = computed(() => filterCrops(keyword.value, durationFilter.value))
</script>

<style lang="scss" scoped>
.crop-search {
  height: 72rpx;
  background: #f5f3ff;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  margin-bottom: 16rpx;
}

.duration-scroll {
  width: 100%;
  white-space: nowrap;
  margin-bottom: 16rpx;
}

.duration-row {
  display: inline-flex;
  gap: 12rpx;
}

.duration-chip {
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  background: #f3f4f6;
}

.duration-chip--active {
  background: #d1fae5;
}

.duration-chip-text {
  font-size: 24rpx;
  color: #6b7280;
}

.duration-chip--active .duration-chip-text {
  color: #059669;
  font-weight: 600;
}

.crop-scroll {
  width: 100%;
}

.crop-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.crop-chip {
  position: relative;
  width: calc(33.33% - 8rpx);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 8rpx;
  border-radius: 16rpx;
  background: #f3f4f6;
  border: 2rpx solid transparent;
}

.crop-chip--gold {
  background: #fff7ed;
}

.crop-chip--active {
  background: #d1fae5;
  border-color: #10b981;
}

.crop-chip--gold.crop-chip--active {
  background: #ffedd5;
  border-color: #f59e0b;
}

.crop-gold-badge {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  font-size: 18rpx;
  color: #ea580c;
  background: rgba(255, 237, 213, 0.95);
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
}

.crop-chip-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #374151;
  text-align: center;
}

.crop-chip--active .crop-chip-name {
  color: #059669;
}

.crop-chip-meta {
  font-size: 20rpx;
  color: #9ca3af;
  margin-top: 4rpx;
}

.crop-empty {
  padding: 40rpx 0;
  text-align: center;
}

.crop-empty-text {
  font-size: 24rpx;
  color: #9ca3af;
}
</style>
