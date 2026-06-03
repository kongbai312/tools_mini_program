<template>
  <view class="sgx-page" :class="{ 'sgx-page--dark': userStore.isDark }">
    <PageHeader title="习惯打卡">
      <template #right>
        <text class="header-action" @tap="showAdd = true">添加</text>
      </template>
    </PageHeader>

    <scroll-view class="page-scroll" scroll-y>
      <view v-for="habit in store.habits" :key="habit.id" class="habit-card">
        <view class="habit-left">
          <text class="habit-emoji">{{ habit.icon }}</text>
          <view class="habit-info">
            <text class="habit-name">{{ habit.name }}</text>
            <text class="habit-streak">连续 {{ streak(habit.checks) }} 天</text>
          </view>
        </view>
        <view
          class="check-btn"
          :class="{ 'check-btn--done': store.isHabitCheckedToday(habit.id) }"
          @tap="store.checkHabitToday(habit.id)"
        >
          <text class="check-btn-text">{{ store.isHabitCheckedToday(habit.id) ? '已打卡' : '打卡' }}</text>
        </view>
        <text class="habit-del" @tap="onRemove(habit.id)">×</text>
      </view>

      <view v-if="!store.habits.length" class="empty-block">
        <text class="empty-emoji">💪</text>
        <text class="empty-text">养成好习惯，从每天打卡开始</text>
      </view>
      <view style="height: 120rpx;" />
    </scroll-view>

    <view v-if="showAdd" class="add-mask" @tap="showAdd = false">
      <view class="add-panel" @tap.stop>
        <text class="add-title">新建习惯</text>
        <input
          v-model="newName"
          class="add-input"
          placeholder="习惯名称，如：冥想"
          placeholder-style="color:#B8BCC8"
        />
        <view class="add-actions">
          <view class="add-btn add-btn--ghost" @tap="showAdd = false"><text>取消</text></view>
          <view class="add-btn add-btn--primary" @tap="submitAdd"><text>保存</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useShiguangxuStore, habitStreak } from '@/store/shiguangxu'
import PageHeader from '../components/PageHeader.vue'

const userStore = useUserStore()
const store = useShiguangxuStore()

const showAdd = ref(false)
const newName = ref('')

const streak = habitStreak

const submitAdd = () => {
  if (!store.addHabit(newName.value)) {
    uni.showToast({ title: '请输入名称', icon: 'none' })
    return
  }
  newName.value = ''
  showAdd.value = false
  uni.showToast({ title: '已添加', icon: 'success' })
}

const onRemove = (id: string) => {
  uni.showModal({
    title: '删除',
    content: '确定删除该习惯？',
    success: (res) => {
      if (res.confirm) store.removeHabit(id)
    },
  })
}
</script>

<style lang="scss" scoped>
@import '../styles/subpage.scss';

.habit-card {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(16, 185, 129, 0.08);
}

.habit-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-width: 0;
}

.habit-emoji {
  font-size: 44rpx;
}

.habit-name {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a2e;
}

.habit-streak {
  font-size: 24rpx;
  color: #10b981;
  margin-top: 4rpx;
}

.check-btn {
  padding: 14rpx 28rpx;
  border-radius: 999rpx;
  background: #ecfdf5;
  border: 2rpx solid #10b981;
}

.check-btn--done {
  background: #10b981;
}

.check-btn-text {
  font-size: 26rpx;
  color: #10b981;
  font-weight: 600;
}

.check-btn--done .check-btn-text {
  color: #fff;
}

.habit-del {
  font-size: 40rpx;
  color: #ddd;
  padding: 0 4rpx;
}

.sgx-page--dark .habit-card {
  background: rgba(30, 28, 58, 0.95);
  border: 1rpx solid #2e2c50;
}

.sgx-page--dark .habit-name {
  color: #e0deff;
}
</style>
