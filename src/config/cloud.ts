// 当前微信云开发环境 ID。云函数和数据库监听都使用这个环境。
export const WECHAT_CLOUD_ENV_ID = 'cloud1-d8gm0xfgede0986e2'

// 云数据库集合名集中维护，避免页面/服务层散落硬编码字符串。
export const CLOUD_COLLECTIONS = {
  shiguangxuTodos: 'sgx_todos',
  scoreRooms: 'score_rooms',
  scoreRoomMembers: 'score_room_members',
} as const
