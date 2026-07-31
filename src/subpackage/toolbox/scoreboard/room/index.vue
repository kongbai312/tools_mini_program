<template>
  <view class="room-page">
    <PageHeader title="计分房间" tone="soft">
      <template #right>
        <view class="role-pill">
          <text class="role-pill-text">{{ roleText }}</text>
        </view>
      </template>
    </PageHeader>

    <scroll-view class="room-scroll" scroll-y>
      <view v-if="room" class="room-head">
        <view class="room-head-main">
          <text class="room-title">{{ room.title }}</text>
          <text class="room-sub">{{ room.type === 'mahjong' ? '麻将模式' : '通用模式' }}</text>
        </view>
        <view class="room-code-panel" @tap.stop="copyRoomNo">
          <text class="room-code-label">房间号</text>
          <text class="room-code-number">{{ room.roomNo }}</text>
          <text class="copy-chip">复制</text>
        </view>
      </view>

      <view v-if="room" class="score-card">
        <view
          v-for="(player, index) in sortedPlayers"
          :key="player.id"
          class="player-row"
        >
          <view class="rank" :style="{ background: player.color }">
            <text class="rank-text">{{ index + 1 }}</text>
          </view>
          <view class="player-main" @tap="editPlayerName(player)">
            <text class="player-name">{{ player.name }}</text>
            <text class="player-hint">{{ playerHint(player) }}</text>
          </view>
          <text class="score" :class="{ 'score--plus': player.score > 0, 'score--minus': player.score < 0 }">
            {{ player.score }}
          </text>
        </view>
      </view>

      <view v-if="room && store.canEditScore" class="panel">
        <view class="panel-header">
          <text class="panel-title">{{ room.type === 'mahjong' ? '本局结算' : '快速记分' }}</text>
          <text class="panel-tip">{{ room.type === 'mahjong' ? `合计 ${changeTotal}` : '输入正负分数' }}</text>
        </view>
        <view class="fast-settle">
          <view class="fast-rule-row">
            <view class="fast-field">
              <text class="fast-label">赢家</text>
              <input
                v-model="fastWinnerScore"
                class="fast-input"
                type="number"
                placeholder="6"
                placeholder-class="input-placeholder"
                @input="normalizeFastRuleInput('winner', $event)"
              />
            </view>
            <view class="fast-field">
              <text class="fast-label">输家</text>
              <input
                v-model="fastLoserScore"
                class="fast-input"
                type="number"
                placeholder="2"
                placeholder-class="input-placeholder"
                @input="normalizeFastRuleInput('loser', $event)"
              />
            </view>
            <button class="fast-submit-btn" :disabled="fastSubmitting" @tap="submitFastSettlement">
              {{ fastSubmitting ? '结算中' : '快速结算' }}
            </button>
          </view>
          <view class="winner-list">
            <view
              v-for="player in room.players"
              :key="player.id"
              class="winner-chip"
              :class="{ 'winner-chip--active': selectedRoundWinnerId === player.id }"
              @tap="selectRoundWinner(player.id)"
            >
              <text class="winner-chip-text">{{ player.name }}</text>
            </view>
          </view>
          <text class="fast-summary">本局赢家：{{ selectedRoundWinnerName }}；快速结算按 +{{ fastWinnerScore || 0 }} / -{{ fastLoserScore || 0 }}，合计 {{ fastSettlementTotal }}</text>
        </view>
        <view class="change-list">
          <view v-for="player in room.players" :key="player.id" class="change-row">
            <text class="change-name" @tap="editPlayerName(player)">{{ player.name }}</text>
            <view
              class="sign-toggle"
              :class="{ 'sign-toggle--minus': signFor(player.id) === 'minus' }"
              @tap="toggleSign(player.id)"
            >
              <text class="sign-toggle-text">{{ signFor(player.id) === 'minus' ? '-' : '+' }}</text>
            </view>
            <input
              v-model="draftChanges[player.id]"
              class="change-input"
              type="number"
              placeholder="0"
              placeholder-class="input-placeholder"
              @input="normalizeDraftScoreInput(player.id, $event)"
            />
          </view>
        </view>
        <input
          v-model="note"
          class="note-input"
          maxlength="30"
          placeholder="备注，可不填"
          placeholder-class="input-placeholder"
        />
        <button class="submit-btn" @tap="submitScore">提交记分</button>
      </view>

      <view v-if="room && (store.isOwner || store.canChangeSeat)" class="panel">
        <view class="panel-header">
          <text class="panel-title">房间成员</text>
          <text class="panel-tip">授权 / 占位</text>
        </view>
        <view v-for="member in visibleMembers" :key="member.memberKey" class="member-row">
          <view class="member-main">
            <text class="member-name">{{ member.name }}</text>
            <text class="member-role">{{ memberRoleText(member) }}</text>
          </view>
          <view class="member-actions">
            <picker
              v-if="canShowSeatPicker(member)"
              class="seat-picker"
              mode="selector"
              :range="seatPickerLabels(member)"
              :value="seatPickerIndex(member)"
              @change="bindMemberSeat(member, $event)"
            >
              <view class="mini-btn mini-btn--seat">
                {{ boundPlayerFor(member.memberKey) ? '换座' : '占位' }}
              </view>
            </picker>
            <button
              v-if="store.isOwner"
              class="mini-btn mini-btn--ghost"
              @tap="openMemberManage(member)"
            >
              管理
            </button>
          </view>
        </view>
        <view v-if="store.isOwner" class="add-player">
          <input
            v-model="newPlayerName"
            class="add-player-input"
            maxlength="12"
            placeholder="添加玩家"
            placeholder-class="input-placeholder"
          />
          <button class="small-btn small-btn--dark" @tap="addPlayer">添加</button>
        </view>
      </view>

      <view v-if="room" class="panel">
        <view class="panel-header">
          <text class="panel-title">操作记录</text>
          <text class="panel-tip">最近 {{ room.records.length }} 条</text>
        </view>
        <view v-if="!room.records.length" class="empty">
          <text class="empty-text">还没有记分记录</text>
        </view>
        <view v-for="record in room.records" :key="record.id" class="record-row">
          <view class="record-main">
            <text class="record-title">{{ recordTitle(record) }}</text>
            <view class="record-meta">
              <text class="record-sub">{{ record.actorName }} · {{ formatTime(record.createdAt) }}</text>
              <text v-if="record.undoneAt" class="record-undone">已由 {{ record.undoneByName || '成员' }} 撤销</text>
            </view>
          </view>
          <button
            v-if="canUndo(record)"
            class="undo-btn"
            @tap="undoRecord(record)"
          >
            撤销
          </button>
        </view>
      </view>

      <view v-if="store.errorMessage" class="error-block">
        <text class="error-text">{{ store.errorMessage }}</text>
      </view>

      <view style="height: 56rpx;" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import PageHeader from '../../shiguangxu/components/PageHeader.vue'
