<template>
  <view class="sgx-page" :class="{ 'sgx-page--dark': userStore.isDark }">
    <PageHeader title="时间统计" />

    <scroll-view class="page-scroll" scroll-y>
      <view class="stat-card">
        <text class="stat-card-title">待办完成率</text>
        <view class="ring-wrap">
          <text class="ring-num">{{ store.todoCompletionRate }}%</text>
          <text class="ring-sub">共 {{ store.todos.length }} 项 · 已完成 {{ store.doneTodos.length }}</text>
        </view>
      </view>

      <view class="stat-card">
        <text class="stat-card-title">待办分类分布</text>
        <StatBars :slices="store.todoCategoryStats" />
      </view>

      <view class="stat-card">
        <text class="stat-card-title">支出分类（金额）</text>
        <StatBars :slices="store.billCategoryStats" value-suffix="元" />
      </view>

      <view class="stat-card stat-card--row">
        <view class="mini-stat">
          <text class="mini-label">本周习惯打卡</text>
          <text class="mini-value">{{ store.habitWeekChecks }} 次</text>
        </view>
        <view class="mini-stat">
          <text class="mini-label">今日番茄</text>
          <text class="mini-value">{{ store.pomodoroSessionsToday }} 个</text>
        </view>
      </view>

      <view class="stat-card">
        <text class="stat-card-title">本月收支</text>
        <view class="bill-summary">
          <view class="bill-sum-row">
            <text class="bill-sum-label">收入</text>
            <text class="bill-sum-in">¥{{ monthBill.income.toFixed(2) }}</text>
          </view>
          <view class="bill-sum-row">
            <text class="bill-sum-label">支出</text>
            <text class="bill-sum-out">¥{{ monthBill.expense.toFixed(2) }}</text>
          </view>
          <view class="bill-sum-row bill-sum-row--balance">
            <text class="bill-sum-label">结余</text>
            <text class="bill-sum-balance">¥{{ balance.toFixed(2) }}</text>
          </view>
        </view>
      </view>

      <view style="height: 48rpx;" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/store/user'
import { useShiguangxuStore } from '@/store/shiguangxu'
import PageHeader from '../components/PageHeader.vue'
import StatBars from '../components/StatBars.vue'

const userStore = useUserStore()
const store = useShiguangxuStore()
const monthBill = computed(() => store.monthBillSummary)
const balance = computed(() => monthBill.value.income - monthBill.value.expense)
</script>

<style lang="scss" scoped>
@import '../styles/subpage.scss';

.stat-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(91, 33, 182, 0.08);
}

.stat-card-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 24rpx;
}

.ring-wrap {
  text-align: center;
  padding: 16rpx 0;
}

.ring-num {
  display: block;
  font-size: 72rpx;
  font-weight: 800;
  color: #8b5cf6;
  line-height: 1.1;
}

.ring-sub {
  font-size: 24rpx;
  color: #999;
  margin-top: 12rpx;
}

.stat-card--row {
  display: flex;
  gap: 20rpx;
}

.mini-stat {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  background: #f5f3ff;
  border-radius: 16rpx;
}

.mini-label {
  display: block;
  font-size: 24rpx;
  color: #888;
  margin-bottom: 8rpx;
}

.mini-value {
  font-size: 36rpx;
  font-weight: 800;
  color: #7c3aed;
}

.bill-summary {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.bill-sum-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bill-sum-label {
  font-size: 28rpx;
  color: #666;
}

.bill-sum-in {
  font-size: 32rpx;
  font-weight: 700;
  color: #10b981;
}

.bill-sum-out {
  font-size: 32rpx;
  font-weight: 700;
  color: #ef4444;
}

.bill-sum-balance {
  font-size: 36rpx;
  font-weight: 800;
  color: #8b5cf6;
}

.bill-sum-row--balance {
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f5;
}

.sgx-page--dark .stat-card,
.sgx-page--dark .mini-stat {
  background: rgba(30, 28, 58, 0.95);
  border: 1rpx solid #2e2c50;
}

.sgx-page--dark .stat-card-title {
  color: #e0deff;
}
</style>
