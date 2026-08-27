<template>
  <view class="page">
    <PageHeader title="刷题" tone="soft" />
    <scroll-view class="scroll" scroll-y>
      <view class="mode-bar">
        <view class="mode-chip" :class="{ active: mode === 'ordered' }" @tap="setMode('ordered')">顺序刷题</view>
        <view class="mode-chip" :class="{ active: mode === 'random' }" @tap="setMode('random')">随机刷题</view>
      </view>

      <view class="bank-switch">
        <view class="bank-chip" v-for="item in store.banks" :key="item.id" :class="{ active: item.id === store.activeBankId }" @tap="switchBank(item.id)">
          {{ item.name }}
        </view>
      </view>

      <view class="card" v-if="current">
        <text class="index">第 {{ store.currentQuestionIndex + 1 }} 题 / {{ store.totalCount }}</text>
        <text class="title">{{ current.title }}</text>
        <view class="tags" v-if="current.tags.length">
          <text class="tag" v-for="tag in current.tags" :key="tag">{{ tag }}</text>
        </view>

        <view v-if="current.type === 'choice'" class="options">
          <view class="option" v-for="(option, index) in current.options" :key="index" @tap="selectOption(index)" :class="{ selected: selected === index }">
            <text class="badge">{{ labels[index] }}</text>
            <text class="option-text">{{ option }}</text>
          </view>
        </view>

        <view v-else class="qa-box">
          <textarea v-model="answerText" class="answer" placeholder="输入你的答案" />
        </view>

        <view class="actions">
          <view class="btn ghost" @tap="store.prevQuestion">上一题</view>
          <view class="btn primary" @tap="submit">提交</view>
          <view class="btn ghost" @tap="store.nextQuestion">下一题</view>
        </view>

        <view v-if="store.feedback" class="feedback">
          <text class="feedback-title">{{ store.isCorrect ? '答对了' : '答错了' }}</text>
          <text class="feedback-text">{{ store.feedback }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import PageHeader from '../../shiguangxu/components/PageHeader.vue'
import { useInterviewStore, type PracticeMode } from '@/store/interview'

const store = useInterviewStore()
const selected = ref<number | null>(null)
const answerText = ref('')

const current = computed(() => store.currentQuestion)
const mode = computed(() => store.practiceMode)
const labels = ['A', 'B', 'C', 'D']

onShow(() => {
  void store.init()
})

function setMode(value: PracticeMode) {
  store.setPracticeMode(value)
}

async function switchBank(bankId: string) {
  await store.setActiveBank(bankId)
  selected.value = null
  answerText.value = ''
}

function selectOption(index: number) {
  selected.value = index
}

function submit() {
  if (!current.value) return
  if (current.value.type === 'choice') {
    if (selected.value === null) {
      uni.showToast({ title: '先选一个答案', icon: 'none' })
      return
    }
    store.submitAnswer(selected.value)
    return
  }
  store.setManualAnswer(answerText.value)
  store.submitAnswer()
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; background: #f7f4ec; }
.scroll { height: calc(100vh - 88rpx); padding: 0 24rpx 32rpx; box-sizing: border-box; }
.mode-bar, .bank-switch { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 12rpx; }
.mode-chip, .bank-chip { height: 64rpx; padding: 0 16rpx; border-radius: 18rpx; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 8rpx 24rpx rgba(16,35,63,.08); font-size: 22rpx; color: #314156; }
.active { background: #10233f; color: #fff; }
.card { margin-top: 16rpx; padding: 24rpx; border-radius: 24rpx; background: #fff; box-shadow: 0 10rpx 30rpx rgba(16,35,63,.08); }
.index { display: block; font-size: 22rpx; color: #7a8699; }
.title { display: block; margin-top: 10rpx; font-size: 32rpx; line-height: 1.35; font-weight: 800; color: #10233f; }
.tags { display: flex; flex-wrap: wrap; gap: 8rpx; margin-top: 12rpx; }
.tag { padding: 6rpx 10rpx; border-radius: 999rpx; background: #eef4ff; font-size: 20rpx; color: #49658f; }
.options { margin-top: 16rpx; display: grid; gap: 12rpx; }
.option { display: flex; gap: 12rpx; padding: 16rpx; border-radius: 18rpx; background: #f8fafc; }
.selected { background: #eff4ff; border: 1rpx solid #6b8cff; }
.badge { width: 40rpx; height: 40rpx; border-radius: 50%; background: #10233f; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 22rpx; font-weight: 800; flex-shrink: 0; }
.option-text { font-size: 24rpx; line-height: 1.5; color: #243043; }
.qa-box { margin-top: 16rpx; }
.answer { width: 100%; min-height: 180rpx; padding: 16rpx; border-radius: 18rpx; background: #f8fafc; box-sizing: border-box; }
.actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10rpx; margin-top: 16rpx; }
.btn { height: 72rpx; border-radius: 18rpx; display: flex; align-items: center; justify-content: center; font-weight: 800; }
.ghost { background: #f3f6fb; color: #314156; }
.primary { background: #10233f; color: #fff; }
.feedback { margin-top: 16rpx; padding: 16rpx; border-radius: 18rpx; background: #f8fafc; }
.feedback-title { display: block; font-size: 24rpx; font-weight: 800; color: #10233f; }
.feedback-text { display: block; margin-top: 8rpx; font-size: 22rpx; color: #667085; line-height: 1.5; }
</style>
