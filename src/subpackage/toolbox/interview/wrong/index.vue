<template>
  <view class="page">
    <PageHeader title="错题本" tone="soft" />
    <scroll-view class="scroll" scroll-y>
      <view class="bank-switch">
        <view class="bank-chip" v-for="item in store.banks" :key="item.id" :class="{ active: item.id === store.activeBankId }" @tap="switchBank(item.id)">
          {{ item.name }}
        </view>
      </view>
      <view class="list">
        <view v-for="item in store.wrongQuestions" :key="item.id" class="card">
          <view class="card-main" @tap="openPractice(item.id)">
            <text class="title">{{ item.title }}</text>
            <text class="meta">{{ item.type === 'choice' ? '选择题' : '问答题' }} · {{ item.tags.join(' / ') }}</text>
          </view>
          <view class="actions">
            <view class="btn ghost" @tap="openPractice(item.id)">重练</view>
            <view class="btn ghost" @tap.stop="store.removeFromWrongBook(item.id)">移除</view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import PageHeader from '../../shiguangxu/components/PageHeader.vue'
import { useInterviewStore } from '@/store/interview'

const store = useInterviewStore()

onShow(() => {
  void store.init()
})

function switchBank(bankId: string) {
  void store.setActiveBank(bankId)
}

function openPractice(questionId: string) {
  store.pickQuestion(questionId)
  uni.navigateTo({ url: '/subpackage/toolbox/interview/practice/index' })
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; background: #f7f4ec; }
.scroll { height: calc(100vh - 88rpx); padding: 0 24rpx 32rpx; box-sizing: border-box; }
.bank-switch { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 12rpx; }
.bank-chip { height: 64rpx; padding: 0 16rpx; border-radius: 18rpx; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 8rpx 24rpx rgba(16,35,63,.08); font-size: 22rpx; color: #314156; }
.active { background: #10233f; color: #fff; }
.list { margin-top: 16rpx; display: grid; gap: 14rpx; }
.card { padding: 18rpx; border-radius: 22rpx; background: #fff; box-shadow: 0 10rpx 30rpx rgba(16,35,63,.08); }
.card-main { padding-bottom: 12rpx; }
.title { display: block; font-size: 28rpx; font-weight: 800; color: #10233f; line-height: 1.4; }
.meta { display: block; margin-top: 8rpx; font-size: 22rpx; color: #667085; }
.actions { display: flex; gap: 10rpx; }
.btn { height: 56rpx; padding: 0 14rpx; border-radius: 16rpx; display: flex; align-items: center; justify-content: center; background: #f3f6fb; color: #314156; font-size: 22rpx; font-weight: 700; }
.ghost { background: #f3f6fb; }
</style>
