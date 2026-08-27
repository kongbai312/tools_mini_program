<template>
  <view class="income-page" :class="{ 'income-page--dark': userStore.isDark }">
    <view class="income-nav" :style="navStyle">
      <view class="income-nav-bar" :style="{ height: layout.navContentHeight + 'px' }">
        <view class="back-btn" @tap="goBack">
          <text class="back-icon">‹</text>
        </view>
        <text class="nav-title">收入记账</text>
        <view class="nav-right" :style="{ right: navRightGap + 'px' }">
        <view class="sync-btn" @tap="pullCloud">
          <text class="sync-text">{{ store.cloudLoading || store.cloudPulling ? '同步中' : '同步' }}</text>
        </view>
        </view>
      </view>
    </view>

    <scroll-view class="income-scroll" scroll-y>
      <view class="hero-card">
        <view class="hero-copy">
          <text class="hero-label">累计收入</text>
          <text class="hero-amount">¥{{ money(store.summary.total) }}</text>
          <text class="hero-sub">今日 {{ money(store.summary.day) }} · 本月 {{ money(store.summary.month) }}</text>
        </view>
        <view class="hero-badge">
          <text class="hero-badge-main">收</text>
          <text class="hero-badge-sub">{{ store.recentRecords.length }} 笔</text>
        </view>
      </view>

      <view class="overview-grid">
        <view class="overview-card">
          <text class="overview-label">今日</text>
          <text class="overview-value">¥{{ money(store.summary.day) }}</text>
        </view>
        <view class="overview-card">
          <text class="overview-label">本月</text>
          <text class="overview-value">¥{{ money(store.summary.month) }}</text>
        </view>
        <view class="overview-card">
          <text class="overview-label">本年</text>
          <text class="overview-value">¥{{ money(store.summary.year) }}</text>
        </view>
      </view>

      <view class="entry-card">
        <view class="card-head">
          <text class="card-title">快速记一笔</text>
          <text class="card-hint">保存后自动同步</text>
        </view>

        <view class="amount-field">
          <text class="currency">¥</text>
          <input
            v-model="amountText"
            class="amount-input"
            type="digit"
            placeholder="0.00"
            placeholder-class="placeholder"
          />
        </view>

        <view class="source-strip">
          <view
            v-for="item in sourceOptions"
            :key="item"
            class="source-chip"
            :class="{ 'source-chip--active': sourceText === item }"
            @tap="selectSource(item)"
          >
            <text class="source-chip-text">{{ item }}</text>
          </view>
        </view>

        <input
          v-model="sourceText"
          class="text-input"
          placeholder="收入来源，例如工资、兼职、项目"
          placeholder-class="placeholder"
        />

        <picker mode="date" :value="dateText" @change="onDateChange">
          <view class="date-row">
            <text class="date-label">收入日期</text>
            <text class="date-value">{{ dateText }}</text>
          </view>
        </picker>

        <textarea
          v-model="remarkText"
          class="remark-input"
          placeholder="备注，可不填"
          placeholder-class="placeholder"
          maxlength="60"
        />

        <view class="submit-btn" @tap="submitRecord">
          <text class="submit-text">保存收入</text>
        </view>
      </view>

      <view class="records-card">
        <view class="card-head">
          <text class="card-title">收入明细</text>
          <text class="card-hint">{{ store.recentRecords.length }} 笔记录</text>
        </view>

        <view v-if="store.recentRecords.length" class="record-list">
          <view v-for="item in store.recentRecords" :key="item.id" class="record-row">
            <view class="record-main">
              <view class="record-dot" />
              <view class="record-info">
                <view class="record-topline">
                  <text class="record-source">{{ item.source }}</text>
                  <text class="record-date">{{ item.date }}</text>
                </view>
                <text class="record-meta">{{ item.remark || '暂无备注' }}</text>
              </view>
            </view>
            <view class="record-side">
              <text class="record-amount">+¥{{ money(item.amount) }}</text>
              <text class="record-delete" @tap.stop="removeRecord(item.id)">删除</text>
            </view>
          </view>
        </view>

        <view v-else class="empty-block">
          <text class="empty-text">暂无收入记录</text>
        </view>
      </view>

      <view style="height: 56rpx;" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useIncomeStore } from '@/store/income'
import { useUserStore } from '@/store/user'
import { todayStr } from '@/utils/sgxDate'
import { useNavBarLayout } from '@/composables/useNavBarLayout'
import {
  normalizeIncomeAmount,
  validateIncomeRecordInput,
} from '@/utils/incomeCore'

const store = useIncomeStore()
const userStore = useUserStore()
const { layout, safeRightGap } = useNavBarLayout()
const sourceOptions = ['工资', '兼职', '项目', '奖金', '自定义']

