<template>
  <view class="page">
    <PageHeader title="题库" tone="soft" />
    <scroll-view class="scroll" scroll-y>
      <view class="toolbar">
        <view class="search-box">
          <input v-model="keyword" class="search-input" placeholder="搜索题库名称或说明" placeholder-class="ph" />
        </view>
        <view class="toolbar-actions">
          <view class="btn btn--primary" @tap="openBankForm">
            <text class="btn-text">新建题库</text>
          </view>
        </view>
      </view>

      <view class="bank-list">
        <view
          v-for="bank in filteredBanks"
          :key="bank.id"
          class="bank-card"
          @tap="openBank(bank.id)"
        >
          <view class="bank-main">
            <view class="bank-badge" :style="{ background: bank.color }">
              <text class="bank-badge-text">{{ bank.name.slice(0, 1) }}</text>
            </view>
            <view class="bank-copy">
              <text class="bank-name">{{ bank.name }}</text>
              <text class="bank-desc">{{ bank.description }}</text>
              <text class="bank-meta">共 {{ bank.questionCount }} 题</text>
            </view>
          </view>
          <view class="bank-actions">
            <view class="mini-btn" @tap.stop="removeBank(bank.id)">
              <text class="mini-btn-text">删除</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import PageHeader from '../../shiguangxu/components/PageHeader.vue'
import { useInterviewStore } from '@/store/interview'

const store = useInterviewStore()
const keyword = ref('')

const filteredBanks = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return store.banks
  return store.banks.filter((bank) => {
    return [bank.name, bank.description, bank.id].join(' ').toLowerCase().includes(q)
  })
})

onShow(() => {
  void store.init()
})

function openBank(id: string) {
  uni.navigateTo({ url: `/subpackage/toolbox/interview/bank/index?bankId=${id}` })
}

function openBankForm() {
  uni.navigateTo({ url: '/subpackage/toolbox/interview/question-form/index' })
}

function removeBank(id: string) {
  uni.showModal({
    title: '删除题库',
    content: '题库和题目都会一起删除，确认继续吗？',
    success: (res) => {
      if (!res.confirm) return
      void store.deleteBank(id)
    },
  })
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; background: #f7f4ec; }
.scroll { height: calc(100vh - 88rpx); padding: 0 24rpx 32rpx; box-sizing: border-box; }
.toolbar { display: grid; gap: 14rpx; margin-top: 12rpx; }
.search-box, .toolbar-actions { display: flex; gap: 12rpx; }
.search-input { width: 100%; height: 84rpx; padding: 0 20rpx; border-radius: 20rpx; background: #fff; box-sizing: border-box; }
.btn { height: 80rpx; display: flex; align-items: center; justify-content: center; border-radius: 18rpx; padding: 0 18rpx; background: #10233f; }
.btn-text { color: #fff; font-weight: 800; }
.bank-list { margin-top: 16rpx; display: grid; gap: 14rpx; }
.bank-card { padding: 20rpx; border-radius: 24rpx; background: #fff; box-shadow: 0 8rpx 24rpx rgba(16,35,63,.08); display: flex; justify-content: space-between; gap: 12rpx; }
.bank-main { display: flex; gap: 16rpx; min-width: 0; flex: 1; }
.bank-badge { width: 72rpx; height: 72rpx; border-radius: 20rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.bank-badge-text { color: #fff; font-size: 28rpx; font-weight: 800; }
.bank-copy { min-width: 0; }
.bank-name { display: block; font-size: 30rpx; font-weight: 800; color: #10233f; }
.bank-desc, .bank-meta { display: block; margin-top: 8rpx; font-size: 22rpx; color: #667085; line-height: 1.4; }
.mini-btn { display: flex; align-items: center; justify-content: center; height: 56rpx; padding: 0 14rpx; border-radius: 16rpx; background: #f3f6fb; }
.mini-btn-text { font-size: 22rpx; font-weight: 700; color: #314156; }
</style>
