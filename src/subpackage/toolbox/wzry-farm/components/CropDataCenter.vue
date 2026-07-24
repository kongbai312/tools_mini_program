<template>
  <view class="crop-center">
    <input
      v-model="keyword"
      class="center-search"
      placeholder="搜索作物"
      placeholder-style="color:#B8BCC8"
    />
    <view class="center-stats">
      <text class="center-stats-text">共 {{ filteredCrops.length }} 种 · 金币作物 {{ goldCount }} 种</text>
    </view>

    <view
      v-for="crop in filteredCrops"
      :key="crop.id"
      class="crop-card"
      :class="{ 'crop-card--gold': crop.goldCrop }"
      @tap="toggleExpand(crop.id)"
    >
      <view class="crop-head">
        <view class="crop-head-left">
          <view class="name-row">
            <text class="crop-name">{{ crop.name }}</text>
            <text v-if="crop.goldCrop" class="gold-badge">金币</text>
          </view>
          <view class="tag-row">
            <text v-for="tag in crop.tags" :key="tag" class="tag">{{ tag }}</text>
          </view>
        </view>
        <view class="crop-head-right">
          <text class="crop-level">Lv{{ crop.unlockLevel }}</text>
          <text class="crop-duration">{{ crop.durationHours }}h</text>
        </view>
      </view>
      <view v-if="expandedId === crop.id" class="crop-detail">
        <view class="detail-row">
          <text class="detail-label">成熟周期</text>
          <text class="detail-value">{{ DURATION_LABEL[crop.durationHours] }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">满浇水最短</text>
          <text class="detail-value">{{ formatDuration(getWaterRule(crop.durationHours).minMinutes) }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">经验</text>
          <text class="detail-value">{{ crop.exp }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">单价（普通/满级）</text>
          <text class="detail-value" :class="{ 'detail-value--warn': !crop.priceVerified }">
            {{ formatCropPrice(crop) }}
          </text>
        </view>
      </view>
    </view>

    <view class="disclaimer">
      <text class="disclaimer-text">
        数据来自社区攻略整理（非小王农活助手爬取）。带「待核对」的单价/英雄作物请以游戏内图鉴为准，欢迎反馈修正。
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DURATION_LABEL, FARM_CROPS, filterCrops, formatCropPrice } from '../data/crops'
import { getWaterRule } from '../data/waterRules'
import { formatDuration } from '../utils/farmCalc'

const keyword = ref('')
const expandedId = ref<string | null>(null)

const filteredCrops = computed(() => filterCrops(keyword.value, 'all'))
const goldCount = computed(() => FARM_CROPS.filter((c) => c.goldCrop).length)

const toggleExpand = (id: string) => {
  expandedId.value = expandedId.value === id ? null : id
}
</script>

<style lang="scss" scoped>
.crop-center {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.center-search {
  height: 72rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(91, 33, 182, 0.06);
}

.center-stats {
  padding: 0 8rpx;
}

.center-stats-text {
  font-size: 22rpx;
  color: #9ca3af;
}

.crop-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(91, 33, 182, 0.08);
}

.crop-card--gold {
  border: 1rpx solid rgba(245, 158, 11, 0.25);
}

.crop-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.crop-head-left {
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-wrap: wrap;
}

.crop-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a2e;
}

.gold-badge {
  font-size: 20rpx;
  color: #ea580c;
  background: #ffedd5;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 10rpx;
}

.tag {
  font-size: 20rpx;
  color: #7c3aed;
  background: #ede9fe;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.crop-head-right {
  text-align: right;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.crop-level {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
}

.crop-duration {
  display: block;
  font-size: 32rpx;
  font-weight: 800;
  color: #8b5cf6;
  margin-top: 4rpx;
}

.crop-detail {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f5;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 0;
  gap: 16rpx;
}

.detail-label {
  font-size: 26rpx;
  color: #6b7280;
  flex-shrink: 0;
}

.detail-value {
  font-size: 26rpx;
  color: #1f2937;
  font-weight: 600;
  text-align: right;
}

.detail-value--warn {
  color: #d97706;
  font-size: 24rpx;
}

.disclaimer {
  padding: 16rpx 8rpx;
}

.disclaimer-text {
  font-size: 22rpx;
  color: #9ca3af;
  line-height: 1.6;
}
</style>