const amountText = ref('')
const sourceText = ref('工资')
const remarkText = ref('')
const dateText = ref(todayStr())
const minSafeTop = uni.upx2px(88)
const navTopHeight = computed(() => Math.max(layout.value.statusBarHeight, minSafeTop))
const navStyle = computed(() => ({
  paddingTop: `${navTopHeight.value}px`,
}))
const navRightGap = computed(() => safeRightGap(24) + uni.upx2px(48))

onShow(() => {
  void store.syncFromCloud()
})

const money = (value: number) => value.toFixed(2)

const onDateChange = (event: { detail: { value: string } }) => {
  dateText.value = event.detail.value
}

const resetForm = () => {
  amountText.value = ''
  sourceText.value = '工资'
  remarkText.value = ''
  dateText.value = todayStr()
}

const selectSource = (source: string) => {
  sourceText.value = source === '自定义' ? '' : source
}

const goBack = () => {
  uni.navigateBack({
    fail() {
      uni.redirectTo({ url: '/subpackage/toolbox/shiguangxu/index' })
    },
  })
}

const submitRecord = () => {
  const error = validateIncomeRecordInput(amountText.value, dateText.value, sourceText.value)
  if (error) {
    uni.showToast({ title: error, icon: 'none' })
    return
  }

  store.addRecord(
    normalizeIncomeAmount(amountText.value),
    dateText.value,
    sourceText.value,
    remarkText.value,
  )
  resetForm()
  uni.showToast({ title: '已保存', icon: 'success', duration: 900 })
}

const removeRecord = (id: string) => {
  uni.showModal({
    title: '删除收入',
    content: '删除后会同步到云端，确认删除这笔记录？',
    confirmColor: '#F59E0B',
    success(res) {
      if (!res.confirm) return
      store.removeRecord(id)
      uni.showToast({ title: '已删除', icon: 'none', duration: 800 })
    },
  })
}

const pullCloud = async () => {
  const ok = await store.pullFromCloud()
  uni.showToast({
    title: ok ? '同步完成' : '当前环境无法同步',
    icon: 'none',
    duration: 900,
  })
}
</script>

<style lang="scss" scoped>
.income-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #fff7e6 0%, #f8fafc 44%, #f6f7fb 100%);
}

.income-nav {
  flex-shrink: 0;
  background: linear-gradient(180deg, #fff7e6 0%, #fffaf0 100%);
  box-sizing: border-box;
}

.income-nav-bar {
  position: relative;
  min-height: 88rpx;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.back-btn {
  position: absolute;
  left: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.86);
  border: 1rpx solid rgba(245, 158, 11, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 18rpx rgba(120, 53, 15, 0.08);
}

.back-icon {
  font-size: 44rpx;
  line-height: 1;
  color: #b45309;
  margin-top: -4rpx;
}

.nav-title {
  position: absolute;
  left: 104rpx;
  right: 250rpx;
  box-sizing: border-box;
  font-size: 32rpx;
  font-weight: 800;
  color: #92400e;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-right {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  align-items: center;
}

.sync-btn {
  min-width: 92rpx;
  height: 52rpx;
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 18rpx;
  box-sizing: border-box;
}

.sync-text {
  font-size: 24rpx;
  color: #b45309;
  font-weight: 700;
}

.income-scroll {
  flex: 1;
  padding: 0 24rpx 32rpx;
  box-sizing: border-box;
}

.hero-card {
  margin: 8rpx 8rpx 18rpx;
  padding: 30rpx 28rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  box-shadow: 0 16rpx 34rpx rgba(245, 158, 11, 0.24);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.hero-copy {
  flex: 1;
  min-width: 0;
}

.hero-label {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.84);
  margin-bottom: 8rpx;
}

.hero-amount {
  display: block;
  font-size: 52rpx;
  font-weight: 800;
  color: #fff;
  line-height: 1.12;
  word-break: break-all;
}

.hero-sub {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.86);
}

.hero-badge {
  width: 108rpx;
  height: 108rpx;
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.16);
  border: 1rpx solid rgba(255, 255, 255, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  flex-shrink: 0;
}

.hero-badge-main {
  font-size: 40rpx;
  color: #fff;
  font-weight: 800;
}

.hero-badge-sub {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.86);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14rpx;
  margin-bottom: 18rpx;
}

.overview-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 22rpx 16rpx;
  box-shadow: 0 8rpx 22rpx rgba(120, 53, 15, 0.06);
}

.overview-label {
  display: block;
  font-size: 22rpx;
  color: #9a6b35;
  margin-bottom: 8rpx;
}

.overview-value {
  display: block;
  font-size: 28rpx;
  font-weight: 800;
  color: #92400e;
  line-height: 1.2;
  word-break: break-all;
}

