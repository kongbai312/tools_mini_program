<template>
  <view
    class="profile-page"
    :class="{ 'profile-page--dark': store.isDark }"
    :style="{ '--nav-h': layout.navBarHeight + 'px' }"
  >
    <image class="page-bg" :src="IMG.myBg" mode="aspectFill" />

    <view class="header-section">
      <view class="status-placeholder" :style="{ height: layout.navBarHeight + 'px' }" />

      <view class="user-info">
        <view class="avatar-wrap">
          <image class="avatar" :src="store.avatar" mode="aspectFill" />
        </view>
        <view class="user-detail">
          <view class="nickname-row">
            <text class="nickname">{{ store.nickname }}</text>
            <image class="gender-icon" :src="genderIcon" mode="aspectFit" />
          </view>
          <view class="stats-row">
            <view class="level-badge" :style="{ background: levelTheme.color }">
              <text class="level-text">Lv.{{ store.level }}</text>
            </view>
            <view class="exp-bar-bg">
              <view
                class="exp-bar-fill"
                :style="{ width: store.expPercent + '%', background: levelTheme.color }"
              />
            </view>
            <text class="exp-text">{{ store.exp }}/{{ store.maxExp }}</text>
          </view>
        </view>
      </view>

      <view class="status-cards">
        <view class="member-card">
          <image class="status-card-icon" :src="PROFILE_ICONS.member" mode="aspectFit" />
          <view class="status-card-body">
            <text class="member-title">黄金会员</text>
            <text class="member-expiry">{{ store.memberExpiry }}到期</text>
          </view>
          <view class="renew-btn" @tap.stop="onRenew">
            <text class="renew-text">立即续费</text>
          </view>
        </view>

        <view class="checkin-card">
          <image class="status-card-icon" :src="PROFILE_ICONS.checkin" mode="aspectFit" />
          <view class="status-card-body">
            <template v-if="store.checkedInToday">
              <text class="checkin-title">连续签到 {{ store.checkInDays }} 天</text>
              <text class="checkin-sub">再签 {{ store.daysToReward }} 天可得 {{ store.rewardPoints }} 积分</text>
            </template>
            <template v-else>
              <text class="checkin-title">每日签到</text>
              <text class="checkin-sub">签到领取积分奖励</text>
            </template>
          </view>
          <view v-if="!store.checkedInToday" class="checkin-btn" @tap="onCheckIn">
            <text class="checkin-btn-text">签到</text>
          </view>
        </view>
      </view>
    </view>

    <view class="content-wrap">
      <view class="section-block theme-block">
        <view class="block-title-row">
          <image class="block-title-icon-img" :src="PROFILE_ICONS.theme" mode="aspectFit" />
          <text class="block-title">主题模式</text>
        </view>
        <view class="theme-toggle">
          <view
            class="theme-option"
            :class="{ 'theme-option--active': !store.isDark }"
            @tap="store.setTheme('light')"
          >
            <image class="theme-icon-img" :src="PROFILE_ICONS.day" mode="aspectFit" />
            <text class="theme-label">白天</text>
          </view>
          <view
            class="theme-option theme-option--night"
            :class="{ 'theme-option--active': store.isDark }"
            @tap="store.setTheme('dark')"
          >
            <image class="theme-icon-img" :src="PROFILE_ICONS.night" mode="aspectFit" />
            <text class="theme-label">黑夜</text>
          </view>
        </view>
      </view>

      <view class="menu-section">
        <view class="menu-block">
          <view
            v-for="item in menuItems"
            :key="item.id"
            class="menu-item"
            hover-class="menu-item--hover"
            @tap="onMenuItemTap(item)"
          >
            <view class="menu-left">
              <view class="menu-icon-wrap" :style="{ background: item.iconBg }">
                <image class="menu-icon-img" :src="item.icon" mode="aspectFit" />
              </view>
              <text class="menu-label">{{ item.label }}</text>
            </view>
            <view class="menu-right">
              <text v-if="item.badge" class="badge-text">{{ item.badge }}</text>
              <text class="menu-arrow">›</text>
            </view>
          </view>
        </view>
        <image class="role-img" :src="store.avatar" mode="widthFix" />
      </view>
    </view>

    <TabBar :current="3" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/store/user'
