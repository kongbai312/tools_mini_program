<template>
  <view class="toolbox-page">
    <!-- Purple gradient header banner -->
    <view class="banner">
      <view class="status-placeholder" :style="{ height: layout.navBarHeight + 'px' }" />
      <!-- Stars decoration -->
      <view class="star star-1">✦</view>
      <view class="star star-2">✦</view>
      <view class="star star-3">✧</view>

      <view class="banner-content" :style="{ paddingRight: safeRightGap(0) + 'px' }">
        <view class="banner-text">
          <text class="banner-title">工具箱</text>
          <text class="banner-subtitle">超多实用工具，生活更便捷</text>
        </view>
        <image
          class="tools-role"
          :src="toolsRole"
          mode="widthFix"
        />
      </view>
    </view>

    <!-- Content area (white card) -->
    <view class="content-area">
      <!-- Recently used -->
      <view class="section-block">
        <view class="section-header">
          <text class="section-title">最近使用</text>
          <view class="edit-btn" @tap="onEdit">
            <text class="edit-text">编辑</text>
            <text class="arrow-icon">›</text>
          </view>
        </view>
        <scroll-view scroll-x class="recent-scroll" :show-scrollbar="false">
          <view class="recent-list">
            <view
              v-for="tool in store.recentTools"
              :key="tool.id"
              class="recent-item"
              @tap="onToolTap(tool.name)"
            >
              <view class="tool-icon-wrap" :style="{ background: tool.bgColor }">
                <text class="tool-emoji">{{ tool.icon }}</text>
              </view>
              <text class="tool-name-sm">{{ tool.name }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- Game tools -->
      <view class="section-block">
        <view class="section-header">
          <view class="section-title-wrap">
            <text class="section-icon">🎮</text>
            <text class="section-title">游戏类</text>
          </view>
          <view class="more-btn" @tap="onMoreTap('游戏类')">
            <text class="more-text">更多</text>
            <text class="arrow-icon">›</text>
          </view>
        </view>
        <view class="tools-grid">
          <view
            v-for="tool in store.gameTools"
            :key="tool.id"
            class="grid-tool-item"
            @tap="onToolTap(tool.name)"
          >
            <view class="grid-icon-wrap" :style="{ background: tool.bgColor + '20' }">
              <text class="grid-emoji">{{ tool.icon }}</text>
            </view>
            <text class="grid-tool-name">{{ tool.name }}</text>
          </view>
        </view>
      </view>

      <!-- Daily tools -->
      <view class="section-block">
        <view class="section-header">
          <view class="section-title-wrap">
            <text class="section-icon">☀️</text>
            <text class="section-title">日常类</text>
          </view>
          <view class="more-btn" @tap="onMoreTap('日常类')">
            <text class="more-text">更多</text>
            <text class="arrow-icon">›</text>
          </view>
        </view>
        <view class="tools-grid">
          <view
            v-for="tool in store.dailyTools"
            :key="tool.id"
            class="grid-tool-item"
            @tap="onToolTap(tool.name)"
          >
            <view class="grid-icon-wrap" :style="{ background: tool.bgColor + '20' }">
              <text class="grid-emoji">{{ tool.icon }}</text>
            </view>
            <text class="grid-tool-name">{{ tool.name }}</text>
          </view>
        </view>
      </view>

      <!-- Bottom padding for tab bar -->
      <view style="height: 40rpx;" />
    </view>

    <!-- Tab bar -->
    <TabBar :current="2" />
  </view>
</template>

<script setup lang="ts">
import { useToolsStore } from '@/store/tools'
import TabBar from '@/components/TabBar/index.vue'
import { useNavBarLayout } from '@/composables/useNavBarLayout'

const toolsRole = '/static/imgs/tools_role.png'
const store = useToolsStore()
const { layout, safeRightGap } = useNavBarLayout()

const onToolTap = (name: string) => {
  uni.showToast({ title: name, icon: 'none', duration: 800 })
}

const onEdit = () => {
  uni.showToast({ title: '编辑模式', icon: 'none' })
}

const onMoreTap = (category: string) => {
  uni.showToast({ title: `更多${category}工具`, icon: 'none' })
}
</script>

<style lang="scss" scoped>
.toolbox-page {
  min-height: 100vh;
  background: #F5F7FA;
}

/* ─── Banner ─── */
.banner {
  background: linear-gradient(135deg, #7C3AED 0%, #9D5CF5 50%, #C084FC 100%);
  padding-bottom: 70rpx;
  position: relative;
  overflow: hidden;
}

.status-placeholder {
  width: 100%;
}

/* Star decorations */
.star {
  position: absolute;
  color: rgba(255, 255, 255, 0.5);
  font-size: 28rpx;
  pointer-events: none;
}

.star-1 {
  top: 80rpx;
  left: 40rpx;
  font-size: 20rpx;
}

.star-2 {
  top: 60rpx;
  right: 200rpx;
  font-size: 32rpx;
}

.star-3 {
  top: 120rpx;
  left: 160rpx;
  font-size: 16rpx;
  opacity: 0.6;
}

.banner-content {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 20rpx 30rpx 0;
}

.banner-text {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding-bottom: 20rpx;
}

.banner-title {
  font-size: 52rpx;
  font-weight: 800;
  color: #fff;
  letter-spacing: 4rpx;
}

.banner-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.tools-role {
  width: 260rpx;
  flex-shrink: 0;
}

/* ─── Content Area ─── */
.content-area {
  margin-top: -44rpx;
  background: #F5F7FA;
  border-radius: 40rpx 40rpx 0 0;
  padding-top: 8rpx;
}

.section-block {
  background: #fff;
  border-radius: 24rpx;
  margin: 16rpx 24rpx;
  padding: 28rpx 0 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28rpx 20rpx;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.section-icon {
  font-size: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1A1A2E;
}

.edit-btn,
.more-btn {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.edit-text,
.more-text {
  font-size: 26rpx;
  color: #999;
}

.arrow-icon {
  font-size: 34rpx;
  line-height: 1;
  color: #999;
}

/* ─── Recent scroll ─── */
.recent-scroll {
  width: 100%;
}

.recent-list {
  display: flex;
  padding: 0 28rpx;
  gap: 32rpx;
  white-space: nowrap;
}

.recent-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
}

.tool-icon-wrap {
  width: 100rpx;
  height: 100rpx;
  border-radius: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.12);
}

.tool-emoji {
  font-size: 48rpx;
}

.tool-name-sm {
  font-size: 22rpx;
  color: #555;
  text-align: center;
  max-width: 100rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ─── Tools grid ─── */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
  padding: 0 28rpx;
}

.grid-tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14rpx;
}

.grid-icon-wrap {
  width: 100rpx;
  height: 100rpx;
  border-radius: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-emoji {
  font-size: 48rpx;
}

.grid-tool-name {
  font-size: 24rpx;
  color: #444;
  text-align: center;
  font-weight: 500;
}
</style>
