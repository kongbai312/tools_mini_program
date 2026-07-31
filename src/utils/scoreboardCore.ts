export type ScoreboardType = 'general' | 'mahjong'
export type ScoreRole = 'owner' | 'scorer' | 'viewer'
export type ScoreSign = 'plus' | 'minus'

export interface ScorePlayer {
  id: string
  name: string
  score: number
  color: string
  memberKey?: string
}

export interface ScoreChange {
  playerId: string
  delta: number
}

export interface ScoreRecord {
  id: string
  actorMemberKey: string
  actorName: string
  changes: ScoreChange[]
  createdAt: number
  undoneAt: number
  winnerPlayerId?: string
}

export interface PlayerRecordStats {
  wins: number
  losses: number
  winRate: number
}

export interface OwnedRoomFilterItem {
  roomNo: string
  ownerMemberKey: string
  status: 'active' | 'closed'
  updatedAt: number
}

export interface RecentScoreRoomItem {
  roomNo: string
  title: string
  type: ScoreboardType
  playersCount: number
  updatedAt: number
  visitedAt: number
}

// 应用一条记分记录到玩家列表，不直接修改原数组，方便云端/前端复用。
export function applyScoreChanges(players: ScorePlayer[], changes: ScoreChange[]): ScorePlayer[] {
  const changeMap = new Map(changes.map((item) => [item.playerId, item.delta]))
  return players.map((player) => ({
    ...player,
    score: player.score + (changeMap.get(player.id) ?? 0),
  }))
}

// 撤销记录时使用原记录的反向分数变动。
export function inverseScoreChanges(changes: ScoreChange[]): ScoreChange[] {
  return changes.map((item) => ({
    playerId: item.playerId,
    delta: -item.delta,
  }))
}

// 前端计分输入拆成“正负号 + 纯数字”，这里合成真正的 delta。
export function signedScoreDelta(sign: ScoreSign, value: string): number {
  const amount = Number(value.replace(/\D/g, '') || 0)
  return sign === 'minus' ? -amount : amount
}

// 提交记分前的通用校验；麻将模式额外要求本局总分为 0。
export function validateScoreChanges(
  type: ScoreboardType,
  changes: ScoreChange[],
): string | null {
  if (!changes.length) return '请至少修改一位玩家的分数'
  if (changes.some((item) => !item.playerId || !Number.isFinite(item.delta) || item.delta === 0)) {
    return '分数变动无效'
  }
  if (type === 'mahjong') {
    const total = changes.reduce((sum, item) => sum + item.delta, 0)
    if (total !== 0) return '麻将计分的本局总分必须为 0'
  }
  return null
}

// 快速结算：赢家加固定分，其余玩家扣固定分，最终仍交给通用记分校验兜底。
export function buildFastSettlementChanges(
  players: ScorePlayer[],
  winnerPlayerId: string,
  winnerDelta: number,
  loserDelta: number,
): ScoreChange[] {
  const winnerScore = Math.abs(Math.trunc(winnerDelta))
  const loserScore = Math.abs(Math.trunc(loserDelta))
  if (!players.length || !winnerPlayerId || winnerScore <= 0 || loserScore <= 0) return []
  if (!players.some((player) => player.id === winnerPlayerId)) return []

  return players.map((player) => ({
    playerId: player.id,
    delta: player.id === winnerPlayerId ? winnerScore : -loserScore,
  }))
}

export function buildPlayerRecordStats(
  players: ScorePlayer[],
  records: ScoreRecord[],
): Record<string, PlayerRecordStats> {
  const stats = Object.fromEntries(players.map((player) => [
    player.id,
    { wins: 0, losses: 0, winRate: 0 },
  ])) as Record<string, PlayerRecordStats>

  records.forEach((record) => {
    if (record.undoneAt || !record.winnerPlayerId || !stats[record.winnerPlayerId]) return

    stats[record.winnerPlayerId].wins += 1
    record.changes.forEach((change) => {
      if (change.playerId !== record.winnerPlayerId && change.delta < 0 && stats[change.playerId]) {
        stats[change.playerId].losses += 1
      }
    })
  })

  Object.values(stats).forEach((item) => {
    const total = item.wins + item.losses
    item.winRate = total ? Math.round((item.wins / total) * 100) : 0
  })

  return stats
}

// 撤销权限：房主可撤销所有记录，记分员只能撤销自己的未撤销记录。
export function canUndoScoreRecord(
  role: ScoreRole,
  memberKey: string,
  record: ScoreRecord,
): boolean {
  if (record.undoneAt) return false
  if (role === 'owner') return true
  return role === 'scorer' && record.actorMemberKey === memberKey
}

// 房主首页只展示自己创建且仍活跃的房间，并按更新时间倒序。
export function filterOwnedActiveRooms<T extends OwnedRoomFilterItem>(
  rooms: T[],
  ownerMemberKey: string,
): T[] {
  return rooms
    .filter((room) => room.status === 'active' && room.ownerMemberKey === ownerMemberKey)
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

// 本地历史房间：重复房间置顶并刷新信息，最多保留 limit 条。
export function upsertRecentScoreRoom<T extends RecentScoreRoomItem>(
  rooms: T[],
  room: T,
  limit = 10,
): T[] {
  return [
    room,
    ...rooms.filter((item) => item.roomNo !== room.roomNo),
  ]
    .sort((a, b) => b.visitedAt - a.visitedAt)
    .slice(0, limit)
}

// 换座只能换到空座，或者保持自己当前占用的座位。
export function canUsePlayerSeat(
  players: ScorePlayer[],
  memberKey: string,
  playerId: string,
): boolean {
  if (!memberKey || !playerId) return false
  const target = players.find((player) => player.id === playerId)
  if (!target) return false
  return !target.memberKey || target.memberKey === memberKey
}

// 座位管理权限：房主可操作所有人，被授权成员只能操作自己。
export function canManageSeat(
  role: ScoreRole,
  actorMemberKey: string,
  targetMemberKey: string,
  canChangeSeat = false,
): boolean {
  if (role === 'owner') return true
  return Boolean(canChangeSeat && actorMemberKey && actorMemberKey === targetMemberKey)
}

// 将成员绑定到指定空座，同时清理该成员原本占用的座位。
export function assignMemberToPlayer(
  players: ScorePlayer[],
  memberKey: string,
  playerId: string,
): ScorePlayer[] {
  if (!canUsePlayerSeat(players, memberKey, playerId)) return players
  return players.map((player) => {
    if (player.id === playerId) return { ...player, memberKey }
    if (player.memberKey === memberKey) {
      const { memberKey: _memberKey, ...rest } = player
      return rest
    }
    return player
  })
}

// 删除成员或移出占位时，清空玩家列表里的 memberKey 绑定。
export function clearMemberPlayerBinding(
  players: ScorePlayer[],
  memberKey: string,
): ScorePlayer[] {
  if (!memberKey) return players
  return players.map((player) => {
    if (player.memberKey !== memberKey) return player
    const { memberKey: _memberKey, ...rest } = player
    return rest
  })
}

// 房主修改的是房间内玩家/座位昵称，不会同步修改成员昵称。
export function renameScorePlayer(
  players: ScorePlayer[],
  playerId: string,
  name: string,
): ScorePlayer[] {
  const value = name.trim().slice(0, 12)
  if (!value) return players
  return players.map((player) => (
    player.id === playerId
      ? { ...player, name: value }
      : player
  ))
}
