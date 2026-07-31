<template>
  <view class="settings-page" :class="{ 'settings-page--dark': userStore.isDark }">
    <view class="status-placeholder" :style="{ height: layout.navBarHeight + 'px' }" />

    <view class="settings-header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">个人信息</text>
      <view class="header-right" />
    </view>

    <view class="settings-card">
      <button
        class="setting-row setting-row--avatar avatar-btn"
        open-type="chooseAvatar"
        @chooseavatar="onChooseAvatar"
      >
        <text class="setting-label">头像</text>
        <view class="setting-right">
          <image class="avatar-preview" :src="userStore.avatar" mode="aspectFill" />
          <text class="setting-arrow">›</text>
        </view>
      </button>

      <view class="setting-row">
        <text class="setting-label">昵称</text>
        <input
          v-model="nicknameDraft"
          class="nickname-input"
          type="nickname"
          maxlength="16"
          placeholder="请输入昵称"
          :placeholder-style="placeholderStyle"
          @blur="onNicknameBlur"
          @confirm="onNicknameConfirm"
        />
      </view>

      <view class="setting-row setting-row--gender">
        <text class="setting-label">性别</text>
        <view class="gender-options">
          <view
            class="gender-option"
            :class="{ 'gender-option--active': userStore.gender === 'male' }"
            @tap="userStore.setGender('male')"
          >
            <image class="gender-option-icon" :src="PROFILE_ICONS.boy" mode="aspectFit" />
            <text class="gender-option-text">男</text>
          </view>
          <view
            class="gender-option"
            :class="{ 'gender-option--active': userStore.gender === 'female' }"
            @tap="userStore.setGender('female')"
          >
            <image class="gender-option-icon" :src="PROFILE_ICONS.girl" mode="aspectFit" />
            <text class="gender-option-text">女</text>
          </view>
        </view>
      </view>
    </view>

    <text class="settings-tip">头像、昵称与性别会同步到「我的」页面</text>

    <view v-if="userStore.isLoggedIn" class="logout-btn" @tap="onLogout">
      <text class="logout-text">退出登录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  DEFAULT_AVATAR,
  DEFAULT_NICKNAME,
  WECHAT_DEFAULT_NICKNAME,
  useUserStore,
} from '@/store/user'
import { useNavBarLayout } from '@/composables/useNavBarLayout'
import { PROFILE_ICONS } from '../assets'

const userStore = useUserStore()
const { layout } = useNavBarLayout()

const nicknameDraft = ref(userStore.nickname)

watch(
  () => userStore.nickname,
  (name) => {
    nicknameDraft.value = name
  },
)

const placeholderStyle = computed(() =>
  userStore.isDark ? 'color: #7B7BA8;' : 'color: #B8BCC8;',
)

const goBack = () => {
  uni.navigateBack()
}

const onChooseAvatar = (e: { detail?: { avatarUrl?: string } }) => {
  const path = e.detail?.avatarUrl?.trim() ?? ''
  if (!path) return
  userStore.setAvatar(path)
  saveProfileIfReady(path, nicknameDraft.value)
}

const saveNickname = () => {
  if (nicknameDraft.value.trim() === userStore.nickname) return
  const ok = userStore.setNickname(nicknameDraft.value)
  if (!ok) nicknameDraft.value = userStore.nickname
  saveProfileIfReady(userStore.avatar, nicknameDraft.value)
}

const onNicknameBlur = () => {
  saveNickname()
}

const onNicknameConfirm = () => {
  saveNickname()
}

const saveProfileIfReady = (avatar: string, nickname: string) => {
  const trimmedNickname = nickname.trim()
  if (!avatar || !trimmedNickname) return
  if (avatar === DEFAULT_AVATAR) return
  if (trimmedNickname === DEFAULT_NICKNAME || trimmedNickname === WECHAT_DEFAULT_NICKNAME) return
  userStore.completeWechatProfile({
    avatar,
    nickname: trimmedNickname,
    gender: userStore.gender,
  })
}

