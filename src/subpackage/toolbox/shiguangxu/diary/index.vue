<template>
  <view class="sgx-page" :class="{ 'sgx-page--dark': userStore.isDark }">
    <PageHeader title="日记">
      <template #right>
        <text class="header-action" @tap="openEditor()">写日记</text>
      </template>
    </PageHeader>

    <scroll-view class="page-scroll" scroll-y>
      <view
        v-for="entry in store.diaries"
        :key="entry.id"
        class="diary-card"
        @tap="openEditor(entry.id, entry.title, entry.content, entry.mood)"
      >
        <view class="diary-head">
          <text class="diary-mood">{{ entry.mood }}</text>
          <text class="diary-date">{{ entry.date }}</text>
        </view>
        <text class="diary-title">{{ entry.title }}</text>
        <text class="diary-preview">{{ entry.content }}</text>
        <text class="diary-del" @tap.stop="onRemove(entry.id)">删除</text>
      </view>
      <view v-if="!store.diaries.length" class="empty-block">
        <text class="empty-emoji">📔</text>
        <text class="empty-text">记录生活，留下美好回忆</text>
      </view>
      <view style="height: 120rpx;" />
    </scroll-view>

    <view v-if="showEditor" class="add-mask" @tap="closeEditor">
      <view class="add-panel add-panel--tall" @tap.stop>
        <text class="add-title">{{ editingId ? '编辑日记' : '新建日记' }}</text>
        <view class="mood-row">
          <text
            v-for="m in moods"
            :key="m"
            class="mood-chip"
            :class="{ 'mood-chip--active': editorMood === m }"
            @tap="editorMood = m"
          >{{ m }}</text>
        </view>
        <input v-model="editorTitle" class="add-input" placeholder="标题" placeholder-style="color:#B8BCC8" />
        <textarea
          v-model="editorContent"
          class="memo-textarea"
          maxlength="2000"
          placeholder="正文…"
          placeholder-style="color:#B8BCC8"
        />
        <picker mode="date" :value="editorDate" @change="onDateChange">
          <view class="date-picker">
            <text class="date-label">日期</text>
            <text class="date-value">{{ editorDate }}</text>
          </view>
        </picker>
        <view class="add-actions">
          <view class="add-btn add-btn--ghost" @tap="closeEditor"><text>取消</text></view>
          <view class="add-btn add-btn--primary" @tap="submitDiary"><text>保存</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useShiguangxuStore, DIARY_MOODS } from '@/store/shiguangxu'
import { todayStr } from '@/utils/sgxDate'
import PageHeader from '../components/PageHeader.vue'

const userStore = useUserStore()
const store = useShiguangxuStore()
const moods = DIARY_MOODS

const showEditor = ref(false)
const editingId = ref<string | null>(null)
const editorTitle = ref('')
const editorContent = ref('')
const editorMood = ref<string>(DIARY_MOODS[0])
const editorDate = ref(todayStr())

const openEditor = (id?: string, title?: string, content?: string, mood?: string) => {
  editingId.value = id ?? null
  editorTitle.value = title ?? ''
  editorContent.value = content ?? ''
  editorMood.value = mood ?? DIARY_MOODS[0]
  editorDate.value = todayStr()
  showEditor.value = true
}

const closeEditor = () => {
  showEditor.value = false
}

const onDateChange = (e: { detail: { value: string } }) => {
  editorDate.value = e.detail.value
}

const submitDiary = () => {
  if (editingId.value) {
    if (!store.updateDiary(editingId.value, editorTitle.value, editorContent.value, editorMood.value)) {
      uni.showToast({ title: '请填写标题和正文', icon: 'none' })
      return
    }
  } else if (!store.addDiary(editorTitle.value, editorContent.value, editorMood.value, editorDate.value)) {
    uni.showToast({ title: '请填写标题和正文', icon: 'none' })
    return
  }
  closeEditor()
  uni.showToast({ title: '已保存', icon: 'success' })
}

const onRemove = (id: string) => {
  uni.showModal({
    title: '删除',
    content: '确定删除这篇日记？',
    success: (res) => {
      if (res.confirm) store.removeDiary(id)
    },
  })
}
</script>

<style lang="scss" scoped>
@import '../styles/subpage.scss';

.diary-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  position: relative;
}

.diary-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.diary-mood {
  font-size: 40rpx;
}

.diary-date {
  font-size: 24rpx;
  color: #999;
}

.diary-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 12rpx;
}

.diary-preview {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
}

.diary-del {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  font-size: 24rpx;
  color: #ef4444;
}

.mood-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.mood-chip {
  font-size: 40rpx;
  padding: 8rpx;
  border-radius: 12rpx;
  opacity: 0.5;
}

.mood-chip--active {
  opacity: 1;
  background: #ffedd5;
}

.memo-textarea {
  width: 100%;
  min-height: 240rpx;
  background: #f5f3ff;
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  margin-bottom: 16rpx;
}

.add-panel--tall {
  max-height: 80vh;
  overflow-y: auto;
}
</style>
