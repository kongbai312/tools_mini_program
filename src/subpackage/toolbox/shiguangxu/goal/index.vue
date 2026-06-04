<template>
  <view class="sgx-page" :class="{ 'sgx-page--dark': userStore.isDark }">
    <view class="goal-top">
      <PageHeader title="目标管理" tone="soft">
        <template #right>
          <view class="add-pill" @tap="openAddGoal">
            <text class="add-pill-icon">+</text>
            <text class="add-pill-text">添加</text>
          </view>
        </template>
      </PageHeader>
    </view>

    <scroll-view class="page-scroll" scroll-y>
      <view
        v-for="goal in store.goals"
        :key="goal.id"
        class="goal-card"
        :style="{ boxShadow: `0 8rpx 24rpx ${colorAlpha(goal.color, 0.14)}` }"
      >
        <view class="goal-head">
          <view class="goal-title-wrap">
            <view class="goal-color-dot" :style="{ background: goal.color }" />
            <text class="goal-title">{{ goal.title }}</text>
          </view>
          <text class="goal-pct" :style="{ color: goal.color }">{{ progress(goal) }}%</text>
        </view>
        <view class="progress-track" :style="{ background: colorAlpha(goal.color, 0.18) }">
          <view
            class="progress-fill"
            :style="{ width: progress(goal) + '%', background: goal.color }"
          />
        </view>
        <view v-for="step in goal.steps" :key="step.id" class="step-row">
          <view
            class="check-circle check-circle--sm"
            :style="stepCircleStyle(goal.color, step.done)"
            @tap="store.toggleGoalStep(goal.id, step.id)"
          >
            <text v-if="step.done" class="check-mark">✓</text>
          </view>
          <text class="step-title" :class="{ 'step-title--done': step.done }">{{ step.title }}</text>
        </view>
        <view class="goal-actions">
          <text class="goal-link" :style="{ color: goal.color }" @tap="openAddStep(goal.id)">+ 添加步骤</text>
          <text class="goal-del" @tap="onRemoveGoal(goal.id)">删除目标</text>
        </view>
      </view>
      <view v-if="!store.goals.length" class="empty-block">
        <text class="empty-emoji">🎯</text>
        <text class="empty-text">立下目标，拆解步骤更容易实现</text>
      </view>
      <view style="height: 120rpx;" />
    </scroll-view>

    <view v-if="showAddGoal" class="add-mask" @tap="closeAddGoal">
      <view class="add-panel add-panel--tall" @tap.stop>
        <text class="add-title">新建目标</text>
        <scroll-view class="add-panel-scroll" scroll-y>
          <input
            v-model="newGoalTitle"
            class="add-input"
            placeholder="目标名称"
            placeholder-style="color:#B8BCC8"
          />
          <text class="add-label">目标颜色</text>
          <view class="color-mode-row">
            <view
              class="color-mode-chip"
              :class="{ 'color-mode-chip--active': colorMode === 'default' }"
              @tap="colorMode = 'default'"
            >
              <text class="color-mode-chip-text">默认</text>
            </view>
            <view
              class="color-mode-chip"
              :class="{ 'color-mode-chip--active': colorMode === 'custom' }"
              @tap="colorMode = 'custom'"
            >
              <text class="color-mode-chip-text">自定义</text>
            </view>
          </view>
          <text v-if="colorMode === 'default'" class="color-hint">
            每次添加自动分配不同颜色，与已有目标尽量不重复
          </text>
          <RgbColorPicker v-else v-model="newGoalColor" />
          <text class="add-label">步骤（可选，可添加多条）</text>
          <view v-for="(_, idx) in draftSteps" :key="idx" class="step-draft-row">
            <input
              v-model="draftSteps[idx]"
              class="add-input step-draft-input"
              :placeholder="`步骤 ${idx + 1}`"
              placeholder-style="color:#B8BCC8"
            />
            <text
              v-if="draftSteps.length > 1"
              class="step-draft-del"
              @tap="removeDraftStep(idx)"
            >×</text>
          </view>
          <view class="step-draft-add" @tap="addDraftStep">
            <text class="step-draft-add-text">+ 添加步骤</text>
          </view>
        </scroll-view>
        <view class="add-actions">
          <view class="add-btn add-btn--ghost" @tap="closeAddGoal"><text>取消</text></view>
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
import { colorAlpha } from '@/utils/color'
import PageHeader from '../components/PageHeader.vue'
import RgbColorPicker from '../components/RgbColorPicker.vue'

