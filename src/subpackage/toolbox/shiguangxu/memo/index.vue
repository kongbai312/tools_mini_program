<template>
  <view class="sgx-page" :class="{ 'sgx-page--dark': userStore.isDark }">
    <PageHeader title="备忘录">
      <template #right>
        <text class="header-action" @tap="openAdd">添加</text>
      </template>
    </PageHeader>

    <scroll-view class="page-scroll" scroll-y>
      <view
        v-for="memo in store.memos"
        :key="memo.id"
        class="memo-card"
        @tap="openEdit(memo.id, memo.content)"
      >
        <text class="memo-content">{{ memo.content }}</text>
        <view class="memo-foot">
          <text class="memo-time">{{ formatTime(memo.updatedAt) }}</text>
          <text class="memo-del" @tap.stop="onRemove(memo.id)">删除</text>
        </view>
      </view>

      <view v-if="!store.memos.length" class="empty-block">
        <text class="empty-emoji">📝</text>
        <text class="empty-text">记录灵感与笔记</text>
      </view>
      <view style="height: 120rpx;" />
    </scroll-view>

    <view v-if="showEditor" class="add-mask" @tap="closeEditor">
      <view class="add-panel add-panel--tall" @tap.stop>
        <text class="add-title">{{ editingId ? '编辑备忘' : '新建备忘' }}</text>
        <textarea
          v-model="editorContent"
          class="memo-textarea"
          maxlength="500"
          placeholder="写下你的想法…"
          placeholder-style="color:#B8BCC8"
        />
        <text class="memo-count">{{ editorContent.length }}/500</text>
        <view class="add-actions">
          <view class="add-btn add-btn--ghost" @tap="closeEditor"><text>取消</text></view>
          <view class="add-btn add-btn--primary" @tap="submitMemo"><text>保存</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useShiguangxuStore } from '@/store/shiguangxu'
import PageHeader from '../components/PageHeader.vue'

const userStore = useUserStore()
const store = useShiguangxuStore()

const showEditor = ref(false)
const editingId = ref<string | null>(null)
const editorContent = ref('')

const formatTime = (ts: number) => {
  const d = new Date(ts)
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  const h = `${d.getHours()}`.padStart(2, '0')
  const min = `${d.getMinutes()}`.padStart(2, '0')
  return `${m}-${day} ${h}:${min}`
}

const openAdd = () => {
  editingId.value = null
  editorContent.value = ''
  showEditor.value = true
}

const openEdit = (id: string, content: string) => {
  editingId.value = id
  editorContent.value = content
  showEditor.value = true
}

const closeEditor = () => {
  showEditor.value = false
}

const submitMemo = () => {
  const text = editorContent.value.trim()
  if (!text) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }
  if (editingId.value) {
    if (!store.updateMemo(editingId.value, text)) {
      uni.showToast({ title: '保存失败', icon: 'none' })
      return
    }
  } else if (!store.addMemo(text)) {
    uni.showToast({ title: '保存失败', icon: 'none' })
    return
  }
  closeEditor()
  uni.showToast({ title: '已保存', icon: 'success' })
}

const onRemove = (id: string) => {
  uni.showModal({
    title: '删除',
    content: '确定删除该备忘？',
    success: (res) => {
      if (res.confirm) store.removeMemo(id)
    },
  })
}
</script>

<style lang="scss" scoped>
@import '../styles/subpage.scss';

.memo-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 6rpx 20rpx rgba(91, 33, 182, 0.06);
}

.memo-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  overflow: hidden;
}

.memo-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
  padding-top: 12rpx;
  border-top: 1rpx solid #f0f0f5;
}

.memo-time {
  font-size: 22rpx;
  color: #bbb;
}

.memo-del {
  font-size: 24rpx;
  color: #ef4444;
}

.add-panel--tall {
  max-height: 70vh;
}

.memo-textarea {
  width: 100%;
  min-height: 280rpx;
  background: #f5f3ff;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  margin-bottom: 8rpx;
}

.memo-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: #bbb;
  margin-bottom: 24rpx;
}

.sgx-page--dark .memo-card {
  background: rgba(30, 28, 58, 0.95);
  border: 1rpx solid #2e2c50;
}

.sgx-page--dark .memo-content {
  color: #e0deff;
}
</style>
