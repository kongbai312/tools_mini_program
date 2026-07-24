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

function getCollection() {
  return getWechatCloudDatabase()?.collection(CLOUD_COLLECTIONS.shiguangxuTodos) ?? null
}

function getCurrentUserQuery() {
  return { _openid: '{openid}' }
}

function normalizeSnapshot(doc: Partial<SgxTodoCloudDoc>): SgxTodoCloudSnapshot {
  return {
    todos: Array.isArray(doc.todos) ? doc.todos : [],
    updatedAt: typeof doc.updatedAt === 'number' ? doc.updatedAt : 0,
  }
}

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
