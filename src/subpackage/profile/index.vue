<template>
  <view class="profile-page">
    <!-- Pink gradient header -->
    <view class="profile-header">
      <image class="profile-bg-img" :src="IMG.myBg" mode="aspectFill" />
      <view class="status-placeholder" :style="{ height: layout.navBarHeight + 'px' }" />

      <!-- Top action buttons -->
      <view class="header-actions" :style="{ paddingRight: safeRightGap(24) + 'px' }">
        <view class="action-btn" @tap="onShirt">
          <text class="action-icon">🎁</text>
        </view>
        <view class="action-btn" @tap="onSettings">
          <text class="action-icon">⚙</text>
        </view>
      </view>

      <!-- Cloud decorations -->
      <view class="cloud cloud-1">☁</view>
      <view class="cloud cloud-2">☁</view>
      <view class="cloud cloud-3">☁</view>

      <!-- User info -->
      <view class="user-info">
        <view class="avatar-wrap">
          <image class="avatar" :src="IMG.myRole" mode="aspectFill" />
        </view>
        <view class="user-detail">
          <text class="nickname">{{ store.nickname }}</text>
          <view class="level-wrap">
            <view class="level-badge">
              <text class="level-text">Lv.{{ store.level }}</text>
            </view>
          </view>
          <view class="exp-bar-wrap">
            <view class="exp-bar-bg">
              <view class="exp-bar-fill" :style="{ width: store.expPercent + '%' }" />
            </view>
            <text class="exp-text">{{ store.exp }}/{{ store.maxExp }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Main content -->
    <view class="content-wrap">
      <!-- Member card -->
      <view class="member-card">
        <view class="member-left">
          <view class="member-badge">
            <text class="member-icon">👑</text>
            <text class="member-title">黄金会员</text>
          </view>
          <text class="member-expiry">{{ store.memberExpiry }} 到期</text>
        </view>
        <view class="renew-btn" @tap="onRenew">
          <text class="renew-text">立即续费</text>
        </view>
      </view>

      <!-- Check-in info -->
      <view class="checkin-card">
        <view class="checkin-icon-wrap">
          <text class="checkin-icon">🎯</text>
        </view>
        <view class="checkin-info">
          <text class="checkin-main">连续签到 <text class="checkin-days">{{ store.checkInDays }}</text> 天</text>
          <text class="checkin-sub">再签 {{ store.daysToReward }} 天可得 {{ store.rewardPoints }} 积分</text>
        </view>
        <view class="checkin-btn" @tap="onCheckIn">
          <text class="checkin-btn-text">签到</text>
        </view>
      </view>

      <!-- Theme mode -->
      <view class="section-block theme-block">
        <text class="block-title">主题模式</text>
        <view class="theme-toggle">
          <view
            class="theme-option"
            :class="{ 'theme-option--active': !store.isDark }"
            @tap="store.setTheme('light')"
          >
            <text class="theme-icon">☀️</text>
            <text class="theme-label">亮色</text>
          </view>
          <view
            class="theme-option"
            :class="{ 'theme-option--active': store.isDark }"
            @tap="store.setTheme('dark')"
          >
            <text class="theme-icon">🌙</text>
            <text class="theme-label">暗色</text>
          </view>
        </view>
      </view>

      <!-- Settings menu -->
      <view class="menu-block">
        <view
          v-for="item in menuItems"
          :key="item.id"
          class="menu-item"
          hover-class="menu-item--hover"
          @tap="onMenuTap(item)"
        >
          <view class="menu-left">
            <view class="menu-icon-wrap" :style="{ background: item.iconBg }">
              <text class="menu-emoji">{{ item.icon }}</text>
            </view>
            <text class="menu-label">{{ item.label }}</text>
          </view>
          <view class="menu-right">
            <text class="menu-arrow">›</text>
          </view>
        </view>
        <!-- Cache row -->
        <view class="menu-item" hover-class="menu-item--hover" @tap="onClearCache">
          <view class="menu-left">
            <view class="menu-icon-wrap" style="background: #FEE2E2;">
              <text class="menu-emoji">🗑️</text>
            </view>
            <text class="menu-label">清除缓存</text>
          </view>
          <view class="menu-right">
            <view class="menu-badge">
              <text class="badge-text">{{ cacheSize }}</text>
            </view>
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- Decorative cat character -->
      <image
        class="cat-role"
        :src="IMG.myRole"
        mode="widthFix"
      />

      <view style="height: 40rpx;" />
    </view>

    <!-- Tab bar -->
    <TabBar :current="3" />
  </view>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useUserStore } from '@/store/user'
import TabBar from '@/components/TabBar/index.vue'
import { useNavBarLayout } from '@/composables/useNavBarLayout'

const IMG = {
  myBg: '/static/imgs/my_bg.png',
  myRole: '/static/imgs/my_role.png',
} as const

const store = useUserStore()
const { layout, safeRightGap } = useNavBarLayout()

const menuItems = reactive([
  { id: 1, icon: '💬', label: '反馈与建议', iconBg: '#EEF2FF' },
  { id: 2, icon: 'ℹ️', label: '关于本小程序', iconBg: '#FFF3E0' },
  { id: 3, icon: '⚙️', label: '设置', iconBg: '#F3F4F6' },
  { id: 5, icon: '❓', label: '帮助中心', iconBg: '#ECFDF5' },
  { id: 6, icon: '⭐', label: '给我们评分', iconBg: '#FFFBEB' },
])

const cacheSize = computed(() => store.cacheSize)

const onShirt = () => {
  uni.showToast({ title: '我的装扮', icon: 'none' })
}

