import { CLOUD_COLLECTIONS } from '@/config/cloud'
import { getWechatCloud, getWechatCloudDatabase } from '@/services/wechatCloud'
import type { ScoreRoom } from '@/store/scoreboard'

interface ScoreboardResult<T> {
  ok: boolean
  message?: string
  data?: T
}

// 计分器所有写操作都通过 scoreboard 云函数，前端只传 action 和业务参数。
export async function callScoreboard<T>(
  action: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  const cloud = getWechatCloud()
  if (!cloud) {
    throw new Error('实时房间仅支持在微信小程序中使用')
  }

  const response = await (cloud as any).callFunction({
    name: 'scoreboard',
    data: { action, ...payload },
  })
  const result = response?.result as ScoreboardResult<T> | undefined
  if (!result?.ok || result.data === undefined) {
    throw new Error(result?.message || '操作失败，请稍后重试')
  }
  return result.data
}

// 监听单个计分房间文档，实现多台手机实时同步分数、成员和记录。
export function watchScoreRoom(
  roomId: string,
  onChange: (room: ScoreRoom) => void,
  onError: () => void,
): (() => void) | null {
  const database = getWechatCloudDatabase()
  if (!database) return null

  const watcher = (database.collection(CLOUD_COLLECTIONS.scoreRooms).doc(roomId) as any).watch({
    onChange(snapshot: { docs?: ScoreRoom[] }) {
      const room = snapshot.docs?.[0]
      if (room) onChange(room)
    },
    onError,
  })

  return () => watcher?.close?.()
}