import TabBar from '@/components/TabBar/index.vue'
import { useNavBarLayout } from '@/composables/useNavBarLayout'
import { PROFILE_ICONS, getLevelTierColor } from './assets'

const IMG = {
  myBg: '/static/imgs/my_bg.png',
  myRole: '/static/imgs/my_role.png',
} as const

const store = useUserStore()
const { layout } = useNavBarLayout()

const genderIcon = computed(() =>
  store.gender === 'male' ? PROFILE_ICONS.boy : PROFILE_ICONS.girl,
)

const levelTheme = computed(() => ({
  color: getLevelTierColor(store.level),
}))

const menuItems = computed(() => [
  { id: 1, icon: PROFILE_ICONS.feedback, label: '反馈', iconBg: '#EEF2FF', action: 'feedback' as const },
  { id: 2, icon: PROFILE_ICONS.none, label: '暂无功能', iconBg: '#FFF3E0' },
  { id: 3, icon: PROFILE_ICONS.none, label: '暂无功能', iconBg: '#F3F4F6' },
  {
    id: 4,
    icon: PROFILE_ICONS.clearCache,
    label: '清除缓存',
    iconBg: '#E0F7FA',
    badge: store.cacheSize,
    action: 'clearCache' as const,
  },
  { id: 5, icon: PROFILE_ICONS.setting, label: '设置', iconBg: '#ECFDF5', action: 'settings' as const },
  { id: 6, icon: PROFILE_ICONS.about, label: '关于', iconBg: '#FFFBEB', action: 'about' as const },
])

const onRenew = () => {
  uni.showToast({ title: '续费功能开发中', icon: 'none' })
}

const onCheckIn = () => {
  if (store.checkedInToday) return
  const ok = store.checkIn()
  if (ok) {
    uni.showToast({ title: '签到成功！+10积分', icon: 'success' })
  }
}

const onMenuItemTap = (
  item: { label: string; action?: 'clearCache' | 'feedback' | 'about' | 'settings' },
) => {
  if (item.action === 'clearCache') {
    store.clearCache()
    return
  }
  if (item.action === 'feedback') {
    uni.navigateTo({ url: '/subpackage/profile/feedback/index' })
    return
  }
  if (item.action === 'about') {
    uni.navigateTo({ url: '/subpackage/profile/about/index' })
    return
  }
  if (item.action === 'settings') {
    uni.navigateTo({ url: '/subpackage/profile/settings/index' })
    return
  }
  uni.showToast({ title: item.label, icon: 'none', duration: 800 })
}
</script>

<style lang="scss" scoped>
.profile-page {
  position: relative;
  min-height: 100vh;
  background: #FFF5F8;
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

.header-section {
  position: relative;
  z-index: 2;
  padding-bottom: 8rpx;
}

.status-placeholder {
  width: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 12rpx 30rpx 0;
}

.avatar-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.92);
  overflow: hidden;
  flex-shrink: 0;
  background: #FFE0EE;
  box-shadow: 0 6rpx 20rpx rgba(255, 107, 149, 0.28);
}

.avatar {
  width: 100%;
  height: 100%;
  transform: scale(1.35);
  transform-origin: center 20%;
}

.user-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  min-width: 0;
  padding-right: 8rpx;
}

.nickname-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.nickname {
  font-size: 38rpx;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2rpx 8rpx rgba(180, 60, 100, 0.25);
}

.gender-icon {
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  width: fit-content;
  max-width: 100%;
  padding: 8rpx 16rpx 8rpx 10rpx;
  background: rgba(255, 255, 255, 0.42);
  border-radius: 999rpx;
}

.level-badge {
  flex-shrink: 0;
  border-radius: 999rpx;
  padding: 4rpx 14rpx;
}

.level-text {
  font-size: 22rpx;
  color: #fff;
  font-weight: 700;
  line-height: 1.4;
}

.exp-bar-bg {
  width: 160rpx;
  flex-shrink: 0;
  height: 10rpx;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 999rpx;
  overflow: hidden;
}

.exp-bar-fill {
  height: 100%;
  border-radius: 999rpx;
  transition: width 0.5s ease;
}

