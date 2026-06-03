<template>
  <view class="sgx-page" :class="{ 'sgx-page--dark': userStore.isDark }">
    <PageHeader title="倒数纪念日">
      <template #right>
        <text class="header-action" @tap="showAdd = true">添加</text>
      </template>
    </PageHeader>

    <scroll-view class="page-scroll" scroll-y>
      <view v-for="item in store.countdowns" :key="item.id" class="cd-card">
        <text class="cd-emoji">{{ item.icon }}</text>
        <view class="cd-body">
          <text class="cd-title">{{ item.title }}</text>
          <text class="cd-date">{{ item.targetDate }}</text>
        </view>
        <view class="cd-days-wrap">
          <text class="cd-days-num">{{ formatDays(item.targetDate) }}</text>
          <text class="cd-days-unit">{{ daysUnit(item.targetDate) }}</text>
        </view>
        <text class="cd-del" @tap="onRemove(item.id)">×</text>
      </view>

      <view v-if="!store.countdowns.length" class="empty-block">
        <text class="empty-emoji">🎉</text>
        <text class="empty-text">添加生日、节日或纪念日</text>
      </view>
      <view style="height: 120rpx;" />
    </scroll-view>

    <view v-if="showAdd" class="add-mask" @tap="showAdd = false">
      <view class="add-panel" @tap.stop>
        <text class="add-title">新建倒数日</text>
        <input
          v-model="newTitle"
          class="add-input"
          placeholder="事件名称，如：生日"
          placeholder-style="color:#B8BCC8"
        />
        <picker mode="date" :value="newDate" @change="onDateChange">
          <view class="date-picker">
            <text class="date-label">目标日期</text>
            <text class="date-value">{{ newDate }}</text>
          </view>
        </picker>
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
import { useShiguangxuStore, daysUntil } from '@/store/shiguangxu'
import PageHeader from '../components/PageHeader.vue'

const userStore = useUserStore()
const store = useShiguangxuStore()

const showAdd = ref(false)
const newTitle = ref('')
const newDate = ref('2026-12-31')

const formatDays = (targetDate: string) => {
  const d = daysUntil(targetDate)
  if (d > 0) return String(d)
  if (d === 0) return '今天'
  return String(Math.abs(d))
}

const daysUnit = (targetDate: string) => {
  const d = daysUntil(targetDate)
  if (d > 0) return '天后'
  if (d === 0) return ''
  return '天前'
}

const onDateChange = (e: { detail: { value: string } }) => {
  newDate.value = e.detail.value
}

const submitAdd = () => {
  if (!store.addCountdown(newTitle.value, newDate.value)) {
    uni.showToast({ title: '请填写完整', icon: 'none' })
    return
  }
  newTitle.value = ''
  showAdd.value = false
  uni.showToast({ title: '已添加', icon: 'success' })
}

const onRemove = (id: string) => {
  uni.showModal({
    title: '删除',
    content: '确定删除该倒数日？',
    success: (res) => {
      if (res.confirm) store.removeCountdown(id)
    },
  })
}
</script>

<style lang="scss" scoped>
@import '../styles/subpage.scss';
</style>
