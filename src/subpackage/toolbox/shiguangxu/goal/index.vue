<template>
  <view class="sgx-page" :class="{ 'sgx-page--dark': userStore.isDark }">
    <PageHeader title="目标管理">
      <template #right>
        <text class="header-action" @tap="showAddGoal = true">添加</text>
      </template>
    </PageHeader>

    <scroll-view class="page-scroll" scroll-y>
      <view v-for="goal in store.goals" :key="goal.id" class="goal-card">
        <view class="goal-head">
          <text class="goal-title">{{ goal.title }}</text>
          <text class="goal-pct">{{ progress(goal) }}%</text>
        </view>
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: progress(goal) + '%' }" />
        </view>
        <view v-for="step in goal.steps" :key="step.id" class="step-row">
          <view
            class="check-circle check-circle--sm"
            :class="{ 'check-circle--done': step.done }"
            @tap="store.toggleGoalStep(goal.id, step.id)"
          >
            <text v-if="step.done" class="check-mark">✓</text>
          </view>
          <text class="step-title" :class="{ 'step-title--done': step.done }">{{ step.title }}</text>
        </view>
        <view class="goal-actions">
          <text class="goal-link" @tap="openAddStep(goal.id)">+ 添加步骤</text>
          <text class="goal-del" @tap="onRemoveGoal(goal.id)">删除目标</text>
        </view>
      </view>
      <view v-if="!store.goals.length" class="empty-block">
        <text class="empty-emoji">🎯</text>
        <text class="empty-text">立下目标，拆解步骤更容易实现</text>
      </view>
      <view style="height: 120rpx;" />
    </scroll-view>

    <view v-if="showAddGoal" class="add-mask" @tap="showAddGoal = false">
      <view class="add-panel" @tap.stop>
        <text class="add-title">新建目标</text>
        <input v-model="newGoalTitle" class="add-input" placeholder="目标名称" placeholder-style="color:#B8BCC8" />
        <view class="add-actions">
          <view class="add-btn add-btn--ghost" @tap="showAddGoal = false"><text>取消</text></view>
          <view class="add-btn add-btn--primary" @tap="submitGoal"><text>保存</text></view>
        </view>
      </view>
    </view>

    <view v-if="addStepGoalId" class="add-mask" @tap="addStepGoalId = null">
      <view class="add-panel" @tap.stop>
        <text class="add-title">添加步骤</text>
        <input v-model="newStepTitle" class="add-input" placeholder="步骤描述" placeholder-style="color:#B8BCC8" />
        <view class="add-actions">
          <view class="add-btn add-btn--ghost" @tap="addStepGoalId = null"><text>取消</text></view>
          <view class="add-btn add-btn--primary" @tap="submitStep"><text>保存</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useShiguangxuStore, goalProgress } from '@/store/shiguangxu'
import PageHeader from '../components/PageHeader.vue'

const userStore = useUserStore()
const store = useShiguangxuStore()
const progress = goalProgress

const showAddGoal = ref(false)
const newGoalTitle = ref('')
const addStepGoalId = ref<string | null>(null)
const newStepTitle = ref('')

const submitGoal = () => {
  if (!store.addGoal(newGoalTitle.value)) {
    uni.showToast({ title: '请输入目标', icon: 'none' })
    return
  }
  newGoalTitle.value = ''
  showAddGoal.value = false
  uni.showToast({ title: '已添加', icon: 'success' })
}

const openAddStep = (goalId: string) => {
  addStepGoalId.value = goalId
  newStepTitle.value = ''
}

const submitStep = () => {
  if (!addStepGoalId.value || !store.addGoalStep(addStepGoalId.value, newStepTitle.value)) {
    uni.showToast({ title: '请输入步骤', icon: 'none' })
    return
  }
  addStepGoalId.value = null
  uni.showToast({ title: '已添加', icon: 'success' })
}

const onRemoveGoal = (id: string) => {
  uni.showModal({
    title: '删除',
    content: '确定删除该目标？',
    success: (res) => {
      if (res.confirm) store.removeGoal(id)
    },
  })
}
</script>

<style lang="scss" scoped>
@import '../styles/subpage.scss';

.goal-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(245, 158, 11, 0.1);
}

.goal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.goal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a2e;
  flex: 1;
}

.goal-pct {
  font-size: 32rpx;
  font-weight: 800;
  color: #f59e0b;
}

.progress-track {
  height: 12rpx;
  background: #fef3c7;
  border-radius: 6rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  border-radius: 6rpx;
}

.step-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 0;
}

.check-circle {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 3rpx solid #fcd34d;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.check-circle--done {
  background: #f59e0b;
  border-color: #f59e0b;
}

.check-mark {
  font-size: 20rpx;
  color: #fff;
  font-weight: 700;
}

.step-title {
  font-size: 28rpx;
  color: #333;
}

.step-title--done {
  text-decoration: line-through;
  color: #999;
}

.goal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16rpx;
  padding-top: 12rpx;
  border-top: 1rpx solid #f0f0f5;
}

.goal-link {
  font-size: 26rpx;
  color: #f59e0b;
  font-weight: 600;
}

.goal-del {
  font-size: 24rpx;
  color: #ef4444;
}
</style>