import {
  useScoreboardStore,
  type ScoreChange,
  type ScoreMember,
  type ScorePlayer,
  type ScoreRecord,
} from '@/store/scoreboard'
import {
  buildFastSettlementChanges,
  buildPlayerRecordStats,
  canUndoScoreRecord,
  signedScoreDelta,
  validateScoreChanges,
  type ScoreSign,
} from '@/utils/scoreboardCore'

const store = useScoreboardStore()
const FAST_SETTLE_RULE_STORAGE_KEY = 'scoreboard_fast_settle_rule'
// 每个玩家本局输入的纯数字分数，正负号由 draftSigns 单独控制。
const draftChanges = reactive<Record<string, string>>({})
// 每个玩家本局输入的正负号，提交时和 draftChanges 合成 delta。
const draftSigns = reactive<Record<string, ScoreSign>>({})
const note = ref('')
const newPlayerName = ref('')
const fastWinnerScore = ref('6')
const fastLoserScore = ref('2')
const roundWinnerId = ref('')
const fastSubmitting = ref(false)

// 当前房间由 store 统一管理，房间页只做展示和交互。
const room = computed(() => store.room)

const selectedRoundWinnerId = computed(() => {
  const players = room.value?.players ?? []
  if (players.some((player) => player.id === roundWinnerId.value)) return roundWinnerId.value
  return players[0]?.id ?? ''
})