const onSettings = () => {
  uni.showToast({ title: '设置', icon: 'none' })
}

const onRenew = () => {
  uni.showToast({ title: '续费功能开发中', icon: 'none' })
}

const onCheckIn = () => {
  uni.showToast({ title: '签到成功！+10积分', icon: 'success' })
}

const onClearCache = () => {
  store.clearCache()
}

const onMenuTap = (item: any) => {
  uni.showToast({ title: item.label, icon: 'none', duration: 800 })
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: #FFF0F5;
}

/* ─── Header ─── */
.profile-header {
  background: linear-gradient(160deg, #FF6B95 0%, #FF8FAB 40%, #FFB3C6 75%, #FFD6E7 100%);
  padding-bottom: 60rpx;
  position: relative;
  overflow: hidden;
}

.profile-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.25;
}

.status-placeholder {
  width: 100%;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  padding: 12rpx 24rpx;
  position: relative;
  z-index: 1;
}

.action-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon {
  font-size: 36rpx;
  line-height: 1;
  color: #fff;
}

/* Cloud decorations */
.cloud {
  position: absolute;
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
}

.cloud-1 {
  font-size: 80rpx;
  top: 60rpx;
  left: -10rpx;
}

.cloud-2 {
  font-size: 60rpx;
  top: 40rpx;
  left: 140rpx;
}

.cloud-3 {
  font-size: 70rpx;
  top: 120rpx;
  right: 20rpx;
  opacity: 0.5;
}

/* User info */
.user-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 16rpx 30rpx 0;
  position: relative;
  z-index: 1;
}

.avatar-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.8);
  overflow: hidden;
  flex-shrink: 0;
  background: #FFE0EE;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 149, 0.35);
}

.avatar {
  width: 100%;
  height: 100%;
}

.user-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.nickname {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.level-wrap {
  display: flex;
  align-items: center;
}

.level-badge {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 20rpx;
  padding: 4rpx 16rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
}

.level-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 600;
}

.exp-bar-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.exp-bar-bg {
  flex: 1;
  height: 12rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 6rpx;
  overflow: hidden;
}

.exp-bar-fill {
  height: 100%;
  background: #fff;
  border-radius: 6rpx;
  transition: width 0.5s ease;
}

.exp-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* ─── Content ─── */
.content-wrap {
  margin-top: -36rpx;
  background: #FFF0F5;
  border-radius: 40rpx 40rpx 0 0;
  padding-top: 16rpx;
  position: relative;
}

/* ─── Member card ─── */
.member-card {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 20rpx;
  margin: 0 24rpx 16rpx;
  padding: 24rpx 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4rpx 16rpx rgba(255, 165, 0, 0.3);
}

.member-left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.member-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.member-icon {
  font-size: 32rpx;
}

.member-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #7B4A00;
}

.member-expiry {
  font-size: 22rpx;
  color: rgba(123, 74, 0, 0.8);
}

.renew-btn {
  background: rgba(255, 255, 255, 0.35);
  border-radius: 36rpx;
  padding: 12rpx 28rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.6);
}

.renew-text {
  font-size: 26rpx;
  color: #7B4A00;
  font-weight: 600;
}

/* ─── Check-in card ─── */
.checkin-card {
  background: #fff;
  border-radius: 20rpx;
  margin: 0 24rpx 16rpx;
  padding: 24rpx 28rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.checkin-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #FFF0F5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.checkin-icon {
  font-size: 40rpx;
}

.checkin-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.checkin-main {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.checkin-days {
  color: #FF6B95;
  font-weight: 700;
  font-size: 30rpx;
}

.checkin-sub {
  font-size: 22rpx;
  color: #999;
}

.checkin-btn {
  background: linear-gradient(135deg, #FF6B95, #FF8FAB);
  border-radius: 36rpx;
  padding: 12rpx 28rpx;
  flex-shrink: 0;
}

.checkin-btn-text {
  font-size: 26rpx;
  color: #fff;
  font-weight: 600;
}

/* ─── Theme block ─── */
.section-block {
  background: #fff;
  border-radius: 20rpx;
  margin: 0 24rpx 16rpx;
  padding: 24rpx 28rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.block-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.theme-toggle {
  display: flex;
  gap: 16rpx;
}

.theme-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 16rpx;
  border-radius: 16rpx;
  background: #F5F7FA;
  border: 2rpx solid transparent;
  transition: all 0.2s;
}

.theme-option--active {
  background: #FFF0F5;
  border-color: #FF8FAB;
}

.theme-icon {
  font-size: 32rpx;
}

.theme-label {
  font-size: 28rpx;
  color: #666;
}

.theme-option--active .theme-label {
  color: #FF6B95;
  font-weight: 600;
}

/* ─── Menu list ─── */
.menu-block {
  background: #fff;
  border-radius: 20rpx;
  margin: 0 24rpx 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 28rpx;
  border-bottom: 1rpx solid #FAF0F5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item--hover {
  background: #FFF5F8;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.menu-icon-wrap {
  width: 68rpx;
  height: 68rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-emoji {
  font-size: 36rpx;
}

.menu-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.menu-arrow {
  font-size: 40rpx;
  line-height: 1;
  color: #CCCCCC;
}

.menu-badge {
  background: #F5F7FA;
  border-radius: 10rpx;
  padding: 4rpx 12rpx;
}

.badge-text {
  font-size: 22rpx;
  color: #999;
}

/* ─── Decorative cat ─── */
.cat-role {
  position: absolute;
  bottom: 160rpx;
  right: 0;
  width: 180rpx;
  pointer-events: none;
  opacity: 0.6;
}
</style>
