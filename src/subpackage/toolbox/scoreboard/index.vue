<template>
  <view class="scoreboard-home">
    <PageHeader title="计分器" tone="soft" />

    <scroll-view class="home-scroll" scroll-y>
      <view class="hero">
        <view class="hero-top">
          <view>
            <text class="hero-title">实时房间计分</text>
            <text class="hero-sub">房主授权记分，多台手机同步查看</text>
          </view>
          <view class="room-badge">
            <text class="room-badge-text">云同步</text>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">选择类型</text>
        <view class="type-grid">
          <view
            v-for="item in types"
            :key="item.value"
            class="type-card"
            :class="{ 'type-card--active': selectedType === item.value }"
            @tap="selectedType = item.value"
          >
            <view class="type-icon" :style="{ background: item.color }">
              <text class="type-icon-text">{{ item.icon }}</text>
            </view>
            <text class="type-name">{{ item.name }}</text>
            <text class="type-desc">{{ item.desc }}</text>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">我的昵称</text>
        <input
          v-model="nickname"
          class="input"
          maxlength="12"
          placeholder="创建或加入房间时显示"
          placeholder-class="input-placeholder"
        />
      </view>

      <view class="action-panel">
        <button class="primary-btn" @tap="createRoom">
          <text class="btn-text">创建房间</text>
          <view v-if="creating" class="btn-spinner" />
        </button>

        <view class="join-row">
          <input
            v-model="roomNo"
            class="join-input"
            maxlength="6"
            type="number"
            placeholder="输入 6 位房间号"
            placeholder-class="input-placeholder"
          />
          <button class="join-btn" @tap="joinRoom">
            <text class="btn-text">进入</text>
            <view v-if="joining" class="btn-spinner" />
          </button>
        </view>

        <text v-if="store.errorMessage" class="error-text">{{ store.errorMessage }}</text>
      </view>

      <view class="rank-entry" @tap="openMyLeaderboard">
        <view class="rank-entry-icon">
          <text class="rank-entry-icon-text">榜</text>
        </view>
        <view class="rank-entry-main">
          <text class="rank-entry-title">我的排行榜</text>
          <text class="rank-entry-desc">选择同类型多个房间，汇总总分、胜负和胜率</text>
        </view>
        <text class="rank-entry-arrow">进入</text>
      </view>

      <view v-if="store.recentRooms.length" class="room-group">
        <view class="rank-entry rank-entry--history" @tap="toggleRecentExpanded">
          <view class="rank-entry-icon rank-entry-icon--history">
            <text class="rank-entry-icon-text">历</text>
          </view>
          <view class="rank-entry-main">
            <text class="rank-entry-title">历史进入的房间</text>
            <text class="rank-entry-desc">最近 {{ store.recentRooms.length }} 个，快速回到看过或参与过的房间</text>
          </view>
          <text class="rank-entry-arrow">{{ recentExpanded ? '收起' : '展开' }}</text>
        </view>

        <view v-if="recentExpanded" class="room-list">
          <view
            v-for="room in store.recentRooms"
            :key="room.roomNo"
            class="history-card"
            @tap="openRecentRoom(room.roomNo)"
          >
            <view class="history-main">
              <text class="history-name">{{ room.title }}</text>
              <text class="history-meta">{{ room.roomNo }} · {{ room.type === 'mahjong' ? '麻将' : '通用' }} · {{ room.playersCount }} 人</text>
            </view>
            <view class="history-side">
              <text class="history-time">{{ formatDate(room.visitedAt) }}</text>
              <text class="history-enter">进入</text>
            </view>
          </view>
        </view>
      </view>

      <view class="room-group">
        <view class="rank-entry rank-entry--owned" @tap="toggleOwnedExpanded">
          <view class="rank-entry-icon rank-entry-icon--owned">
            <text class="rank-entry-icon-text">房</text>
          </view>
          <view class="rank-entry-main">
            <text class="rank-entry-title">我创建的房间</text>
            <text class="rank-entry-desc">{{ ownedRoomsSummary }}</text>
          </view>
          <text class="rank-entry-arrow">{{ ownedExpanded ? '收起' : '展开' }}</text>
        </view>

        <view v-if="ownedExpanded" class="room-list">
          <view class="room-list-header">
            <text class="room-list-count">共 {{ store.ownedRooms.length }} 个</text>
            <text class="refresh-text" @tap.stop="loadOwnedRooms">刷新</text>
          </view>
          <view v-if="store.ownedRoomsLoading" class="owned-empty">
            <text class="owned-empty-text">加载中...</text>
          </view>
          <view v-else-if="!store.ownedRooms.length" class="owned-empty">
            <text class="owned-empty-text">暂无创建过的房间</text>
          </view>
          <view v-else>
            <view
              v-for="room in store.ownedRooms"
              :key="room.roomNo"
              class="owned-card"
              @tap="openOwnedRoom(room.roomNo)"
            >
              <view class="owned-main">
                <text class="owned-name">{{ room.title }}</text>
                <text class="owned-meta">{{ room.roomNo }} · {{ room.type === 'mahjong' ? '麻将' : '通用' }} · {{ room.playersCount }} 人</text>
              </view>
              <view class="owned-actions">
                <text class="owned-time">{{ formatDate(room.updatedAt) }}</text>
                <button class="delete-btn" @tap.stop="confirmDeleteRoom(room.roomNo)">删除</button>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="rule-list">
        <view class="rule-item">
          <text class="rule-dot" />
          <text class="rule-text">知道房间号即可进入观看</text>
        </view>
        <view class="rule-item">
          <text class="rule-dot" />
          <text class="rule-text">房主可授权记分员，记分员只能撤销自己的操作</text>
        </view>
        <view class="rule-item">
          <text class="rule-dot" />
          <text class="rule-text">麻将模式会校验每局总分必须为 0</text>
        </view>
      </view>

      <view style="height: 48rpx;" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import PageHeader from '../shiguangxu/components/PageHeader.vue'