const onLogout = () => {
  uni.showModal({
    title: '退出登录',
    content: '退出后将清除当前微信头像和昵称，回到未登录状态。',
    confirmText: '退出',
    confirmColor: '#EF4444',
    success: (res) => {
      if (!res.confirm) return
      userStore.logoutWechatProfile()
      uni.showToast({ title: '已退出登录', icon: 'success' })
    },
  })
}
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  background: #f6f7fb;
  padding: 0 24rpx 32rpx;
  box-sizing: border-box;
}

.status-placeholder {
  width: 100%;
}

.settings-header {
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

.settings-card {
  margin-top: 16rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 28rpx rgba(59, 84, 125, 0.08);
  padding: 8rpx 24rpx;
}

.setting-row {
  min-height: 96rpx;
  border-bottom: 1rpx solid #edf0f8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-row--avatar {
  padding: 12rpx 0;
}

.avatar-btn {
  width: 100%;
  padding: 0;
  background: transparent;
  border: none;
  line-height: 1;
}

.avatar-btn::after {
  border: none;
}

.setting-row--gender {
  flex-direction: column;
  align-items: flex-start;
  padding: 24rpx 0 28rpx;
  gap: 16rpx;
}

.setting-label {
  font-size: 28rpx;
  color: #2f3556;
  font-weight: 600;
  flex-shrink: 0;
}

.setting-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.avatar-preview {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: #f0f2f8;
}

.setting-arrow {
  font-size: 36rpx;
  color: #b8bcc8;
  line-height: 1;
}

.nickname-input {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #4b5475;
}

.gender-options {
  width: 100%;
  display: flex;
  gap: 20rpx;
}

.gender-option {
  flex: 1;
  height: 88rpx;
  border-radius: 20rpx;
  background: #f3f5fb;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  border: 2rpx solid transparent;
}

.gender-option--active {
  background: #eef2ff;
  border-color: #7c8cff;
}

.gender-option-icon {
  width: 40rpx;
  height: 40rpx;
}

.gender-option-text {
  font-size: 28rpx;
  color: #4b5475;
  font-weight: 600;
}

.gender-option--active .gender-option-text {
  color: #4f5fd6;
}

.settings-tip {
  display: block;
  margin-top: 20rpx;
  padding: 0 8rpx;
  font-size: 24rpx;
  color: #8e95b2;
  line-height: 1.5;
}

.logout-btn {
  margin-top: 48rpx;
  height: 88rpx;
  border-radius: 22rpx;
  background: #fff;
  border: 1rpx solid rgba(239, 68, 68, 0.12);
  box-shadow: 0 8rpx 28rpx rgba(239, 68, 68, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-text {
  font-size: 28rpx;
  color: #ef4444;
  font-weight: 700;
}

.settings-page--dark {
  background: #1a1a2e;

  .back-btn {
    background: #2d2d4a;
  }

  .back-icon,
  .header-title,
  .setting-label {
    color: #e8e8f0;
  }

  .settings-card {
    background: #252542;
    box-shadow: 0 8rpx 28rpx rgba(0, 0, 0, 0.3);
  }

  .setting-row {
    border-bottom-color: #343455;
  }

  .avatar-preview {
    background: #343455;
  }

  .nickname-input {
    color: #c7ccee;
  }

  .gender-option {
    background: #2d2d4a;
  }

  .gender-option--active {
    background: #34345a;
    border-color: #7c8cff;
  }

  .gender-option-text {
    color: #c7ccee;
  }

  .gender-option--active .gender-option-text {
    color: #a8b4ff;
  }

  .settings-tip {
    color: #9ea5c7;
  }

  .logout-btn {
    background: #252542;
    border-color: rgba(248, 113, 113, 0.28);
    box-shadow: 0 8rpx 28rpx rgba(0, 0, 0, 0.24);
  }

  .logout-text {
    color: #f87171;
  }
}
</style>