.exp-text {
  font-size: 22rpx;
  color: #3D3D4E;
  font-weight: 600;
  flex-shrink: 0;
  line-height: 1;
}

.status-cards {
  display: flex;
  gap: 14rpx;
  padding: 28rpx 24rpx 0;
}

.member-card,
.checkin-card {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 18rpx 12rpx;
  border-radius: 24rpx;
}

.member-card {
  background: #FFF8E6;
  box-shadow: 0 4rpx 16rpx rgba(255, 180, 80, 0.1);
}

.checkin-card {
  background: #F3EDFF;
  box-shadow: 0 4rpx 16rpx rgba(168, 120, 255, 0.1);
}

.status-card-icon {
  width: 56rpx;
  height: 56rpx;
  flex-shrink: 0;
}

.status-card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  overflow: hidden;
}

.member-title,
.checkin-title {
  font-size: 24rpx;
  font-weight: 700;
  color: #1A1A2E;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-expiry,
.checkin-sub {
  font-size: 18rpx;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-expiry {
  color: #D48806;
}

.renew-btn,
.checkin-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48rpx;
  padding: 0 16rpx;
  background: #fff;
  border-radius: 999rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.checkin-btn {
  min-width: 72rpx;
  padding: 0 18rpx;
  box-shadow: 0 2rpx 8rpx rgba(124, 92, 219, 0.12);
}

.renew-text,
.checkin-btn-text {
  font-size: 20rpx;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.renew-text {
  color: #FA8C16;
}

.checkin-btn-text {
  color: #7C5CDB;
}

.checkin-sub {
  color: #7C5CDB;
}

.content-wrap {
  position: relative;
  z-index: 1;
  padding-top: 16rpx;
}

.section-block {
  background: #fff;
  border-radius: 24rpx;
  margin: 0 24rpx 16rpx;
  padding: 24rpx 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 120, 160, 0.08);
}

.block-title-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.block-title-icon-img {
  width: 36rpx;
  height: 36rpx;
  flex-shrink: 0;
}

.block-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
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
  gap: 24rpx;
  padding: 20rpx 24rpx;
  border-radius: 18rpx;
  background: #F8F9FC;
  border: 2rpx solid transparent;
}

.theme-option--active {
  background: #FFF0F6;
  border-color: #FF8FAB;
}

.theme-option--active.theme-option--night {
  background: #EDE9FE;
  border-color: #818CF8;
}

.theme-icon-img {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
}

.theme-label {
  font-size: 28rpx;
  color: #666;
}

.theme-option--active .theme-label {
  color: #FF6B95;
  font-weight: 600;
}

.theme-option--active.theme-option--night .theme-label {
  color: #6366F1;
}

.menu-section {
  position: relative;
  margin: 0 24rpx;
  padding-bottom: 64rpx;
}

.menu-block {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(255, 120, 160, 0.08);
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

.menu-icon-img {
  width: 36rpx;
  height: 36rpx;
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
  color: #ccc;
}

.badge-text {
  font-size: 22rpx;
  color: #999;
}

.role-img {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 360rpx;
  z-index: 2;
  pointer-events: none;
}

.profile-page--dark {
  background: #1A1A2E;

  .page-bg {
    opacity: 0.32;
  }

  .section-block,
  .menu-block {
    background: #252542;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.22);
  }

  .block-title,
  .menu-label {
    color: #E8E8F0;
  }

  .theme-option {
    background: #2D2D4A;
  }

  .theme-option--active {
    background: #3D2A3A;
    border-color: #FF8FAB;
  }

  .theme-option--active.theme-option--night {
    background: #2A2A52;
    border-color: #818CF8;
  }

  .theme-label {
    color: #9090A8;
  }

  .theme-option--active .theme-label {
    color: #FF8FAB;
  }

  .theme-option--active.theme-option--night .theme-label {
    color: #A5B4FC;
  }

  .menu-item {
    border-bottom-color: #333350;
  }

  .menu-item--hover {
    background: #2A2A45;
  }

  .menu-arrow {
    color: #666;
  }

  .badge-text {
    color: #888;
  }
}
</style>
