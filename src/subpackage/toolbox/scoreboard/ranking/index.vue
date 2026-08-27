<template>
  <view class="ranking-page">
    <scroll-view class="ranking-scroll" scroll-y>
      <view class="summary-panel" :style="{ paddingTop: summaryTopPadding }">
        <view class="summary-nav" :style="{ paddingRight: summaryNavRightGap }">
          <view class="summary-back" @tap="goBack">
            <text class="summary-back-icon">‹</text>
          </view>
        </view>
        <view class="summary-main">
          <text class="summary-title">跨房间总榜</text>
          <text class="summary-sub">同名玩家自动合并，汇总总分、胜负局和胜率</text>
        </view>
      </view>

      <view class="type-switch">
        <view
          v-for="item in types"
          :key="item.value"
          class="type-segment"
          :class="{ 'type-segment--active': selectedType === item.value }"
          @tap="switchType(item.value)"
        >
          <text class="type-segment-name">{{ item.name }}</text>
          <text class="type-segment-count">{{ roomCountFor(item.value) }} 个房间</text>
        </view>
      </view>

      <view class="panel">
        <view class="panel-header">
          <view class="panel-heading">
            <text class="panel-title">选择{{ selectedTypeName }}房间</text>
            <text class="panel-tip">至少选择 2 个，最多 20 个</text>
          </view>
          <view class="panel-actions">
            <view class="selected-pill">
              <text class="selected-pill-label">已选</text>
              <text class="selected-pill-count">{{ selectedCount }}</text>
            </view>
            <text v-if="filteredRooms.length" class="select-all" @tap="toggleSelectAll">
              {{ allFilteredSelected ? '清空' : '全选' }}
            </text>
          </view>
        </view>

        <view v-if="store.myRoomsLoading" class="empty">
          <text class="empty-text">加载中...</text>
        </view>
        <view v-else-if="!filteredRooms.length" class="empty">
          <text class="empty-text">暂无{{ selectedTypeName }}房间</text>
        </view>
        <view v-else>
          <view
            v-for="room in filteredRooms"
            :key="room.roomNo"
            class="room-row"
            :class="{ 'room-row--selected': isRoomSelected(room.roomNo) }"
            @tap="toggleRoom(room.roomNo)"
          >
            <view class="check-mark">
              <text v-if="isRoomSelected(room.roomNo)" class="check-mark-text">✓</text>
            </view>
            <view class="room-main">
              <text class="room-title">{{ room.title }}</text>
              <text class="room-meta">{{ room.roomNo }} · {{ roleText(room.role) }} · {{ room.playersCount }} 人 · {{ room.recordsCount }} 局</text>
            </view>
            <text class="room-time">{{ formatDate(room.updatedAt) }}</text>
          </view>
        </view>

        <button
          class="build-btn"
          :class="{ 'build-btn--disabled': !canBuild }"
          :disabled="!canBuild || building"
          @tap="buildRanking"
        >
          {{ building ? '生成中' : '生成总榜' }}
        </button>
      </view>

      <view v-if="leaderboard.length" class="podium">
        <view
          v-for="(item, index) in topThree"
          :key="item.name"
          class="podium-item"
          :class="`podium-item--${index + 1}`"
        >
          <image class="podium-icon" :src="rankIconSrc(index)" mode="aspectFit" />
          <text class="podium-name">{{ item.name }}</text>
          <text class="podium-score">{{ item.score }}</text>
          <text class="podium-meta">胜率 {{ item.winRate }}%</text>
        </view>
      </view>

      <view v-if="leaderboard.length" class="panel result-panel">
        <view class="panel-header">
          <view>
            <text class="panel-title">排行榜</text>
            <text class="panel-tip">按总分、胜率、胜场排序</text>
          </view>
          <text class="panel-count">{{ leaderboard.length }} 人</text>
        </view>

        <view
          v-for="(item, index) in leaderboard"
          :key="item.name"
          class="leader-row"
        >
          <view class="rank-cell" :class="{ 'rank-cell--plain': index >= 3 }">
            <image v-if="index < 3" class="rank-icon" :src="rankIconSrc(index)" mode="aspectFit" />
            <text v-else class="rank-number">{{ index + 1 }}</text>
          </view>
          <view class="leader-main">
            <text class="leader-name">{{ item.name }}</text>
            <text class="leader-meta">胜 {{ item.wins }} 负 {{ item.losses }} · 胜率 {{ item.winRate }}% · {{ item.roomCount }} 房</text>
          </view>
          <text class="leader-score" :class="{ 'leader-score--minus': item.score < 0 }">{{ item.score }}</text>
        </view>
      </view>
      <view v-else class="result-hint">
        <text class="result-hint-title">排行榜待生成</text>
        <text class="result-hint-text">选择 2 个以上房间后查看总榜</text>
      </view>

      <text v-if="store.errorMessage" class="error-text">{{ store.errorMessage }}</text>
      <view style="height: 56rpx;" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useScoreboardStore, type ScoreRole, type ScoreboardType } from '@/store/scoreboard'