const selectedRoundWinnerName = computed(() => {
  return room.value?.players.find((player) => player.id === selectedRoundWinnerId.value)?.name || '未选择'
})

const sortedPlayers = computed(() => {
  return [...(room.value?.players ?? [])].sort((a, b) => b.score - a.score)
})

const playerRecordStats = computed(() => {
  return buildPlayerRecordStats(room.value?.players ?? [], room.value?.records ?? [])
})

const visibleMembers = computed(() => {
  if (!room.value) return []
  if (store.isOwner) return room.value.members
  return store.currentMember ? [store.currentMember] : []
})

const roleText = computed(() => {
  if (store.currentRole === 'owner') return '房主'
  if (store.currentRole === 'scorer') return '记分员'
  return '观看'
})

// 计分区右上角合计，麻将模式用它提示本局总分是否归零。
const changeTotal = computed(() => {
  return room.value?.players.reduce((sum, player) => {
    return sum + signedScoreDelta(signFor(player.id), draftChanges[player.id] || '')
  }, 0) ?? 0
})

const fastSettlementTotal = computed(() => {
  if (!room.value) return 0
  return buildFastSettlementChanges(
    room.value.players,
    selectedRoundWinnerId.value,
    Number(fastWinnerScore.value || 0),
    Number(fastLoserScore.value || 0),
  ).reduce((sum, item) => sum + item.delta, 0)
})

onLoad((query) => {
  loadFastSettlementRule()
  const roomNo = typeof query?.roomNo === 'string' ? query.roomNo : ''
  if (roomNo) {
    void store.loadRoom(roomNo)
  }
})

onUnload(() => {
  store.stopWatching()
})

function toast(message: string) {
  uni.showToast({ title: message, icon: 'none', duration: 1400 })
}

function copyRoomNo() {
  if (!room.value) return
  uni.setClipboardData({ data: room.value.roomNo })
}

function signFor(playerId: string): ScoreSign {
  return draftSigns[playerId] ?? 'plus'
}

function toggleSign(playerId: string) {
  draftSigns[playerId] = signFor(playerId) === 'plus' ? 'minus' : 'plus'
}

function normalizeDraftScoreInput(playerId: string, event: Event) {
  const value = (event as { detail?: { value?: string } }).detail?.value ?? ''
  draftChanges[playerId] = String(value).replace(/\D/g, '')
}

function loadFastSettlementRule() {
  const value = uni.getStorageSync(FAST_SETTLE_RULE_STORAGE_KEY) as { winner?: string; loser?: string } | ''
  if (!value || typeof value !== 'object') return
  fastWinnerScore.value = String(value.winner || '6').replace(/\D/g, '') || '6'
  fastLoserScore.value = String(value.loser || '2').replace(/\D/g, '') || '2'
}

function saveFastSettlementRule() {
  uni.setStorageSync(FAST_SETTLE_RULE_STORAGE_KEY, {
    winner: fastWinnerScore.value,
    loser: fastLoserScore.value,
  })
}

function normalizeFastRuleInput(type: 'winner' | 'loser', event: Event) {
  const value = (event as { detail?: { value?: string } }).detail?.value ?? ''
  const normalized = String(value).replace(/\D/g, '').slice(0, 5)
  if (type === 'winner') {
    fastWinnerScore.value = normalized
  } else {
    fastLoserScore.value = normalized
  }
  saveFastSettlementRule()
}

function selectRoundWinner(playerId: string) {
  roundWinnerId.value = playerId
}

function boundMemberName(memberKey?: string) {
  if (!memberKey) return ''
  return room.value?.members.find((member) => member.memberKey === memberKey)?.name ?? ''
}

function boundPlayerFor(memberKey: string) {
  return room.value?.players.find((player) => player.memberKey === memberKey) ?? null
}

function availableSeatOptions(member: ScoreMember) {
  return room.value?.players.filter((player) => {
    return !player.memberKey || player.memberKey === member.memberKey
  }) ?? []
}

