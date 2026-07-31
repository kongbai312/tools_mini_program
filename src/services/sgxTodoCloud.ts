import { CLOUD_COLLECTIONS } from '@/config/cloud'
import { getWechatCloudDatabase } from '@/services/wechatCloud'
import type { TodoItem } from '@/store/shiguangxu'

export interface SgxTodoCloudSnapshot {
  todos: TodoItem[]
  updatedAt: number
}

interface SgxTodoCloudDoc extends SgxTodoCloudSnapshot {
  _id: string
  schemaVersion?: number
}

const SCHEMA_VERSION = 1

// 时光序待办云同步集合，非微信环境下返回 null。
function getCollection() {
  return getWechatCloudDatabase()?.collection(CLOUD_COLLECTIONS.shiguangxuTodos) ?? null
}

// 小程序云数据库会把 {openid} 替换为当前用户 openid。
function getCurrentUserQuery() {
  return { _openid: '{openid}' }
}

// 兼容旧文档和异常文档，保证返回给 store 的数据结构稳定。
function normalizeSnapshot(doc: Partial<SgxTodoCloudDoc>): SgxTodoCloudSnapshot {
  return {
    todos: Array.isArray(doc.todos) ? doc.todos : [],
    updatedAt: typeof doc.updatedAt === 'number' ? doc.updatedAt : 0,
  }
}

// 读取当前用户的待办云快照；失败时返回 null，由 store 决定降级。
export async function fetchSgxTodoCloudSnapshot(): Promise<SgxTodoCloudSnapshot | null> {
  const collection = getCollection()
  if (!collection) return null

  try {
    const res = await collection.where(getCurrentUserQuery()).limit(1).get()
    const doc = res.data[0] as Partial<SgxTodoCloudDoc> | undefined
    return doc ? normalizeSnapshot(doc) : null
  } catch {
    return null
  }
}

// 保存当前用户的待办快照：已有文档更新，没有文档就新增。
export async function saveSgxTodoCloudSnapshot(
  todos: TodoItem[],
  updatedAt = Date.now(),
): Promise<boolean> {
  const collection = getCollection()
  if (!collection) return false

  const data = {
    todos,
    updatedAt,
    schemaVersion: SCHEMA_VERSION,
  }

  try {
    const res = await collection.where(getCurrentUserQuery()).limit(1).get()
    const doc = res.data[0] as Partial<SgxTodoCloudDoc> | undefined
    if (doc?._id) {
      await collection.doc(doc._id).update({ data })
    } else {
      await collection.add({ data })
    }
    return true
  } catch {
    return false
  }
}
