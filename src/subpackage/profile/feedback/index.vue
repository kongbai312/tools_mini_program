<template>
  <view class="feedback-page" :class="{ 'feedback-page--dark': userStore.isDark }">
    <view class="status-placeholder" :style="{ height: layout.navBarHeight + 'px' }" />

    <view class="feedback-header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">反馈</text>
      <view class="header-right" />
    </view>

    <view class="feedback-card">
      <text class="label">问题或建议</text>
      <textarea
        v-model="content"
        class="feedback-textarea"
        maxlength="300"
        placeholder="请详细描述你遇到的问题或建议（最多300字）"
        :placeholder-style="placeholderStyle"
      />
      <text class="count">{{ content.length }}/300</text>

      <text class="label">联系方式（选填）</text>
      <input
        v-model="contact"
        class="contact-input"
        maxlength="50"
        placeholder="手机号 / 微信号 / 邮箱"
        :placeholder-style="placeholderStyle"
      />

      <view class="submit-btn" :class="{ 'submit-btn--disabled': !canSubmit }" @tap="onSubmit">
        <text class="submit-text">提交反馈</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useNavBarLayout } from '@/composables/useNavBarLayout'

interface FeedbackItem {
  content: string
  contact: string
  createdAt: string
}

const FEEDBACK_STORAGE_KEY = 'profile_feedback_list'

const userStore = useUserStore()
const { layout } = useNavBarLayout()

const content = ref('')
const contact = ref('')

const canSubmit = computed(() => content.value.trim().length > 0)

const placeholderStyle = computed(() =>
  userStore.isDark ? 'color: #7B7BA8;' : 'color: #B8BCC8;',
)

const goBack = () => {
  uni.navigateBack()
}

const onSubmit = () => {
  const text = content.value.trim()
  if (!text) {
    uni.showToast({ title: '请输入反馈内容', icon: 'none' })
    return
  }

  const oldList = (uni.getStorageSync(FEEDBACK_STORAGE_KEY) as FeedbackItem[]) || []
  const nextList: FeedbackItem[] = [
    {
      content: text,
      contact: contact.value.trim(),
      createdAt: new Date().toISOString(),
    },
    ...oldList,
  ]
  uni.setStorageSync(FEEDBACK_STORAGE_KEY, nextList)

  uni.showModal({
    title: '提交成功',
    content: '感谢您宝贵的建议',
    showCancel: false,
    success: () => {
      uni.navigateBack()
    },
  })
  content.value = ''
  contact.value = ''
}
</script>

<style lang="scss" scoped>
.feedback-page {
  min-height: 100vh;
  background: #f6f7fb;
  padding: 0 24rpx 32rpx;
  box-sizing: border-box;
}

.status-placeholder {
  width: 100%;
}

.feedback-header {
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

.feedback-card {
  margin-top: 16rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx 24rpx 30rpx;
  box-shadow: 0 8rpx 28rpx rgba(59, 84, 125, 0.08);
}

.label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #303758;
  margin-bottom: 16rpx;
}

.feedback-textarea {
  width: 100%;
  height: 280rpx;
  padding: 20rpx;
  border-radius: 18rpx;
  background: #f7f9ff;
  color: #2f3556;
  font-size: 28rpx;
  box-sizing: border-box;
}

.count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: #9aa2be;
  margin: 10rpx 0 22rpx;
}

.contact-input {
  width: 100%;
  height: 88rpx;
  padding: 0 20rpx;
  border-radius: 18rpx;
  background: #f7f9ff;
  color: #2f3556;
  font-size: 28rpx;
  box-sizing: border-box;
}

.submit-btn {
  margin-top: 36rpx;
  height: 88rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #7b6cf6, #5b7fff);
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn--disabled {
  opacity: 0.5;
}

.submit-text {
  font-size: 30rpx;
  color: #fff;
  font-weight: 700;
}

.feedback-page--dark {
  background: #1a1a2e;

  .back-btn {
    background: #2d2d4a;
  }

  .back-icon,
  .header-title {
    color: #e8e8f0;
  }

  .feedback-card {
    background: #252542;
    box-shadow: 0 8rpx 28rpx rgba(0, 0, 0, 0.3);
  }

  .label {
    color: #d9dcf6;
  }

  .feedback-textarea,
  .contact-input {
    background: #2d2d4a;
    color: #e8e8f0;
  }

  .count {
    color: #8b8fb0;
  }
}
</style>
