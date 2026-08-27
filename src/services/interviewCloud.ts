import { CLOUD_COLLECTIONS } from '@/config/cloud'
import { getWechatCloudDatabase } from '@/services/wechatCloud'
import type {
  InterviewBankSeed,
  InterviewQuestionSeed,
  InterviewQuestionType,
} from '@/store/interviewSeed'

export interface InterviewBankDoc extends InterviewBankSeed {
  _id: string
  schemaVersion?: number
}

export interface InterviewQuestionDoc extends InterviewQuestionSeed {
  _id: string
  schemaVersion?: number
}

export interface InterviewProgressSnapshot {
  bankId: string
  wrongIds: string[]
  practiceMode: 'ordered' | 'random'
  lastQuestionId: string | null
  updatedAt: number
}

interface InterviewProgressDoc extends InterviewProgressSnapshot {
  _id: string
  schemaVersion?: number
}

const SCHEMA_VERSION = 2

function getBankCollection() {
  return getWechatCloudDatabase()?.collection(CLOUD_COLLECTIONS.interviewBanks) ?? null
}

function getQuestionCollection() {
  return getWechatCloudDatabase()?.collection(CLOUD_COLLECTIONS.interviewQuestions) ?? null
}

function getProgressCollection() {
  return getWechatCloudDatabase()?.collection(CLOUD_COLLECTIONS.interviewProgress) ?? null
}

function getCurrentUserQuery() {
  return { _openid: '{openid}' }
}

function normalizeBank(doc: Partial<InterviewBankDoc>): InterviewBankSeed {
  return {
    id: typeof doc._id === 'string' ? doc._id : typeof doc.id === 'string' ? doc.id : '',
    name: typeof doc.name === 'string' ? doc.name : '',
    description: typeof doc.description === 'string' ? doc.description : '',
    color: typeof doc.color === 'string' ? doc.color : '#1D4ED8',
    questionCount: typeof doc.questionCount === 'number' ? doc.questionCount : 0,
  }
}

function normalizeQuestion(doc: Partial<InterviewQuestionDoc>): InterviewQuestionSeed {
  const type = doc.type === 'qa' ? 'qa' : 'choice'
  return {
    id: typeof doc._id === 'string' ? doc._id : typeof doc.id === 'string' ? doc.id : '',
    bankId: typeof doc.bankId === 'string' ? doc.bankId : '',
    sort: typeof doc.sort === 'number' ? doc.sort : 0,
    title: typeof doc.title === 'string' ? doc.title : '',
    type,
    options: Array.isArray(doc.options) ? doc.options.filter((value): value is string => typeof value === 'string') : [],
    answerText: typeof doc.answerText === 'string' ? doc.answerText : '',
    answerIndex: typeof doc.answerIndex === 'number' ? doc.answerIndex : undefined,
    analysis: typeof doc.analysis === 'string' ? doc.analysis : '',
    tags: Array.isArray(doc.tags) ? doc.tags.filter((value): value is string => typeof value === 'string') : [],
    imageUrl: typeof doc.imageUrl === 'string' ? doc.imageUrl : undefined,
  }
}

function normalizeProgress(doc: Partial<InterviewProgressDoc>): InterviewProgressSnapshot {
  return {
    bankId: typeof doc.bankId === 'string' ? doc.bankId : '',
    wrongIds: Array.isArray(doc.wrongIds) ? doc.wrongIds.filter((value): value is string => typeof value === 'string') : [],
    practiceMode: doc.practiceMode === 'random' ? 'random' : 'ordered',
    lastQuestionId: typeof doc.lastQuestionId === 'string' ? doc.lastQuestionId : null,
    updatedAt: typeof doc.updatedAt === 'number' ? doc.updatedAt : 0,
  }
}

export async function fetchInterviewBanks(): Promise<InterviewBankSeed[] | null> {
  const collection = getBankCollection() as any
  if (!collection) return null
  try {
    const res = await collection.orderBy('name', 'asc').get()
    return (res.data as Partial<InterviewBankDoc>[]).map(normalizeBank).filter((item) => Boolean(item.id))
  } catch {
    return null
  }
}

export async function saveInterviewBanks(seed: InterviewBankSeed[]): Promise<boolean> {
  const collection = getBankCollection() as any
  if (!collection) return false
  try {
    await Promise.all(
      seed.map((item) =>
        collection.doc(item.id).set({
          data: {
            ...item,
            schemaVersion: SCHEMA_VERSION,
          },
        }),
      ),
    )
    return true
  } catch {
    return false
  }
}

export async function deleteInterviewBank(bankId: string): Promise<boolean> {
  const collection = getBankCollection() as any
  if (!collection) return false
  try {
    await collection.doc(bankId).remove()
    return true
  } catch {
    return false
  }
}

export async function fetchInterviewQuestions(bankId?: string): Promise<InterviewQuestionSeed[] | null> {
  const collection = getQuestionCollection() as any
  if (!collection) return null
  try {
    const query = bankId ? collection.where({ bankId }) : collection
    const res = await query.orderBy('sort', 'asc').get()
    return (res.data as Partial<InterviewQuestionDoc>[]).map(normalizeQuestion).filter((item) => Boolean(item.id) && Boolean(item.bankId))
  } catch {
    return null
  }
}

export async function saveInterviewQuestion(question: InterviewQuestionSeed): Promise<boolean> {
  const collection = getQuestionCollection() as any
  if (!collection) return false
  try {
    await collection.doc(question.id).set({
      data: {
        ...question,
        schemaVersion: SCHEMA_VERSION,
      },
    })
    return true
  } catch {
    return false
  }
}

export async function updateInterviewQuestion(question: InterviewQuestionSeed): Promise<boolean> {
  return saveInterviewQuestion(question)
}

export async function deleteInterviewQuestion(questionId: string): Promise<boolean> {
  const collection = getQuestionCollection() as any
  if (!collection) return false
  try {
    await collection.doc(questionId).remove()
    return true
  } catch {
    return false
  }
}

export async function deleteInterviewProgress(bankId: string): Promise<boolean> {
  const collection = getProgressCollection() as any
  if (!collection) return false
  try {
    const res = await collection.where({ ...getCurrentUserQuery(), bankId }).limit(1).get()
    const doc = res.data[0] as Partial<InterviewProgressDoc> | undefined
    if (doc?._id) {
      await collection.doc(doc._id).remove()
    }
    return true
  } catch {
    return false
  }
}

export async function fetchInterviewProgress(bankId: string): Promise<InterviewProgressSnapshot | null> {
  const collection = getProgressCollection()
  if (!collection) return null
  try {
    const res = await collection.where({ ...getCurrentUserQuery(), bankId }).limit(1).get()
    const doc = res.data[0] as Partial<InterviewProgressDoc> | undefined
    return doc ? normalizeProgress(doc) : null
  } catch {
    return null
  }
}

export async function saveInterviewProgress(progress: InterviewProgressSnapshot): Promise<boolean> {
  const collection = getProgressCollection()
  if (!collection) return false
  try {
    const res = await collection.where({ ...getCurrentUserQuery(), bankId: progress.bankId }).limit(1).get()
    const doc = res.data[0] as Partial<InterviewProgressDoc> | undefined
    const data = {
      ...progress,
      schemaVersion: SCHEMA_VERSION,
    }
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