// 换座列表只显示空座和自己当前座，不暴露别人已占的位置。
function seatPickerLabels(member: ScoreMember) {
  return availableSeatOptions(member).map((player) => (
    player.memberKey === member.memberKey ? `${player.name}（当前）` : player.name
  ))
}

function playerHint(player: ScorePlayer) {
  const stats = playerRecordStats.value[player.id]
  const totalGames = (stats?.wins ?? 0) + (stats?.losses ?? 0)
  const parts = totalGames
    ? [`胜 ${stats.wins} 负 ${stats.losses}`, `胜率 ${stats.winRate}%`]
    : ['暂无战绩']
  const memberName = boundMemberName(player.memberKey)
  if (memberName) parts.push(`占位：${memberName}`)
  if (store.isOwner) parts.push('点此改名')
  return parts.join(' · ')
}

function memberRoleText(member: ScoreMember) {
  const role = member.role === 'owner' ? '房主' : member.role === 'scorer' ? '记分员' : '观看者'
  const player = boundPlayerFor(member.memberKey)
  const permissions = member.canChangeSeat ? '可换座' : ''
  const seat = player ? `占位：${player.name}` : '未占位'
  return [role, seat, permissions].filter(Boolean).join(' · ')
}

function seatPickerIndex(member: ScoreMember) {
  const options = availableSeatOptions(member)
  const index = options.findIndex((player) => player.memberKey === member.memberKey)
  return index >= 0 ? index : 0
}

function canShowSeatPicker(member: ScoreMember) {
  const hasSeatOption = availableSeatOptions(member).length > 0
  return hasSeatOption && (store.isOwner || (store.canChangeSeat && store.currentMember?.memberKey === member.memberKey))
}

// 根据输入框和正负号生成提交给云函数的 changes。
function buildChanges(): ScoreChange[] {
  if (!room.value) return []
  return room.value.players
    .map((player) => ({
      playerId: player.id,
      delta: signedScoreDelta(signFor(player.id), draftChanges[player.id] || ''),
    }))
    .filter((item) => item.delta !== 0)
}

async function submitScore() {
  if (!room.value) return
  const changes = buildChanges()
  const validation = validateScoreChanges(room.value.type, changes)
  if (validation) {
    toast(validation)
    return
  }

  try {
    await store.addRecord(changes, note.value, selectedRoundWinnerId.value)
    for (const key of Object.keys(draftChanges)) {
      draftChanges[key] = ''
      draftSigns[key] = 'plus'
    }
    note.value = ''
    toast('已记分')
  } catch (error) {
    toast(error instanceof Error ? error.message : '记分失败')
  }
}

async function submitFastSettlement() {
  if (!room.value || fastSubmitting.value) return
  const winner = room.value.players.find((player) => player.id === selectedRoundWinnerId.value)
  if (!winner) {
    toast('请选择赢家')
    return
  }

  const changes = buildFastSettlementChanges(
    room.value.players,
    winner.id,
    Number(fastWinnerScore.value || 0),
    Number(fastLoserScore.value || 0),
  )
  const validation = validateScoreChanges(room.value.type, changes)
  if (validation) {
    toast(validation)
    return
  }

  fastSubmitting.value = true
  try {
    saveFastSettlementRule()
    await store.addRecord(changes, `快速结算：${winner.name}`, winner.id)
    toast('已快速结算')
  } catch (error) {
    toast(error instanceof Error ? error.message : '快速结算失败')
  } finally {
    fastSubmitting.value = false
  }
}

function editPlayerName(player: ScorePlayer) {
  if (!store.isOwner) return
  ;(uni.showModal as any)({
    title: '修改玩家昵称',
    editable: true,
    placeholderText: '请输入玩家昵称',
    content: player.name,
    confirmText: '保存',
    success: (res: { confirm: boolean; content?: string }) => {
      if (!res.confirm) return
      void renamePlayer(player.id, res.content || '')
    },
  })
}

async function renamePlayer(playerId: string, name: string) {
  try {
    await store.renamePlayer(playerId, name)
    toast('已修改昵称')
  } catch (error) {
    toast(error instanceof Error ? error.message : '修改失败')
  }
}