const userStore = useUserStore()
const store = useShiguangxuStore()
const progress = goalProgress
type GoalColorMode = 'default' | 'custom'

const showAddGoal = ref(false)
const newGoalTitle = ref('')
const colorMode = ref<GoalColorMode>('default')
const newGoalColor = ref('#8B5CF6')
const draftSteps = ref<string[]>([''])
const addStepGoalId = ref<string | null>(null)
const newStepTitle = ref('')

function stepCircleStyle(color: string, done: boolean) {
  if (done) {
    return { background: color, borderColor: color }
  }
  return { borderColor: color, background: 'transparent' }
}

const openAddGoal = () => {
  newGoalTitle.value = ''
  colorMode.value = 'default'
  newGoalColor.value = '#8B5CF6'
  draftSteps.value = ['']
  showAddGoal.value = true
}

const closeAddGoal = () => {
  showAddGoal.value = false
}

const addDraftStep = () => {
  draftSteps.value.push('')
}

const removeDraftStep = (idx: number) => {
  if (draftSteps.value.length <= 1) return
  draftSteps.value.splice(idx, 1)
}

const submitGoal = () => {
  const color = colorMode.value === 'custom' ? newGoalColor.value : ''
  if (!store.addGoal(newGoalTitle.value, color, draftSteps.value)) {
    uni.showToast({ title: '请输入目标名称', icon: 'none' })
    return
  }
  closeAddGoal()
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

.goal-top {
  flex-shrink: 0;
  background: linear-gradient(180deg, #ede9fe 0%, #f5f3ff 55%, #f6f7fb 100%);
  padding-bottom: 8rpx;
}

.add-pill {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 10rpx 22rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  box-shadow: 0 6rpx 16rpx rgba(139, 92, 246, 0.35);
  flex-shrink: 0;
  margin-left: auto;
}

.add-pill-icon {
  font-size: 28rpx;
  color: #fff;
  font-weight: 700;
  line-height: 1;
}

.add-pill-text {
  font-size: 26rpx;
  color: #fff;
  font-weight: 600;
}

.goal-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}

.goal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.goal-title-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex: 1;
  min-width: 0;
}

.goal-color-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.goal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a2e;
  flex: 1;
  min-width: 0;
}

.goal-pct {
  font-size: 32rpx;
  font-weight: 800;
  flex-shrink: 0;
  margin-left: 12rpx;
}

.progress-track {
  height: 12rpx;
  border-radius: 6rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.25s ease;
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
  box-sizing: border-box;
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
  font-weight: 600;
}

.goal-del {
  font-size: 24rpx;
  color: #ef4444;
}

.add-panel--tall {
  max-height: 82vh;
  display: flex;
  flex-direction: column;
}

.add-panel-scroll {
  flex: 1;
  max-height: 56vh;
  margin-bottom: 8rpx;
}

.add-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
  display: block;
}

.color-mode-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.color-mode-chip {
  flex: 1;
  height: 72rpx;
  border-radius: 16rpx;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid transparent;
  box-sizing: border-box;
}

.color-mode-chip--active {
  background: #f5f3ff;
  border-color: #8b5cf6;
}

.color-mode-chip-text {
  font-size: 28rpx;
  color: #6b7280;
}

.color-mode-chip--active .color-mode-chip-text {
  color: #7c3aed;
  font-weight: 600;
}

.color-hint {
  font-size: 22rpx;
  color: #9ca3af;
  line-height: 1.5;
  margin-bottom: 20rpx;
  display: block;
}

.step-draft-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.step-draft-input {
  flex: 1;
  margin-bottom: 0;
}

.step-draft-del {
  font-size: 40rpx;
  color: #ccc;
  line-height: 1;
  padding: 0 8rpx;
  flex-shrink: 0;
}

.step-draft-add {
  margin-bottom: 24rpx;
}

.step-draft-add-text {
  font-size: 26rpx;
  color: #8b5cf6;
  font-weight: 600;
}

.sgx-page--dark .goal-card {
  background: rgba(30, 28, 58, 0.95);
  border: 1rpx solid #2e2c50;
}

.sgx-page--dark .goal-title {
  color: #e0deff;
}
</style>