import { useNavBarLayout } from '@/composables/useNavBarLayout'
import {
  buildScoreboardLeaderboard,
  type ScoreboardLeaderboardItem,
} from '@/utils/scoreboardCore'

const store = useScoreboardStore()
const { layout, safeRightGap } = useNavBarLayout()
const selectedType = ref<ScoreboardType>('mahjong')
const selectedRoomNos = ref<string[]>([])
const leaderboard = ref<ScoreboardLeaderboardItem[]>([])
const building = ref(false)

const types: { value: ScoreboardType; name: string }[] = [
  { value: 'mahjong', name: '麻将' },
  { value: 'general', name: '通用' },
]

onShow(() => {
  void loadMyRooms()
})

const selectedTypeName = computed(() => selectedType.value === 'mahjong' ? '麻将' : '通用')
const summaryTopPadding = computed(() => `${layout.value.statusBarHeight + uni.upx2px(12)}px`)
const summaryNavRightGap = computed(() => `${safeRightGap(18)}px`)

const filteredRooms = computed(() => {
  return store.myRooms.filter((room) => room.type === selectedType.value)
})

const selectedCount = computed(() => selectedRoomNos.value.length)
const canBuild = computed(() => selectedCount.value >= 2)
const topThree = computed(() => leaderboard.value.slice(0, 3))

const allFilteredSelected = computed(() => {
  return Boolean(filteredRooms.value.length) && filteredRooms.value.every((room) => selectedRoomNos.value.includes(room.roomNo))
})

function roomCountFor(type: ScoreboardType) {
  return store.myRooms.filter((room) => room.type === type).length
}

function goBack() {
  uni.navigateBack()
}

async function loadMyRooms() {
  try {
    await store.loadMyRooms()
  } catch (error) {
    showToast(error instanceof Error ? error.message : '加载房间列表失败')
  }
}

function switchType(type: ScoreboardType) {
  if (selectedType.value === type) return
  selectedType.value = type
  selectedRoomNos.value = []
  leaderboard.value = []
}

function isRoomSelected(roomNo: string) {
  return selectedRoomNos.value.includes(roomNo)
}

function toggleRoom(roomNo: string) {
  if (isRoomSelected(roomNo)) {
    selectedRoomNos.value = selectedRoomNos.value.filter((item) => item !== roomNo)
    return
  }
  if (selectedRoomNos.value.length >= 20) {
    showToast('一次最多选择 20 个房间')
    return
  }
  selectedRoomNos.value = [...selectedRoomNos.value, roomNo]
}

function toggleSelectAll() {
  if (allFilteredSelected.value) {
    selectedRoomNos.value = []
    return
  }
  selectedRoomNos.value = filteredRooms.value.slice(0, 20).map((room) => room.roomNo)
}

async function buildRanking() {
  if (!canBuild.value || building.value) return
  building.value = true
  try {
    const rooms = await store.loadRankingRooms(selectedType.value, selectedRoomNos.value)
    leaderboard.value = buildScoreboardLeaderboard(rooms)
    if (!leaderboard.value.length) showToast('选中房间暂无玩家')
  } catch (error) {
    showToast(error instanceof Error ? error.message : '生成总榜失败')
  } finally {
    building.value = false
  }
}

