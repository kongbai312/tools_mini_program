<template>
  <view class="sgx-page" :class="{ 'sgx-page--dark': userStore.isDark }">
    <PageHeader title="记账">
      <template #right>
        <text class="header-action" @tap="showAdd = true">记一笔</text>
      </template>
    </PageHeader>

    <view class="summary-card">
      <view class="sum-item">
        <text class="sum-label">本月收入</text>
        <text class="sum-value sum-value--in">+{{ summary.income.toFixed(2) }}</text>
      </view>
      <view class="sum-divider" />
      <view class="sum-item">
        <text class="sum-label">本月支出</text>
        <text class="sum-value sum-value--out">-{{ summary.expense.toFixed(2) }}</text>
      </view>
    </view>

    <scroll-view class="page-scroll" scroll-y>
      <view v-for="item in store.bills" :key="item.id" class="bill-row">
        <view class="bill-icon" :class="item.type === 'income' ? 'bill-icon--in' : 'bill-icon--out'">
          <text>{{ item.type === 'income' ? '入' : '出' }}</text>
        </view>
        <view class="bill-body">
          <text class="bill-cat">{{ item.category }}{{ item.note ? ` · ${item.note}` : '' }}</text>
          <text class="bill-date">{{ item.date }}</text>
        </view>
        <text class="bill-amount" :class="item.type === 'income' ? 'bill-amount--in' : 'bill-amount--out'">
          {{ item.type === 'income' ? '+' : '-' }}{{ item.amount.toFixed(2) }}
        </text>
        <text class="bill-del" @tap="onRemove(item.id)">×</text>
      </view>
      <view v-if="!store.bills.length" class="empty-block">
        <text class="empty-emoji">💰</text>
        <text class="empty-text">记录收支，养成良好消费习惯</text>
      </view>
      <view style="height: 120rpx;" />
    </scroll-view>

    <view v-if="showAdd" class="add-mask" @tap="showAdd = false">
      <view class="add-panel" @tap.stop>
        <text class="add-title">记一笔</text>
        <view class="type-row">
          <view
            class="type-chip"
            :class="{ 'type-chip--active': billType === 'expense' }"
            @tap="billType = 'expense'"
          >
            <text>支出</text>
          </view>
          <view
            class="type-chip"
            :class="{ 'type-chip--active': billType === 'income' }"
            @tap="billType = 'income'"
          >
            <text>收入</text>
          </view>
        </view>
        <input
          v-model="amountStr"
          class="add-input"
          type="digit"
          placeholder="金额"
          placeholder-style="color:#B8BCC8"
        />
        <view class="chip-row chip-row--wrap">
          <view
            v-for="cat in currentCategories"
            :key="cat"
            class="chip chip--sm"
            :class="{ 'chip--active': billCategory === cat }"
            @tap="billCategory = cat"
          >
            <text class="chip-text">{{ cat }}</text>
          </view>
        </view>
        <input v-model="billNote" class="add-input" placeholder="备注（选填）" placeholder-style="color:#B8BCC8" />
        <picker mode="date" :value="billDate" @change="onDateChange">
          <view class="date-picker">
            <text class="date-label">日期</text>
            <text class="date-value">{{ billDate }}</text>
          </view>
        </picker>
        <view class="add-actions">
          <view class="add-btn add-btn--ghost" @tap="showAdd = false"><text>取消</text></view>
          <view class="add-btn add-btn--primary" @tap="submitBill"><text>保存</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import {
  useShiguangxuStore,
  BILL_EXPENSE_CATEGORIES,
  BILL_INCOME_CATEGORIES,
  type BillType,
} from '@/store/shiguangxu'
import { todayStr } from '@/utils/sgxDate'
import PageHeader from '../components/PageHeader.vue'

const userStore = useUserStore()
const store = useShiguangxuStore()
const summary = computed(() => store.monthBillSummary)

const showAdd = ref(false)
const billType = ref<BillType>('expense')
const amountStr = ref('')
const billCategory = ref<string>(BILL_EXPENSE_CATEGORIES[0])
const billNote = ref('')
const billDate = ref(todayStr())

const currentCategories = computed(() =>
  billType.value === 'income' ? BILL_INCOME_CATEGORIES : BILL_EXPENSE_CATEGORIES,
)

const onDateChange = (e: { detail: { value: string } }) => {
  billDate.value = e.detail.value
}

const submitBill = () => {
  const amount = parseFloat(amountStr.value)
  if (!amount || amount <= 0) {
    uni.showToast({ title: '请输入有效金额', icon: 'none' })
    return
  }
  if (!store.addBill(billType.value, amount, billCategory.value, billNote.value, billDate.value)) {
    uni.showToast({ title: '保存失败', icon: 'none' })
    return
  }
  amountStr.value = ''
  billNote.value = ''
  showAdd.value = false
  uni.showToast({ title: '已记账', icon: 'success' })
}

const onRemove = (id: string) => {
  uni.showModal({
    title: '删除',
    content: '确定删除该记录？',
    success: (res) => {
      if (res.confirm) store.removeBill(id)
    },
  })
}
</script>

<style lang="scss" scoped>
@import '../styles/subpage.scss';

.summary-card {
  margin: 0 24rpx 20rpx;
  background: linear-gradient(135deg, #10b981, #34d399);
  border-radius: 24rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 12rpx 32rpx rgba(16, 185, 129, 0.25);
}

.sum-item {
  flex: 1;
  text-align: center;
}

.sum-label {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 8rpx;
}

.sum-value {
  font-size: 36rpx;
  font-weight: 800;
  color: #fff;
}

.sum-divider {
  width: 2rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.35);
}

.bill-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.bill-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 700;
  color: #fff;
}

.bill-icon--in {
  background: #10b981;
}

.bill-icon--out {
  background: #ef4444;
}

.bill-body {
  flex: 1;
  min-width: 0;
}

.bill-cat {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

.bill-date {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.bill-amount {
  font-size: 30rpx;
  font-weight: 700;
}

.bill-amount--in {
  color: #10b981;
}

.bill-amount--out {
  color: #ef4444;
}

.type-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.type-chip {
  flex: 1;
  height: 72rpx;
  border-radius: 16rpx;
  background: #f0f0f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #666;
}

.type-chip--active {
  background: #d1fae5;
  color: #059669;
  font-weight: 700;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.chip {
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: #f0f0f5;
}

.chip--active {
  background: #d1fae5;
}

.chip--active .chip-text {
  color: #059669;
  font-weight: 600;
}

.chip-text {
  font-size: 24rpx;
  color: #666;
}
</style>