import { useScoreboardStore, type ScoreboardType } from '@/store/scoreboard'

const store = useScoreboardStore()
// selectedType 决定创建房间时使用麻将模式还是通用模式。
const selectedType = ref<ScoreboardType>('mahjong')
// nickname 会保存到本地，下次进入计分器自动带出。
const nickname = ref(store.getSavedNickname())
// 用户手动输入的 6 位房间号。
const roomNo = ref('')
const creating = ref(false)
const joining = ref(false)
const recentExpanded = ref(false)
const ownedExpanded = ref(false)
const actionBusy = computed(() => creating.value || joining.value)
const ownedRoomsSummary = computed(() => {
  if (store.ownedRoomsLoading) return '正在同步你创建的房间'
  if (!store.ownedRooms.length) return '暂无创建过的房间'
  return `共 ${store.ownedRooms.length} 个，可进入管理或删除`
})

onShow(() => {
  // 每次回到首页都刷新历史和房主房间，保证快捷入口尽量新。
  store.loadRecentRooms()
  void loadOwnedRooms()
})

const types: { value: ScoreboardType; name: string; desc: string; icon: string; color: string }[] = [
  {
    value: 'mahjong',
    name: '麻将计分',
    desc: '默认 4 人，每局总分归零',
    icon: '麻',
    color: '#E6F7F1',
  },
  {
    value: 'general',
    name: '通用计分',
    desc: '最多 50 人，自由加减分',
    icon: '分',
    color: '#EEF4FF',
  },
]

function showError(message: string) {
  uni.showToast({ title: message, icon: 'none', duration: 1400 })
}

async function loadOwnedRooms() {
  await store.loadOwnedRooms()
}

function openOwnedRoom(value: string) {
  uni.navigateTo({ url: `/subpackage/toolbox/scoreboard/room/index?roomNo=${value}` })
}

// 历史房间是本地快捷入口，真正能否进入仍由房间页 loadRoom 校验。
function openRecentRoom(value: string) {
  roomNo.value = value
  uni.navigateTo({ url: `/subpackage/toolbox/scoreboard/room/index?roomNo=${value}` })
}

function toggleRecentExpanded() {
  recentExpanded.value = !recentExpanded.value
}

function toggleOwnedExpanded() {
  ownedExpanded.value = !ownedExpanded.value
}

