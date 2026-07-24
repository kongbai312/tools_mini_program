<template>
  <view class="sync-page" :class="{ 'sync-page--dark': userStore.isDark }">
    <view class="status-placeholder" :style="{ height: layout.navBarHeight + 'px' }" />

    <view class="sync-header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">同步功能</text>
      <view class="header-right" />
    </view>

    <view class="sync-card">
      <view class="card-head">
        <view class="sync-mark">
          <text class="sync-mark-text">序</text>
        </view>
        <view class="card-title-box">
          <text class="card-title">时光序同步</text>
          <text class="card-sub">{{ lastSyncText }}</text>
        </view>
      </view>

      <view class="sync-row">
        <view class="row-left">
          <text class="row-title">待办事项</text>
          <text class="row-sub">本地 {{ todoCount }} 条</text>
        </view>
        <view class="row-actions">
          <view
            class="action-btn action-btn--sync"
            :class="{ 'action-btn--disabled': syncing }"
            @tap="onUploadTodos"
          >
            <text class="action-text">{{ syncing ? '同步中' : '同步' }}</text>
          </view>
          <view
            class="action-btn action-btn--pull"
            :class="{ 'action-btn--disabled': pulling }"
            @tap="onPullTodos"
          >
            <text class="action-text">{{ pulling ? '拉取中' : '拉取' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useShiguangxuStore } from '@/store/shiguangxu'
import { useNavBarLayout } from '@/composables/useNavBarLayout'

const userStore = useUserStore()
const sgxStore = useShiguangxuStore()
const { layout } = useNavBarLayout()

const syncing = ref(false)
const pulling = ref(false)

const todoCount = computed(() => sgxStore.todos.length)

const lastSyncText = computed(() => {
  if (!sgxStore.todoCloudUpdatedAt) return '待办事项尚未同步'
  const d = new Date(sgxStore.todoCloudUpdatedAt)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `上次同步 ${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
})

const goBack = () => {
  uni.navigateBack()
}

const onUploadTodos = async () => {
  if (syncing.value) return
  syncing.value = true
  try {
    const ok = await sgxStore.uploadTodosToCloud()
    uni.showToast({
      title: ok ? '已同步到云端' : '同步失败',
      icon: ok ? 'success' : 'none',
    })
  } finally {
    syncing.value = false
  }
}

const onPullTodos = async () => {
  if (pulling.value) return
  pulling.value = true
  try {
    const ok = await sgxStore.pullTodosFromCloud()
    uni.showToast({
      title: ok ? '已拉取到本地' : '云端暂无数据',
      icon: ok ? 'success' : 'none',
    })
  } finally {
    pulling.value = false
  }
}
</script>

<style lang="scss" scoped>
.sync-page {
  min-height: 100vh;
  background: #f6f7fb;
  padding: 0 24rpx 32rpx;
  box-sizing: border-box;
}

.status-placeholder {
  width: 100%;
}

.sync-header {
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
  font-size: 52rpx;
  line-height: 1;
  color: #333a57;
  margin-top: -6rpx;
}

.header-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #1f2742;
}

.header-right {
  width: 64rpx;
}

.sync-card {
  margin-top: 16rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 28rpx rgba(59, 84, 125, 0.08);
  overflow: hidden;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 28rpx 28rpx 24rpx;
  background: linear-gradient(135deg, #f5f3ff 0%, #fff5f8 100%);
}

.sync-mark {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sync-mark-text {
  color: #fff;
  font-size: 30rpx;
  font-weight: 800;
}

.card-title-box {
  flex: 1;
  min-width: 0;
}

.card-title {
  display: block;
  font-size: 32rpx;
  font-weight: 800;
  color: #1f2742;
}

.card-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 23rpx;
  color: #8e95b2;
}

.sync-row {
  min-height: 112rpx;
  padding: 22rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.row-left {
  flex: 1;
  min-width: 0;
}

.row-title {
  display: block;
  font-size: 29rpx;
  font-weight: 700;
  color: #2f3556;
}

.row-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 23rpx;
  color: #8e95b2;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
}

.action-btn {
  min-width: 88rpx;
  height: 56rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.action-btn--sync {
  background: #8b5cf6;
}

.action-btn--pull {
  background: #ec4899;
}

.action-btn--disabled {
  opacity: 0.58;
}

.action-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 700;
  white-space: nowrap;
}

.sync-page--dark {
  background: #1a1a2e;

  .back-btn {
    background: #2d2d4a;
  }

  .back-icon,
  .header-title,
  .card-title,
  .row-title {
    color: #e8e8f0;
  }

  .sync-card {
    background: #252542;
    box-shadow: 0 8rpx 28rpx rgba(0, 0, 0, 0.3);
  }

  .card-head {
    background: linear-gradient(135deg, #2d2d4a 0%, #3a2d4c 100%);
  }

  .card-sub,
  .row-sub {
    color: #9ea5c7;
  }
}
</style>