.entry-card,
.records-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(120, 53, 15, 0.07);
}

.card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 22rpx;
}

.card-title {
  display: block;
  font-size: 30rpx;
  color: #1a1a2e;
  font-weight: 800;
}

.card-hint {
  font-size: 22rpx;
  color: #9ca3af;
  flex-shrink: 0;
}

.amount-field {
  height: 100rpx;
  background: #fffbeb;
  border-radius: 20rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  margin-bottom: 18rpx;
}

.currency {
  font-size: 38rpx;
  color: #f59e0b;
  font-weight: 800;
  margin-right: 12rpx;
}

.amount-input {
  flex: 1;
  height: 100rpx;
  font-size: 42rpx;
  color: #111827;
  font-weight: 800;
}

.source-strip {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  margin-bottom: 16rpx;
}

.source-chip {
  height: 52rpx;
  border-radius: 26rpx;
  padding: 0 20rpx;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.source-chip--active {
  background: #f59e0b;
}

.source-chip-text {
  font-size: 23rpx;
  color: #6b7280;
}

.source-chip--active .source-chip-text {
  color: #fff;
  font-weight: 700;
}

.text-input,
.date-row {
  height: 78rpx;
  background: #f8fafc;
  border-radius: 18rpx;
  padding: 0 22rpx;
  font-size: 26rpx;
  color: #1f2937;
  margin-bottom: 16rpx;
  box-sizing: border-box;
}

.date-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.date-label {
  font-size: 26rpx;
  color: #6b7280;
}

.date-value {
  font-size: 26rpx;
  color: #b45309;
  font-weight: 700;
}

.remark-input {
  width: 100%;
  min-height: 118rpx;
  background: #f8fafc;
  border-radius: 18rpx;
  padding: 18rpx 22rpx;
  font-size: 26rpx;
  color: #1f2937;
  margin-bottom: 20rpx;
  box-sizing: border-box;
}

.placeholder {
  color: #b6bcc8;
}

.submit-btn {
  height: 86rpx;
  border-radius: 43rpx;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-text {
  font-size: 30rpx;
  color: #fff;
  font-weight: 800;
}

.record-list {
  display: flex;
  flex-direction: column;
}

.record-row {
  min-height: 76rpx;
  padding: 14rpx 0;
  border-top: 1rpx solid #f1f5f9;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14rpx;
}

.record-main {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  min-width: 0;
  flex: 1;
}

.record-dot {
  width: 16rpx;
  height: 16rpx;
  margin-top: 10rpx;
  border-radius: 50%;
  background: #10b981;
  flex-shrink: 0;
}

.record-info {
  min-width: 0;
  flex: 1;
}

.record-topline {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
  margin-bottom: 4rpx;
}

.record-source {
  font-size: 28rpx;
  color: #1f2937;
  font-weight: 700;
}

.record-date {
  font-size: 22rpx;
  color: #9ca3af;
  flex-shrink: 0;
}

.record-meta {
  display: block;
  font-size: 22rpx;
  line-height: 1.25;
  color: #9ca3af;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2rpx;
  flex-shrink: 0;
}

.record-amount {
  font-size: 28rpx;
  color: #059669;
  font-weight: 800;
}

.record-delete {
  font-size: 22rpx;
  line-height: 1.2;
  color: #ef4444;
}

.empty-block {
  padding: 88rpx 0 72rpx;
  text-align: center;
}

.empty-text {
  font-size: 26rpx;
  color: #b6bcc8;
}

.income-page--dark {
  background: linear-gradient(180deg, #29200d 0%, #12112a 46%, #12112a 100%);

  .income-nav {
    background: linear-gradient(180deg, #29200d 0%, #1f1a2f 100%);
  }

  .back-btn {
    background: rgba(30, 28, 58, 0.92);
    border-color: #2e2c50;
  }

  .back-icon,
  .nav-title {
    color: #fbbf24;
  }

  .sync-btn,
  .overview-card,
  .entry-card,
  .records-card {
    background: rgba(30, 28, 58, 0.94);
    border: 1rpx solid #2e2c50;
  }

  .card-title,
  .amount-input,
  .record-source {
    color: #f8fafc;
  }

  .card-hint,
  .overview-label,
  .date-label,
  .source-chip-text,
  .record-date,
  .record-meta {
    color: #a1a1aa;
  }

  .overview-value,
  .sync-text,
  .date-value {
    color: #fbbf24;
  }

  .amount-field,
  .text-input,
  .date-row,
  .remark-input,
  .source-chip {
    background: rgba(15, 23, 42, 0.62);
  }

  .record-row {
    border-top-color: #2e2c50;
  }
}
</style>
