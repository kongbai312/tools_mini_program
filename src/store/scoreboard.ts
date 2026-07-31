import { defineStore } from 'pinia'
import {
  canUndoScoreRecord,
  upsertRecentScoreRoom,
  type ScoreChange,
  type ScorePlayer,
  type ScoreRecord as CoreScoreRecord,
  type RecentScoreRoomItem,
  type ScoreRole,
  type ScoreboardType,
} from '@/utils/scoreboardCore'
import { callScoreboard, watchScoreRoom } from '@/services/scoreboardCloud'

export type { ScoreChange, ScorePlayer, ScoreRole, ScoreboardType }

export interface ScoreMember {
  memberKey: string
  name: string
  role: ScoreRole
  canChangeSeat?: boolean
  joinedAt: number
}

export interface ScoreRecord extends CoreScoreRecord {
  type: 'score' | 'undo' | 'reset'
  note?: string
  winnerPlayerId?: string
  winnerPlayerName?: string
  sourceRecordId?: string
  undoneByName?: string
}

export interface ScoreRoom {
  _id: string
  roomNo: string
  title: string
  type: ScoreboardType
  ownerMemberKey: string
  players: ScorePlayer[]
  members: ScoreMember[]
  records: ScoreRecord[]
  createdAt: number
  updatedAt: number
  status: 'active' | 'closed'
}

export interface OwnedScoreRoom {
  _id: string
  roomNo: string
  title: string
  type: ScoreboardType
  playersCount: number
  recordsCount: number
  updatedAt: number
  createdAt: number
}

export interface RecentScoreRoom extends RecentScoreRoomItem {}

interface ScoreSession {
  room: ScoreRoom
  member: ScoreMember
}

const MEMBER_KEY_PREFIX = 'scoreboard_member_'
const NICKNAME_STORAGE_KEY = 'scoreboard_nickname'
const RECENT_ROOMS_STORAGE_KEY = 'scoreboard_recent_rooms'

let closeRoomWatcher: (() => void) | null = null

// 每个房间保存一个本机 memberKey，方便再次进入时恢复同一个成员身份。
function memberKeyStorageKey(roomNo: string) {
  return `${MEMBER_KEY_PREFIX}${roomNo}`
}

function saveMemberKey(roomNo: string, memberKey: string) {
  uni.setStorageSync(memberKeyStorageKey(roomNo), memberKey)
}

function loadMemberKey(roomNo: string): string {
  return uni.getStorageSync(memberKeyStorageKey(roomNo)) || ''
}

