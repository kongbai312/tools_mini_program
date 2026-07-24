<template>
  <view class="about-page" :class="{ 'about-page--dark': userStore.isDark }">
    <view class="status-placeholder" :style="{ height: layout.navBarHeight + 'px' }" />

    <view class="about-header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">关于</text>
      <view class="header-right" />
    </view>

    <view class="about-card app-card">
      <image class="app-logo" src="/static/imgs/icon2.png" mode="aspectFit" />
      <text class="app-name">工具箱</text>
      <text class="app-version">版本 v{{ appVersion }}</text>
      <text class="app-desc">一个轻量好用的日常工具与内容聚合小程序。</text>
    </view>

    <view class="about-card info-card">
      <view class="info-row">
        <text class="info-label">开发者</text>
        <text class="info-value">O.o</text>
      </view>
      <view class="info-row">
        <text class="info-label">联系邮箱</text>
        <text class="info-value">-</text>
      </view>
      <view class="info-row">
        <text class="info-label">免责声明</text>
        <text class="info-value">页面内容仅供学习与功能体验</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { useNavBarLayout } from '@/composables/useNavBarLayout'

const userStore = useUserStore()
const { layout } = useNavBarLayout()
const appVersion = '1.0.0'

const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.about-page {
  min-height: 100vh;
  background: #f6f7fb;
  padding: 0 24rpx 32rpx;
  box-sizing: border-box;
}

.status-placeholder {
  width: 100%;
}

.about-header {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 44rpx;
  line-height: 1;
  color: #333a57;
  margin-top: -4rpx;
}

.header-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #1f2742;
}

.header-right {
  width: 64rpx;
}

.about-card {
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 28rpx rgba(59, 84, 125, 0.08);
}

.app-card {
  margin-top: 16rpx;
  padding: 36rpx 24rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
}

.app-name {
  margin-top: 16rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: #1f2742;
}

.app-version {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #8e95b2;
}

.app-desc {
  margin-top: 18rpx;
  font-size: 26rpx;
  color: #4b5475;
  text-align: center;
  line-height: 1.6;
}

.info-card {
  margin-top: 16rpx;
  padding: 8rpx 24rpx;
}

.info-row {
  min-height: 92rpx;
  border-bottom: 1rpx solid #edf0f8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #2f3556;
  font-weight: 600;
  flex-shrink: 0;
}

.info-value {
  font-size: 25rpx;
  color: #687197;
  text-align: right;
}

.about-page--dark {
  background: #1a1a2e;

  .back-btn {
    background: #2d2d4a;
  }

  .back-icon,
  .header-title,
  .app-name,
  .info-label {
    color: #e8e8f0;
  }

  .about-card {
    background: #252542;
    box-shadow: 0 8rpx 28rpx rgba(0, 0, 0, 0.3);
  }

  .app-version,
  .info-value {
    color: #9ea5c7;
  }

  .app-desc {
    color: #c7ccee;
  }

  .info-row {
    border-bottom-color: #343455;
  }
}
</style>
