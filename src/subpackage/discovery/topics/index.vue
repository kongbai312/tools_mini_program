<template>
  <view class="topics-page">
    <image class="page-bg" :src="discoverBg" mode="aspectFill" />
    <view class="page-body">
      <view class="status-placeholder" :style="{ height: layout.navBarHeight + 'px' }" />

      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <text class="back-icon">‹</text>
        </view>
        <text class="nav-title">全部主题</text>
        <view class="nav-spacer" />
      </view>

      <view class="topics-grid">
        <view
          v-for="cat in categories"
          :key="cat.id"
          class="topic-card"
          :class="{ 'topic-card--active': categoryFilter === cat.name }"
          @tap="selectTopic(cat.name)"
        >
          <view class="topic-icon-wrap" :style="{ background: cat.bgColor }">
            <image class="topic-icon-img" :src="cat.icon" mode="aspectFit" lazy-load />
          </view>
          <text class="topic-name">{{ cat.name }}</text>
          <text v-if="categoryFilter === cat.name" class="topic-check">已选</text>
        </view>
      </view>

      <view v-if="categoryFilter" class="clear-bar" @tap="clearFilter">
        <text class="clear-bar-text">清除筛选「{{ categoryFilter }}」</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useToolsStore } from '@/store/tools'
import { useNavBarLayout } from '@/composables/useNavBarLayout'
import { categoryIcons, discoverBg } from '../assets'

const store = useToolsStore()
const { categoryFilter } = storeToRefs(store)
const { layout } = useNavBarLayout()

const categories = computed(() =>
  store.categories
    .filter((cat) => cat.name !== '更多')
    .map((cat) => ({
      ...cat,
      icon: categoryIcons[cat.id] ?? '',
    })),
)

const goBack = () => {
  uni.navigateBack()
}

const selectTopic = (name: string) => {
  store.setCategoryFilter(name)
  uni.navigateBack()
}

const clearFilter = () => {
  store.setCategoryFilter(null)
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.topics-page {
  min-height: 100vh;
  background: #F3F0FF;
  position: relative;
}

.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
}

.page-body {
  position: relative;
  z-index: 1;
  padding: 0 24rpx 48rpx;
}

.status-placeholder {
  width: 100%;
}

.nav-bar {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4rpx 16rpx rgba(91, 127, 255, 0.1);
}

.back-icon {
  font-size: 48rpx;
  line-height: 1;
  color: #5B7FFF;
  margin-top: -4rpx;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
  color: #1A1A2E;
}

.nav-spacer {
  width: 64rpx;
  flex-shrink: 0;
}

.topics-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  background: #fff;
  border-radius: 32rpx;
  padding: 32rpx 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(91, 127, 255, 0.06);
}

.topic-card {
  width: calc(33.33% - 16rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 8rpx;
  border-radius: 24rpx;
  box-sizing: border-box;
}

.topic-card--active {
  background: #F3F0FF;
}

.topic-icon-wrap {
  width: 112rpx;
  height: 112rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx;
  box-sizing: border-box;
}

.topic-icon-img {
  width: 100%;
  height: 100%;
}

.topic-name {
  font-size: 26rpx;
  color: #555;
  font-weight: 500;
}

.topic-check {
  font-size: 20rpx;
  color: #5B7FFF;
}

.clear-bar {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 24rpx;
  text-align: center;
  box-shadow: 0 4rpx 24rpx rgba(91, 127, 255, 0.06);
}

.clear-bar-text {
  font-size: 28rpx;
  color: #5B7FFF;
}
</style>