export const useScoreboardStore = defineStore('scoreboard', {
  state: () => ({
    // 当前正在查看的房间完整快照，由云函数返回或数据库 watch 推送。
    room: null as ScoreRoom | null,
    // 当前手机在该房间内对应的成员身份，决定记分/换座/管理权限。
    currentMember: null as ScoreMember | null,
    // 房主创建过的活跃房间，来自云端查询。
    ownedRooms: [] as OwnedScoreRoom[],
    // 本机进入过的房间历史，存本地缓存，作为快捷入口使用。
    recentRooms: [] as RecentScoreRoom[],
    loading: false,
    ownedRoomsLoading: false,
    errorMessage: '',
  }),

  getters: {
    currentRole(state): ScoreRole {
      return state.currentMember?.role ?? 'viewer'
    },
    canEditScore(): boolean {
      return this.currentRole === 'owner' || this.currentRole === 'scorer'
    },
    isOwner(): boolean {
      return this.currentRole === 'owner'
    },
    canChangeSeat(): boolean {
      return this.currentRole === 'owner' || Boolean(this.currentMember?.canChangeSeat)
    },
  },

  actions: {
    getSavedNickname() {
      return uni.getStorageSync(NICKNAME_STORAGE_KEY) || ''
    },

    saveNickname(name: string) {
      const value = name.trim().slice(0, 12)
      if (value) uni.setStorageSync(NICKNAME_STORAGE_KEY, value)
      return value || '访客'
    },

    loadRecentRooms() {
      const value = uni.getStorageSync(RECENT_ROOMS_STORAGE_KEY)
      this.recentRooms = Array.isArray(value) ? value.slice(0, 10) : []
      return this.recentRooms
    },

    // 将房间写入本地历史：同房间去重置顶，只保留最近 10 条。
    rememberRoom(room: ScoreRoom) {
      const item: RecentScoreRoom = {
        roomNo: room.roomNo,
        title: room.title,
        type: room.type,
        playersCount: room.players.length,
        updatedAt: room.updatedAt,
        visitedAt: Date.now(),
      }
      this.recentRooms = upsertRecentScoreRoom(this.recentRooms, item)
      uni.setStorageSync(RECENT_ROOMS_STORAGE_KEY, this.recentRooms)
    },

    applyRoom(room: ScoreRoom) {
      this.room = room
      const memberKey = loadMemberKey(room.roomNo)
      this.currentMember = room.members.find((item) => item.memberKey === memberKey) ?? null
    },

    // 云函数返回 room + member 时统一落入 store，并开启实时监听。
    applySession(session: ScoreSession) {
      saveMemberKey(session.room.roomNo, session.member.memberKey)
      this.room = session.room
      this.currentMember = session.member
      this.startWatching(session.room._id)
    },

    startWatching(roomId: string) {
      closeRoomWatcher?.()
      closeRoomWatcher = watchScoreRoom(
        roomId,
        (room) => this.applyRoom(room),
        () => {
          this.errorMessage = '实时同步已断开，请重新进入房间'
        },
      )
    },

    stopWatching() {
      closeRoomWatcher?.()
      closeRoomWatcher = null
    },

    async createRoom(type: ScoreboardType, nickname: string) {
      this.loading = true
      this.errorMessage = ''
      try {
        const session = await callScoreboard<ScoreSession>('createRoom', {
          type,
          nickname: this.saveNickname(nickname),
        })
        this.applySession(session)
        this.rememberRoom(session.room)
        void this.loadOwnedRooms()
        return session.room
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : '创建房间失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async joinRoom(roomNo: string, nickname: string) {
      this.loading = true
      this.errorMessage = ''
      try {
        const session = await callScoreboard<ScoreSession>('joinRoom', {
          roomNo: roomNo.trim(),
          nickname: this.saveNickname(nickname),
        })
        this.applySession(session)
        this.rememberRoom(session.room)
        return session.room
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : '加入房间失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async loadRoom(roomNo: string) {
      this.loading = true
      this.errorMessage = ''
      try {
        const session = await callScoreboard<ScoreSession>('getRoom', {
          roomNo,
        })
        this.applySession(session)
        this.rememberRoom(session.room)
        return session.room
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : '加载房间失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async addRecord(changes: ScoreChange[], note = '', winnerPlayerId = '') {
      if (!this.room) return
      const session = await callScoreboard<ScoreSession>('addRecord', {
        roomNo: this.room.roomNo,
        changes,
        note: note.trim().slice(0, 30),
        winnerPlayerId,
      })
      this.applySession(session)
    },

    async undoRecord(record: ScoreRecord) {
      if (!this.room || !this.currentMember) return
      if (!canUndoScoreRecord(this.currentRole, this.currentMember.memberKey, record)) {
        throw new Error('没有权限撤销这条记录')
      }
      const session = await callScoreboard<ScoreSession>('undoRecord', {
        roomNo: this.room.roomNo,
        recordId: record.id,
      })
      this.applySession(session)
    },

    async updateMemberRole(memberKey: string, role: 'scorer' | 'viewer') {
      if (!this.room) return
      const session = await callScoreboard<ScoreSession>('updateMemberRole', {
        roomNo: this.room.roomNo,
        memberKey,
        role,
      })
      this.applySession(session)
    },

    async updateMemberSeatPermission(memberKey: string, canChangeSeat: boolean) {
      if (!this.room) return
      const session = await callScoreboard<ScoreSession>('updateMemberSeatPermission', {
        roomNo: this.room.roomNo,
        memberKey,
        canChangeSeat,
      })
      this.applySession(session)
    },

    async bindMemberToPlayer(memberKey: string, playerId: string) {
      if (!this.room) return
      const session = await callScoreboard<ScoreSession>('bindMemberToPlayer', {
        roomNo: this.room.roomNo,
        memberKey,
        playerId,
      })
      this.applySession(session)
    },

    async unbindMemberFromPlayer(memberKey: string) {
      if (!this.room) return
      const session = await callScoreboard<ScoreSession>('unbindMemberFromPlayer', {
        roomNo: this.room.roomNo,
        memberKey,
      })
      this.applySession(session)
    },

    async removeMember(memberKey: string) {
      if (!this.room) return
      const session = await callScoreboard<ScoreSession>('removeMember', {
        roomNo: this.room.roomNo,
        memberKey,
      })
      this.applySession(session)
    },

    async addPlayer(name: string) {
      if (!this.room) return
      const value = name.trim().slice(0, 12)
      if (!value) throw new Error('请输入玩家名称')
      if (this.room.players.length >= 50) throw new Error('一个房间最多添加 50 位玩家')

      const colors = ['#2F80ED', '#27AE60', '#EB5757', '#F2994A', '#9B51E0', '#00A8A8']
      const players: ScorePlayer[] = [
        ...this.room.players,
        {
          id: `player_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: value,
          score: 0,
          color: colors[this.room.players.length % colors.length],
        },
      ]
      const session = await callScoreboard<ScoreSession>('updatePlayers', {
        roomNo: this.room.roomNo,
        players,
      })
      this.applySession(session)
    },

    async renamePlayer(playerId: string, name: string) {
      if (!this.room) return
      const session = await callScoreboard<ScoreSession>('updatePlayerName', {
        roomNo: this.room.roomNo,
        playerId,
        name: name.trim().slice(0, 12),
      })
      this.applySession(session)
    },

    async loadOwnedRooms() {
      this.ownedRoomsLoading = true
      try {
        this.ownedRooms = await callScoreboard<OwnedScoreRoom[]>('listOwnedRooms')
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : '加载房间列表失败'
      } finally {
        this.ownedRoomsLoading = false
      }
    },

    async deleteOwnedRoom(roomNo: string) {
      await callScoreboard<{ roomNo: string }>('deleteRoom', { roomNo })
      this.ownedRooms = this.ownedRooms.filter((room) => room.roomNo !== roomNo)
      this.recentRooms = this.recentRooms.filter((room) => room.roomNo !== roomNo)
      uni.setStorageSync(RECENT_ROOMS_STORAGE_KEY, this.recentRooms)
      if (this.room?.roomNo === roomNo) {
        this.stopWatching()
        this.room = null
        this.currentMember = null
      }
    },
  },
})