async function toggleRole(memberKey: string, role: ScoreMember['role']) {
  try {
    await store.updateMemberRole(memberKey, role === 'scorer' ? 'viewer' : 'scorer')
  } catch (error) {
    toast(error instanceof Error ? error.message : '授权失败')
  }
}

async function toggleSeatPermission(member: ScoreMember) {
  try {
    await store.updateMemberSeatPermission(member.memberKey, !member.canChangeSeat)
    toast(member.canChangeSeat ? '已取消换座' : '已允许换座')
  } catch (error) {
    toast(error instanceof Error ? error.message : '换座授权失败')
  }
}

function openMemberManage(member: ScoreMember) {
  const items: Array<{ label: string; action: () => void }> = []
  if (member.role !== 'owner') {
    items.push({
      label: member.role === 'scorer' ? '取消记分授权' : '授权记分',
      action: () => void toggleRole(member.memberKey, member.role),
    })
    items.push({
      label: member.canChangeSeat ? '取消换座授权' : '授权换座',
      action: () => void toggleSeatPermission(member),
    })
  }
  if (boundPlayerFor(member.memberKey)) {
    items.push({
      label: '移出占位',
      action: () => void unbindMemberSeat(member),
    })
  }
  if (member.role !== 'owner') {
    items.push({
      label: '删除成员',
      action: () => confirmRemoveMember(member),
    })
  }
  if (!items.length) return
  uni.showActionSheet({
    itemList: items.map((item) => item.label),
    success: (res) => {
      items[res.tapIndex]?.action()
    },
  })
}

async function bindMemberSeat(member: ScoreMember, event: Event) {
  if (!room.value) return
  const index = Number((event as { detail?: { value?: string | number } }).detail?.value ?? 0)
  const player = availableSeatOptions(member)[index]
  if (!player) return
  try {
    await store.bindMemberToPlayer(member.memberKey, player.id)
    toast('已设置占位')
  } catch (error) {
    toast(error instanceof Error ? error.message : '占位失败')
  }
}

async function unbindMemberSeat(member: ScoreMember) {
  try {
    await store.unbindMemberFromPlayer(member.memberKey)
    toast('已移出占位')
  } catch (error) {
    toast(error instanceof Error ? error.message : '移出失败')
  }
}

function confirmRemoveMember(member: ScoreMember) {
  uni.showModal({
    title: '删除成员',
    content: `删除 ${member.name} 后，对方需要重新输入房间号加入`,
    confirmText: '删除',
    confirmColor: '#dc2626',
    success: (res) => {
      if (!res.confirm) return
      void removeMember(member)
    },
  })
}

async function removeMember(member: ScoreMember) {
  try {
    await store.removeMember(member.memberKey)
    toast('已删除成员')
  } catch (error) {
    toast(error instanceof Error ? error.message : '删除失败')
  }
}

async function addPlayer() {
  try {
    await store.addPlayer(newPlayerName.value)
    newPlayerName.value = ''
  } catch (error) {
    toast(error instanceof Error ? error.message : '添加失败')
  }
}

function canUndo(record: ScoreRecord) {
  if (!store.currentMember) return false
  return canUndoScoreRecord(store.currentRole, store.currentMember.memberKey, record)
}

async function undoRecord(record: ScoreRecord) {
  try {
    await store.undoRecord(record)
  } catch (error) {
    toast(error instanceof Error ? error.message : '撤销失败')
  }
}

function recordTitle(record: ScoreRecord) {
  if (record.type === 'undo') return record.note || '撤销记分'
  const names = new Map(room.value?.players.map((player) => [player.id, player.name]) ?? [])
  const winnerName = record.winnerPlayerName || names.get(record.winnerPlayerId || '') || ''
  const scoreText = record.changes
    .map((item) => `${names.get(item.playerId) || '玩家'} ${item.delta > 0 ? '+' : ''}${item.delta}`)
    .join('，')
  return winnerName ? `${winnerName} 胜 · ${scoreText}` : scoreText
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp)
  const hh = `${date.getHours()}`.padStart(2, '0')
  const mm = `${date.getMinutes()}`.padStart(2, '0')
  return `${hh}:${mm}`
}
</script>

