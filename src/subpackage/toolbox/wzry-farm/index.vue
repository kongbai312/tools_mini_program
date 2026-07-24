<template>
  <view class="farm-hub" :class="{ 'farm-hub--dark': userStore.isDark }">
    <PageHeader title="王者农场" />

    <scroll-view class="hub-scroll" scroll-y>
      <view class="hub-hero">
        <image class="hero-icon" src="/static/imgs/wzry-farm-hero.svg" mode="aspectFit" />
        <text class="hero-title">农场助手</text>
        <text class="hero-sub">成熟计算 · 全量数据百科</text>
      </view>

      <view class="module-grid">
        <view
          v-for="mod in modules"
          :key="mod.id"
          class="module-card"
          @tap="openModule(mod.path)"
        >
          <view class="module-icon" :style="{ background: mod.bgColor }">
            <image class="module-icon-img" :src="mod.icon" mode="aspectFit" />
          </view>
          <text class="module-name">{{ mod.name }}</text>
          <text class="module-desc">{{ mod.desc }}</text>
          <text class="module-arrow">→</text>
        </view>
      </view>

      <view class="hub-tip">
        <text class="tip-text">数据来自攻略表整理，以游戏内为准</text>
      </view>
      <view style="height: 48rpx;" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import PageHeader from '../shiguangxu/components/PageHeader.vue'
import { farmModules } from './assets'

const userStore = useUserStore()
const modules = farmModules

const openModule = (path: string) => {
  uni.navigateTo({ url: path })
}
</script>

<style lang="scss" scoped>
.farm-hub {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #ecfdf5 0%, #f0fdf4 30%, #f6f7fb 100%);
  box-sizing: border-box;
}

.hub-scroll {
  flex: 1;
  padding: 0 24rpx 32rpx;
  box-sizing: border-box;
}

.hub-hero {
  margin: 8rpx 8rpx 32rpx;
  padding: 36rpx 32rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
  box-shadow: 0 16rpx 40rpx rgba(5, 150, 105, 0.3);
  text-align: center;
}

.hero-icon {
  display: block;
  width: 112rpx;
  height: 112rpx;
  margin: 0 auto 12rpx;
  filter: drop-shadow(0 8rpx 12rpx rgba(4, 120, 87, 0.22));
}

.hero-title {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  color: #fff;
  margin-bottom: 10rpx;
}

.hero-sub {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.92);
}

.module-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.module-card {
  position: relative;
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx 32rpx 28rpx 28rpx;
  box-shadow: 0 8rpx 28rpx rgba(5, 150, 105, 0.1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8rpx;
}

.module-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
}

.module-icon-img {
  width: 72rpx;
  height: 72rpx;
}

.module-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a2e;
}

.module-desc {
  font-size: 24rpx;
  color: #888;
  line-height: 1.4;
  padding-right: 48rpx;
}

.module-arrow {
  position: absolute;
  right: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 36rpx;
  color: #10b981;
  font-weight: 300;
}

.hub-tip {
  margin-top: 28rpx;
  text-align: center;
}

.tip-text {
  font-size: 22rpx;
  color: #9ca3af;
}

.farm-hub--dark {
  background: linear-gradient(180deg, #064e3b 0%, #12112a 100%);

  .module-card {
    background: rgba(30, 28, 58, 0.92);
    border: 1rpx solid #2e2c50;
  }

  .module-name {
    color: #e0deff;
  }

  .module-desc {
    color: #8888aa;
  }
}
</style>
