<template>
  <view class="sgx-hub" :class="{ 'sgx-hub--dark': userStore.isDark }">
    <PageHeader title="时光序" />

    <scroll-view class="hub-scroll" scroll-y>
    <view class="hub-hero">
      <text class="hero-title">私人时间管家</text>
      <text class="hero-sub">规划每一天，管理生活方方面面</text>
    </view>

    <view class="hub-section">
      <text class="section-label">时间管理</text>
      <view class="module-grid">
        <view
          v-for="mod in timeModules"
          :key="mod.id"
          class="module-card"
          @tap="openModule(mod.path)"
        >
          <view class="module-icon" :style="{ background: mod.bgColor }">
            <image v-if="mod.icon" class="module-icon-img" :src="mod.icon" mode="aspectFit" />
            <text v-else class="module-emoji">{{ mod.emoji }}</text>
          </view>
          <text class="module-name">{{ mod.name }}</text>
          <text class="module-desc">{{ mod.desc }}</text>
        </view>
      </view>
    </view>

    <view class="hub-section">
      <text class="section-label">生活工具</text>
      <view class="module-grid module-grid--life">
        <view
          v-for="mod in lifeModules"
          :key="mod.id"
          class="module-card"
          @tap="openModule(mod.path)"
        >
          <view class="module-icon" :style="{ background: mod.bgColor }">
            <image v-if="mod.icon" class="module-icon-img" :src="mod.icon" mode="aspectFit" />
            <text v-else class="module-emoji">{{ mod.emoji }}</text>
          </view>
          <text class="module-name">{{ mod.name }}</text>
          <text class="module-desc">{{ mod.desc }}</text>
        </view>
      </view>
    </view>

    <view style="height: 48rpx;" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import PageHeader from './components/PageHeader.vue'
import { sgxTimeModules, sgxLifeModules } from './assets'

const userStore = useUserStore()
const timeModules = sgxTimeModules
const lifeModules = sgxLifeModules

const openModule = (path: string) => {
  uni.navigateTo({ url: path })
}
</script>

<style lang="scss" scoped>
.sgx-hub {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #ede9fe 0%, #f5f3ff 28%, #f6f7fb 100%);
  box-sizing: border-box;
}

.hub-scroll {
  flex: 1;
  padding: 0 24rpx 32rpx;
  box-sizing: border-box;
}

.hub-hero {
  margin: 8rpx 8rpx 28rpx;
  padding: 28rpx 32rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 55%, #c084fc 100%);
  box-shadow: 0 12rpx 36rpx rgba(139, 92, 246, 0.35);
}

.hero-title {
  display: block;
  font-size: 36rpx;
  font-weight: 800;
  color: #fff;
  margin-bottom: 12rpx;
}

.hero-sub {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
}

.hub-section {
  margin-bottom: 28rpx;
}

.section-label {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #4c1d95;
  margin: 0 8rpx 20rpx;
}

.module-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.module-grid--life .module-card {
  width: calc(50% - 10rpx);
}

.module-card {
  width: 100%;
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  box-sizing: border-box;
  box-shadow: 0 8rpx 28rpx rgba(91, 33, 182, 0.08);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10rpx;
}

.module-grid--life .module-card {
  width: calc(50% - 10rpx);
}

.module-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.module-icon-img {
  width: 44rpx;
  height: 44rpx;
  opacity: 0.92;
}

.module-emoji {
  font-size: 40rpx;
  line-height: 1;
}

.module-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a2e;
}

.module-desc {
  font-size: 22rpx;
  color: #888;
  line-height: 1.4;
}

.sgx-hub--dark {
  background: linear-gradient(180deg, #1e1b4b 0%, #12112a 100%);

  .hero-title,
  .hero-sub {
    color: #fff;
  }

  .section-label {
    color: #c4b5fd;
  }

  .module-card {
    background: rgba(30, 28, 58, 0.92);
    border: 1rpx solid #2e2c50;
    box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.3);
  }

  .module-name {
    color: #e0deff;
  }

  .module-desc {
    color: #8888aa;
  }
}
</style>