<style lang="scss" scoped>
.room-page {
  min-height: 100vh;
  background: #f4f7fb;
}

.room-scroll {
  height: calc(100vh - 88rpx);
  padding: 0 24rpx 32rpx;
  box-sizing: border-box;
}

.room-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  margin: 8rpx 0 22rpx;
  padding: 26rpx 30rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #173756 0%, #122b44 100%);
  box-shadow: 0 14rpx 36rpx rgba(25, 50, 77, 0.16);
}

.room-head-main {
  flex: 1;
  min-width: 0;
  padding-top: 2rpx;
}

.room-title {
  display: block;
  font-size: 40rpx;
  line-height: 1.12;
  color: #fff;
  font-weight: 900;
}

.room-sub {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 700;
}

.room-code-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  min-width: 210rpx;
  padding: 0;
  box-sizing: border-box;
  text-align: right;
}

.room-code-label {
  display: block;
  font-size: 21rpx;
  color: rgba(255, 255, 255, 0.56);
  font-weight: 800;
}

.room-code-number {
  display: block;
  margin-top: 8rpx;
  color: #fff;
  font-size: 46rpx;
  line-height: 1;
  font-weight: 900;
  letter-spacing: 1rpx;
}

.copy-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 12rpx;
  min-width: 84rpx;
  height: 38rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  color: #19324d;
  background: #d9f8e8;
  font-size: 21rpx;
  font-weight: 800;
  box-sizing: border-box;
}

.role-pill {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: #e6f7f1;
}

.role-pill-text {
  font-size: 22rpx;
  color: #1f9d67;
  font-weight: 800;
}

.score-card,
.panel {
  border-radius: 26rpx;
  background: #fff;
  box-shadow: 0 8rpx 26rpx rgba(28, 55, 90, 0.08);
}

.score-card {
  padding: 10rpx 24rpx;
  margin-bottom: 22rpx;
}

.player-row,
.member-row,
.record-row,
.change-row {
  display: flex;
  align-items: center;
  min-height: 92rpx;
  border-bottom: 1rpx solid #eef2f6;
}

.player-row:last-child,
.member-row:last-child,
.record-row:last-child,
.change-row:last-child {
  border-bottom: 0;
}

.rank {
  width: 54rpx;
  height: 54rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 18rpx;
}

.rank-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 800;
}

.player-main,
.member-main,
.record-main {
  flex: 1;
  min-width: 0;
}

.member-actions {
  width: 300rpx;
  margin-left: 12rpx;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8rpx;
  flex-shrink: 0;
}

.seat-picker {
  display: block;
  flex-shrink: 0;
}

.player-name,
.member-name,
.record-title,
.panel-title {
  display: block;
  font-size: 28rpx;
  color: #111827;
  font-weight: 800;
}

.player-hint,
.member-role,
.panel-tip,
.record-sub {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #8b95a1;
}

.record-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 6rpx;
  min-width: 0;
}

.record-meta .record-sub {
  margin-top: 0;
}

.record-undone {
  font-size: 22rpx;
  color: #dc2626;
  font-weight: 700;
  flex-shrink: 0;
}

.score {
  margin-left: 18rpx;
  font-size: 42rpx;
  color: #111827;
  font-weight: 900;
}

.score--plus {
  color: #15803d;
}

.score--minus {
  color: #dc2626;
}

.panel {
  padding: 22rpx 24rpx;
  margin-bottom: 22rpx;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
  margin-bottom: 14rpx;
}

.fast-settle {
  margin-bottom: 18rpx;
  padding: 18rpx;
  border-radius: 22rpx;
  background: #f7fbff;
  border: 1rpx solid #e9f0f7;
}

.fast-rule-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.fast-field {
  width: 128rpx;
  height: 66rpx;
  padding: 0 14rpx;
  border-radius: 18rpx;
  background: #fff;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;
}

.fast-label {
  font-size: 22rpx;
  color: #667085;
  font-weight: 800;
}

.fast-input {
  flex: 1;
  min-width: 0;
  height: 66rpx;
  color: #111827;
  font-size: 26rpx;
  font-weight: 900;
  text-align: right;
}