function openMyLeaderboard() {
  uni.navigateTo({
    url: '/subpackage/toolbox/scoreboard/ranking/index',
    fail: (error) => {
      showError(error.errMsg || '排行榜页面暂时无法打开')
    },
  })
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

function confirmDeleteRoom(value: string) {
  uni.showModal({
    title: '删除房间',
    content: `确定删除房间 ${value} 吗？删除后其他人不能再进入。`,
    confirmText: '删除',
    confirmColor: '#DC2626',
    success: (res) => {
      if (!res.confirm) return
      void deleteRoom(value)
    },
  })
}

async function deleteRoom(value: string) {
  try {
    await store.deleteOwnedRoom(value)
    showError('已删除房间')
  } catch (error) {
    showError(error instanceof Error ? error.message : '删除房间失败')
  }
}

async function createRoom() {
  if (actionBusy.value) return
  creating.value = true
  try {
    const room = await store.createRoom(selectedType.value, nickname.value)
    uni.navigateTo({ url: `/subpackage/toolbox/scoreboard/room/index?roomNo=${room.roomNo}` })
  } catch (error) {
    showError(error instanceof Error ? error.message : '创建房间失败')
  } finally {
    creating.value = false
  }
}

async function joinRoom() {
  if (actionBusy.value) return
  const value = roomNo.value.trim()
  if (!/^\d{6}$/.test(value)) {
    showError('请输入 6 位房间号')
    return
  }
  joining.value = true
  try {
    const room = await store.joinRoom(value, nickname.value)
    uni.navigateTo({ url: `/subpackage/toolbox/scoreboard/room/index?roomNo=${room.roomNo}` })
  } catch (error) {
    showError(error instanceof Error ? error.message : '进入房间失败')
  } finally {
    joining.value = false
  }
}
</script>

<style lang="scss" scoped>
.scoreboard-home {
  min-height: 100vh;
  background: linear-gradient(180deg, #eef4ff 0%, #f7faf8 46%, #f6f7fb 100%);
}

.home-scroll {
  height: calc(100vh - 88rpx);
  padding: 0 24rpx 32rpx;
  box-sizing: border-box;
}

.hero {
  margin: 8rpx 0 24rpx;
  padding: 34rpx 32rpx;
  border-radius: 28rpx;
  background: #19324d;
  box-shadow: 0 18rpx 42rpx rgba(25, 50, 77, 0.18);
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.hero-title {
  display: block;
  font-size: 44rpx;
  line-height: 1.15;
  font-weight: 800;
  color: #fff;
}

.hero-sub {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.78);
}

.room-badge {
  flex-shrink: 0;
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.12);
  border: 1rpx solid rgba(255, 255, 255, 0.18);
}

.room-badge-text {
  font-size: 22rpx;
  color: #c9f7dc;
  font-weight: 700;
}

.section {
  margin-bottom: 22rpx;
}

.section-title {
  display: block;
  margin: 0 8rpx 16rpx;
  font-size: 28rpx;
  color: #1f2937;
  font-weight: 800;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
}

.type-card {
  padding: 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.92);
  border: 2rpx solid transparent;
  box-shadow: 0 8rpx 24rpx rgba(28, 55, 90, 0.08);
}

.type-card--active {
  border-color: #19324d;
  box-shadow: 0 12rpx 28rpx rgba(25, 50, 77, 0.14);
}

.type-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18rpx;
}

.type-icon-text {
  font-size: 30rpx;
  font-weight: 800;
  color: #19324d;
}

.type-name {
  display: block;
  font-size: 30rpx;
  color: #111827;
  font-weight: 800;
}

.type-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.4;
  color: #6b7280;
}

.input,
.join-input {
  height: 92rpx;
  padding: 0 26rpx;
  border-radius: 22rpx;
  background: #fff;
  border: 1rpx solid rgba(31, 41, 55, 0.08);
  font-size: 28rpx;
  color: #111827;
  box-sizing: border-box;
}

.input-placeholder {
  color: #a0a7b2;
}

.action-panel {
  padding: 24rpx;
  border-radius: 28rpx;
  background: #fff;
  box-shadow: 0 10rpx 30rpx rgba(28, 55, 90, 0.08);
}

.primary-btn,
.join-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 92rpx;
  margin: 0;
  padding: 0;
  line-height: 1;
  border-radius: 24rpx;
  font-size: 28rpx;
  font-weight: 800;
  border: 0;
  color: #fff;
  box-sizing: border-box;
}

.primary-btn::after,
.join-btn::after,
.delete-btn::after {
  border: 0;
}

