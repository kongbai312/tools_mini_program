<template>
  <view class="sgx-page pomodoro-page" :class="{ 'sgx-page--dark': userStore.isDark }">
    <PageHeader title="番茄专注" />

    <view class="pomo-body">
      <view class="timer-ring">
        <text class="timer-display">{{ displayTime }}</text>
        <text class="timer-hint">{{ running ? '专注中…' : '准备开始' }}</text>
      </view>

      <view class="duration-row">
        <text
          v-for="m in durationOptions"
          :key="m"
          class="duration-chip"
          :class="{ 'duration-chip--active': store.pomodoroMinutes === m && !running }"
          @tap="setDuration(m)"
        >
          {{ m }} 分钟
        </text>
      </view>

      <view class="pomo-actions">
        <view class="pomo-btn pomo-btn--primary" @tap="toggleTimer">
          <text>{{ running ? '暂停' : remainingSec > 0 && remainingSec < totalSec ? '继续' : '开始专注' }}</text>
        </view>
        <view v-if="running || remainingSec < totalSec" class="pomo-btn pomo-btn--ghost" @tap="resetTimer">
          <text>重置</text>
        </view>
      </view>

      <view class="stats-card">
        <text class="stats-label">今日完成番茄</text>
        <text class="stats-value">{{ store.pomodoroSessionsToday }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useUserStore } from '@/store/user'
import { useShiguangxuStore } from '@/store/shiguangxu'
import PageHeader from '../components/PageHeader.vue'

const userStore = useUserStore()
const store = useShiguangxuStore()

const durationOptions = [15, 25, 45]
const running = ref(false)
const remainingSec = ref(store.pomodoroMinutes * 60)
let timerId: ReturnType<typeof setInterval> | null = null

const totalSec = computed(() => store.pomodoroMinutes * 60)

const displayTime = computed(() => {
  const s = remainingSec.value
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${`${m}`.padStart(2, '0')}:${`${sec}`.padStart(2, '0')}`
})

const clearTimer = () => {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
}

const setDuration = (m: number) => {
  if (running.value) return
  store.setPomodoroMinutes(m)
  remainingSec.value = m * 60
}

const toggleTimer = () => {
  if (running.value) {
    running.value = false
    clearTimer()
    return
  }
  if (remainingSec.value <= 0) {
    remainingSec.value = totalSec.value
  }
  running.value = true
  clearTimer()
  timerId = setInterval(() => {
    if (remainingSec.value <= 1) {
      remainingSec.value = 0
      running.value = false
      clearTimer()
      store.recordPomodoroSession()
      uni.showToast({ title: '番茄完成！', icon: 'success' })
      return
    }
    remainingSec.value -= 1
  }, 1000)
}

const resetTimer = () => {
  running.value = false
  clearTimer()
  remainingSec.value = totalSec.value
}

onUnmounted(() => {
  clearTimer()
})
</script>

<style lang="scss" scoped>
@import '../styles/subpage.scss';

.pomodoro-page {
  min-height: 100vh;
}

.pomo-body {
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timer-ring {
  width: 420rpx;
  height: 420rpx;
  border-radius: 50%;
  background: linear-gradient(145deg, #fff5f5, #ffe4e6);
  border: 8rpx solid #fca5a5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 48rpx;
  box-shadow: 0 16rpx 48rpx rgba(239, 68, 68, 0.15);
}

.timer-display {
  font-size: 88rpx;
  font-weight: 800;
  color: #dc2626;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.timer-hint {
  font-size: 26rpx;
  color: #f87171;
  margin-top: 16rpx;
}

.duration-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 40rpx;
}

.duration-chip {
  padding: 14rpx 28rpx;
  border-radius: 999rpx;
  background: #fff;
  font-size: 26rpx;
  color: #666;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.duration-chip--active {
  background: #fef2f2;
  color: #dc2626;
  font-weight: 700;
  border: 2rpx solid #fca5a5;
}

.pomo-actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  width: 100%;
  max-width: 560rpx;
}

.pomo-btn {
  height: 96rpx;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 600;
}

.pomo-btn--primary {
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: #fff;
}

.pomo-btn--ghost {
  background: #f0f0f5;
  color: #666;
}

.stats-card {
  margin-top: 48rpx;
  padding: 28rpx 48rpx;
  background: #fff;
  border-radius: 20rpx;
  text-align: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}

.stats-label {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.stats-value {
  font-size: 56rpx;
  font-weight: 800;
  color: #ef4444;
}

.sgx-page--dark .timer-ring {
  background: rgba(60, 20, 30, 0.6);
  border-color: #7f1d1d;
}

.sgx-page--dark .stats-card,
.sgx-page--dark .duration-chip {
  background: rgba(30, 28, 58, 0.95);
  border: 1rpx solid #2e2c50;
  color: #e0deff;
}
</style>
