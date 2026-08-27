<template>
  <view class="page">
    <PageHeader :title="bank?.name || '题库详情'" tone="soft" />
    <scroll-view class="scroll" scroll-y>
      <view class="head">
        <text class="desc">{{ bank?.description }}</text>
        <view class="actions">
          <view class="btn btn--primary" @tap="openForm">
            <text class="btn-text">新增题目</text>
          </view>
        </view>
      </view>

      <view class="toolbar">
        <input v-model="keyword" class="search-input" placeholder="关键字搜索题目" placeholder-class="ph" />
      </view>

      <view class="list">
        <view v-for="item in pageItems" :key="item.id" class="item">
          <view class="item-main" @tap="openForm(item.id)">
            <text class="item-title">{{ item.title }}</text>
            <text class="item-meta">{{ item.type === 'choice' ? '选择题' : '问答题' }} · {{ item.tags.join(' / ') }}</text>
            <text class="item-answer" v-if="item.type === 'qa'">{{ item.answerText }}</text>
          </view>
          <view class="item-actions">
            <view class="mini-btn" @tap.stop="removeQuestion(item.id)">
              <text class="mini-btn-text">删除</text>
            </view>
          </view>
        </view>
      </view>

      <view class="pager">
        <view class="pager-btn" @tap="prevPage"><text class="pager-text">上一页</text></view>
        <text class="pager-meta">第 {{ page }} / {{ totalPages }} 页</text>
        <view class="pager-btn" @tap="nextPage"><text class="pager-text">下一页</text></view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import PageHeader from '../../shiguangxu/components/PageHeader.vue'
import { useInterviewStore } from '@/store/interview'

const store = useInterviewStore()
const bankId = ref('')
const page = ref(1)
const pageSize = 8
const keyword = ref('')

const bank = computed(() => store.banks.find((item) => item.id === bankId.value))

const allItems = computed(() => store.questionBankMap[bankId.value] || [])
const filtered = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return allItems.value
  return allItems.value.filter((item) => [item.title, item.analysis, item.answerText, item.tags.join(' ')].join(' ').toLowerCase().includes(q))
})
const totalPages = computed(() => Math.max(Math.ceil(filtered.value.length / pageSize), 1))
const pageItems = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

watch(keyword, () => { page.value = 1 })
watch(filtered, () => { if (page.value > totalPages.value) page.value = totalPages.value })

onLoad((query = {}) => {
  bankId.value = typeof query.bankId === 'string' ? query.bankId : ''
})

onShow(() => {
  void store.init().then(() => {
    if (bankId.value) {
      void store.setActiveBank(bankId.value)
    }
  })
})

function openForm(questionId = '') {
  uni.navigateTo({ url: `/subpackage/toolbox/interview/question-form/index?bankId=${bankId.value}${questionId ? `&questionId=${questionId}` : ''}` })
}

function removeQuestion(questionId: string) {
  uni.showModal({
    title: '删除题目',
    content: '确认删除这道题吗？',
    success: (res) => {
      if (!res.confirm) return
      void store.deleteQuestion(questionId)
    },
  })
}

function prevPage() {
  page.value = Math.max(page.value - 1, 1)
}

function nextPage() {
  page.value = Math.min(page.value + 1, totalPages.value)
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; background: #f7f4ec; }
.scroll { height: calc(100vh - 88rpx); padding: 0 24rpx 32rpx; box-sizing: border-box; }
.head { margin-top: 12rpx; padding: 22rpx; border-radius: 24rpx; background: #fff; box-shadow: 0 8rpx 24rpx rgba(16,35,63,.08); }
.desc { display: block; font-size: 24rpx; color: #667085; line-height: 1.5; }
.actions { margin-top: 14rpx; display: flex; gap: 12rpx; }
.btn { height: 72rpx; display: flex; align-items: center; justify-content: center; border-radius: 18rpx; padding: 0 18rpx; background: #10233f; }
.btn-text { color: #fff; font-weight: 800; }
.toolbar { margin-top: 16rpx; }
.search-input { width: 100%; height: 84rpx; padding: 0 20rpx; border-radius: 20rpx; background: #fff; box-sizing: border-box; }
.list { margin-top: 16rpx; display: grid; gap: 14rpx; }
.item { padding: 18rpx; border-radius: 22rpx; background: #fff; box-shadow: 0 8rpx 24rpx rgba(16,35,63,.08); display: flex; justify-content: space-between; gap: 12rpx; }
.item-main { flex: 1; min-width: 0; }
.item-title { display: block; font-size: 28rpx; font-weight: 800; color: #10233f; }
.item-meta, .item-answer { display: block; margin-top: 8rpx; font-size: 22rpx; color: #667085; line-height: 1.45; }
.item-actions { flex-shrink: 0; display: flex; align-items: flex-start; }
.mini-btn { height: 56rpx; padding: 0 14rpx; border-radius: 16rpx; background: #f3f6fb; display: flex; align-items: center; justify-content: center; }
.mini-btn-text { font-size: 22rpx; font-weight: 700; color: #314156; }
.pager { display: flex; align-items: center; justify-content: space-between; margin-top: 16rpx; }
.pager-btn { height: 64rpx; padding: 0 18rpx; border-radius: 18rpx; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 8rpx 24rpx rgba(16,35,63,.08); }
.pager-text, .pager-meta { font-size: 22rpx; color: #314156; font-weight: 700; }
</style>