.primary-btn {
  width: 100%;
  background: #19324d;
}

.join-row {
  display: flex;
  gap: 16rpx;
  margin-top: 18rpx;
}

.join-input {
  flex: 1;
  min-width: 0;
}

.join-btn {
  width: 170rpx;
  flex-shrink: 0;
  background: #1f9d67;
}

.btn-text {
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: 1;
}

.btn-spinner {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.42);
  border-top-color: #fff;
  box-sizing: border-box;
  animation: btn-spin 0.72s linear infinite;
}

@keyframes btn-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.error-text {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #dc2626;
}

.rank-entry {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-top: 22rpx;
  padding: 24rpx;
  border-radius: 26rpx;
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 58%, #eef4ff 100%);
  box-shadow: 0 10rpx 30rpx rgba(28, 55, 90, 0.08);
}

.rank-entry--history {
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 58%, #eef4ff 100%);
}

.rank-entry--owned {
  background: linear-gradient(135deg, #eef4ff 0%, #ffffff 58%, #fff7ed 100%);
}

.rank-entry-icon {
  width: 74rpx;
  height: 74rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #19324d;
}

.rank-entry-icon--history {
  background: #1f9d67;
}

.rank-entry-icon--owned {
  background: #19324d;
}

.rank-entry-icon-text {
  color: #ffd36a;
  font-size: 30rpx;
  font-weight: 900;
}

.rank-entry-main {
  flex: 1;
  min-width: 0;
}

.rank-entry-title {
  display: block;
  font-size: 30rpx;
  color: #111827;
  font-weight: 900;
}

.rank-entry-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.4;
  color: #667085;
}

.rank-entry-arrow {
  flex-shrink: 0;
  font-size: 24rpx;
  color: #1f9d67;
  font-weight: 800;
}

.room-group {
  margin-top: 22rpx;
}

.room-group .rank-entry {
  margin-top: 0;
}

.room-list {
  margin-top: 12rpx;
  padding: 12rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.48);
  border: 1rpx solid rgba(25, 50, 77, 0.05);
  box-sizing: border-box;
}

.room-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6rpx 12rpx;
}

.room-list-count {
  font-size: 23rpx;
  color: #8b95a1;
  font-weight: 700;
}

.refresh-text {
  padding: 8rpx 10rpx;
  font-size: 24rpx;
  color: #1f9d67;
  font-weight: 800;
}

.owned-empty,
.owned-card,
.history-card {
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 8rpx 24rpx rgba(28, 55, 90, 0.08);
}

.owned-empty {
  padding: 34rpx 24rpx;
  text-align: center;
}

.owned-empty-text {
  font-size: 24rpx;
  color: #8b95a1;
}

.owned-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 22rpx 22rpx 22rpx 24rpx;
  margin-bottom: 16rpx;
}

.history-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 22rpx 24rpx;
  margin-bottom: 16rpx;
}

.owned-main {
  flex: 1;
  min-width: 0;
}

.history-main {
  flex: 1;
  min-width: 0;
}

.owned-name,
.history-name {
  display: block;
  font-size: 28rpx;
  color: #111827;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.owned-meta,
.history-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #667085;
}

.history-side {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.history-time {
  font-size: 20rpx;
  color: #98a2b3;
  white-space: nowrap;
}

.history-enter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 84rpx;
  height: 50rpx;
  border-radius: 16rpx;
  background: #e6f7f1;
  color: #1f9d67;
  font-size: 22rpx;
  font-weight: 800;
}

.owned-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.owned-time {
  font-size: 20rpx;
  color: #98a2b3;
  white-space: nowrap;
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 56rpx;
  margin: 0;
  padding: 0;
  line-height: 1;
  border-radius: 16rpx;
  background: #fee2e2;
  color: #dc2626;
  border: 0;
  font-size: 22rpx;
  font-weight: 800;
  box-sizing: border-box;
}

.rule-list {
  margin-top: 24rpx;
  padding: 0 8rpx;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.rule-dot {
  width: 10rpx;
  height: 10rpx;
  margin-top: 13rpx;
  border-radius: 50%;
  background: #1f9d67;
  flex-shrink: 0;
}

.rule-text {
  font-size: 24rpx;
  line-height: 1.5;
  color: #667085;
}
</style>