.fast-submit-btn {
  width: 190rpx;
  flex-shrink: 0;
  height: 66rpx;
  line-height: 66rpx;
  margin: 0 0 0 auto;
  padding: 0 16rpx;
  border: 0;
  border-radius: 18rpx;
  background: #19324d;
  color: #fff;
  font-size: 24rpx;
  font-weight: 800;
  box-sizing: border-box;
}

.fast-submit-btn::after {
  border: 0;
}

.winner-list {
  display: flex;
  gap: 10rpx;
  margin-top: 14rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.winner-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 104rpx;
  height: 52rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: #fff;
  border: 1rpx solid #e6edf5;
  box-sizing: border-box;
  flex-shrink: 0;
}

.winner-chip--active {
  background: #e6f7f1;
  border-color: rgba(31, 157, 103, 0.28);
}

.winner-chip-text {
  max-width: 160rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 23rpx;
  color: #344054;
  font-weight: 800;
}

.winner-chip--active .winner-chip-text {
  color: #1f9d67;
}

.fast-summary {
  display: block;
  margin-top: 12rpx;
  font-size: 21rpx;
  color: #8b95a1;
  line-height: 1.35;
}

.change-list {
  margin-bottom: 16rpx;
}

.change-name {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #374151;
  font-weight: 700;
}

.sign-toggle {
  width: 72rpx;
  height: 58rpx;
  margin: 0 14rpx 0 18rpx;
  border-radius: 18rpx;
  border: 1rpx solid rgba(31, 157, 103, 0.18);
  background: #e8f8f1;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sign-toggle--minus {
  border-color: rgba(220, 38, 38, 0.18);
  background: #fee8e8;
}

.sign-toggle-text {
  color: #15803d;
  font-size: 34rpx;
  line-height: 1;
  font-weight: 900;
}

.sign-toggle--minus .sign-toggle-text {
  color: #dc2626;
}

.change-input,
.note-input,
.add-player-input {
  height: 72rpx;
  border-radius: 18rpx;
  background: #f7f9fc;
  color: #111827;
  font-size: 26rpx;
  box-sizing: border-box;
}

.change-input {
  width: 150rpx;
  padding: 0 20rpx;
  text-align: right;
}

.note-input {
  width: 100%;
  padding: 0 22rpx;
  margin-bottom: 16rpx;
}

.input-placeholder {
  color: #a0a7b2;
}

.submit-btn {
  height: 84rpx;
  line-height: 84rpx;
  border-radius: 22rpx;
  background: #19324d;
  color: #fff;
  font-size: 28rpx;
  font-weight: 800;
  border: 0;
}

.small-btn,
.undo-btn {
  width: 112rpx;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 18rpx;
  border: 0;
  font-size: 23rpx;
  font-weight: 800;
}

.mini-btn {
  width: 66rpx;
  height: 48rpx;
  line-height: 48rpx;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 14rpx;
  background: #e6f7f1;
  color: #1f9d67;
  font-size: 20rpx;
  font-weight: 800;
  text-align: center;
  box-sizing: border-box;
}

.mini-btn--seat {
  background: #eef6ff;
  color: #2f80ed;
}

.mini-btn--ghost {
  background: #f3f4f6;
  color: #6b7280;
}

.mini-btn--danger {
  background: #fee2e2;
  color: #dc2626;
}

.small-btn {
  color: #1f9d67;
  background: #e6f7f1;
}

.small-btn--dark {
  color: #fff;
  background: #19324d;
}

.undo-btn {
  color: #dc2626;
  background: #fee2e2;
}

.add-player {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-top: 18rpx;
}

.add-player-input {
  flex: 1;
  padding: 0 22rpx;
}

.empty {
  padding: 30rpx 0 12rpx;
  text-align: center;
}

.empty-text,
.error-text {
  font-size: 24rpx;
  color: #8b95a1;
}

.error-block {
  padding: 18rpx 22rpx;
  border-radius: 18rpx;
  background: #fff1f2;
}

.error-text {
  color: #dc2626;
}
</style>