function rankIconSrc(index: number) {
  return `/subpackage/toolbox/static/imgs/score-rank-top${index + 1}.svg`
}

function roleText(role: ScoreRole) {
  if (role === 'owner') return '我创建'
  if (role === 'scorer') return '记分员'
  return '已参与'
}

function formatDate(timestamp: number) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  const seconds = `${date.getSeconds()}`.padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}:${seconds}`
}

function showToast(message: string) {
  uni.showToast({ title: message, icon: 'none', duration: 1400 })
}
</script>

<style lang="scss" scoped>
.ranking-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f4f7fb 0%, #f8fafc 44%, #f6f7fb 100%);
}

.ranking-scroll {
  height: 100vh;
  padding: 0 18rpx env(safe-area-inset-bottom);
  box-sizing: border-box;
}

.summary-panel {
  margin: 0 0 12rpx;
  padding: 0 0 0;
  box-sizing: border-box;
}

.summary-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 14rpx;
  box-sizing: border-box;
}

.summary-back {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1rpx solid rgba(25, 50, 77, 0.08);
  box-shadow: 0 8rpx 20rpx rgba(25, 50, 77, 0.1);
  flex-shrink: 0;
}

.summary-back-icon {
  color: #19324d;
  font-size: 40rpx;
  line-height: 1;
  margin-top: -4rpx;
}

.summary-main {
  min-width: 0;
  padding: 22rpx 24rpx;
  border-radius: 26rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f8fbff 64%, #ecfdf5 100%);
  border: 1rpx solid rgba(25, 50, 77, 0.08);
  box-shadow: 0 12rpx 34rpx rgba(28, 55, 90, 0.09);
}

.summary-title {
  display: block;
  font-size: 36rpx;
  color: #111827;
  font-weight: 900;
  line-height: 1.15;
}

.summary-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.45;
  color: #667085;
}

.type-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.type-segment {
  padding: 20rpx 22rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.92);
  border: 2rpx solid transparent;
  box-shadow: 0 8rpx 24rpx rgba(28, 55, 90, 0.07);
}

.type-segment--active {
  border-color: #19324d;
  background: #fff;
}

.type-segment-name {
  display: block;
  font-size: 28rpx;
  color: #111827;
  font-weight: 900;
}

.type-segment-count {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #667085;
}

.panel,
.podium {
  border-radius: 28rpx;
  background: #fff;
  box-shadow: 0 10rpx 30rpx rgba(28, 55, 90, 0.08);
}

.panel {
  padding: 22rpx 22rpx;
  margin-bottom: 14rpx;
}

.result-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: 22rpx 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.78);
  border: 1rpx solid rgba(25, 50, 77, 0.06);
}

.result-hint-title {
  flex-shrink: 0;
  font-size: 26rpx;
  color: #111827;
  font-weight: 900;
}

.result-hint-text {
  min-width: 0;
  font-size: 22rpx;
  color: #8b95a1;
  text-align: right;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 18rpx;
}

.panel-heading {
  min-width: 0;
  flex: 1;
}

.panel-title {
  display: block;
  font-size: 30rpx;
  color: #111827;
  font-weight: 900;
}

.panel-tip,
.panel-count {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #8b95a1;
}

.panel-count,
.select-all {
  flex-shrink: 0;
  margin-top: 0;
  height: 52rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: #f7fbf8;
  border: 1rpx solid rgba(31, 157, 103, 0.16);
  color: #168257;
  font-size: 23rpx;
  font-weight: 800;
  line-height: 52rpx;
}

.panel-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 6rpx;
  border-radius: 999rpx;
  background: #f2f6fb;
  border: 1rpx solid rgba(25, 50, 77, 0.06);
  box-sizing: border-box;
}

.selected-pill {
  height: 52rpx;
  padding: 0 10rpx 0 18rpx;
  border-radius: 999rpx;
  background: #ffffff;
  border: 1rpx solid rgba(25, 50, 77, 0.08);
  box-shadow: 0 6rpx 14rpx rgba(28, 55, 90, 0.06);
  display: flex;
  align-items: center;
  gap: 8rpx;
  box-sizing: border-box;
  white-space: nowrap;
}

.selected-pill-label {
  color: #667085;
  font-size: 22rpx;
  font-weight: 800;
}

.selected-pill-count {
  min-width: 34rpx;
  height: 34rpx;
  padding: 0 8rpx;
  border-radius: 999rpx;
  background: #19324d;
  color: #fff;
  font-size: 22rpx;
  font-weight: 900;
  line-height: 34rpx;
  text-align: center;
  box-sizing: border-box;
}

.empty {
  padding: 38rpx 20rpx;
  text-align: center;
}

.empty-text {
  color: #8b95a1;
  font-size: 24rpx;
}

.room-row,
.leader-row {
  display: flex;
  align-items: center;
  min-height: 86rpx;
  border-bottom: 1rpx solid #eef2f6;
}

.room-row:last-child,
.leader-row:last-child {
  border-bottom: 0;
}

.room-row--selected .check-mark {
  background: #1f9d67;
  border-color: #1f9d67;
}

.check-mark {
  width: 42rpx;
  height: 42rpx;
  border-radius: 14rpx;
  border: 2rpx solid #d8dee8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 18rpx;
  box-sizing: border-box;
}

.check-mark-text {
  color: #fff;
  font-size: 24rpx;
  font-weight: 900;
}

.room-main,
.leader-main {
  flex: 1;
  min-width: 0;
}

.room-title,
.leader-name {
  display: block;
  font-size: 28rpx;
  color: #111827;
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-meta,
.leader-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.35;
  color: #667085;
}

.room-time {
  flex-shrink: 0;
  margin-left: 14rpx;
  font-size: 20rpx;
  color: #98a2b3;
  white-space: nowrap;
}

.build-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 78rpx;
  margin: 18rpx 0 0;
  padding: 0;
  border-radius: 24rpx;
  background: #19324d;
  color: #fff;
  border: 0;
  font-size: 28rpx;
  font-weight: 900;
  line-height: 1;
}

.build-btn::after {
  border: 0;
}

.build-btn--disabled {
  background: #d8dee8;
  color: #8b95a1;
}

.podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 10rpx;
  padding: 18rpx 14rpx;
  margin-bottom: 0;
  background: linear-gradient(135deg, #fffaf0 0%, #ffffff 66%, #eff6ff 100%);
}

.podium-item {
  min-width: 0;
  flex: 1;
  padding: 14rpx 10rpx;
  border-radius: 20rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.74);
}

.podium-item--1 {
  order: 2;
  flex: 1.12;
  padding-top: 20rpx;
  padding-bottom: 18rpx;
  box-shadow: 0 10rpx 24rpx rgba(242, 153, 74, 0.16);
}

.podium-item--2 {
  order: 1;
}

.podium-item--3 {
  order: 3;
}

.podium-icon {
  width: 54rpx;
  height: 54rpx;
}

.podium-name {
  display: block;
  margin-top: 4rpx;
  font-size: 24rpx;
  color: #111827;
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.podium-score {
  display: block;
  margin-top: 2rpx;
  font-size: 28rpx;
  color: #19324d;
  font-weight: 900;
}

.podium-meta {
  display: block;
  margin-top: 2rpx;
  font-size: 20rpx;
  color: #667085;
}

.rank-cell {
  width: 72rpx;
  height: 72rpx;
  flex-shrink: 0;
  margin-right: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-cell--plain {
  border-radius: 50%;
  background: transparent;
}

.rank-icon {
  width: 66rpx;
  height: 66rpx;
}

.rank-number {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef2f6;
  color: #667085;
  font-size: 24rpx;
  font-weight: 900;
}

.leader-score {
  margin-left: 18rpx;
  color: #15803d;
  font-size: 38rpx;
  font-weight: 900;
}

.leader-score--minus {
  color: #dc2626;
}

.error-text {
  display: block;
  margin: 4rpx 8rpx 0;
  color: #dc2626;
  font-size: 24rpx;
}
</style>
