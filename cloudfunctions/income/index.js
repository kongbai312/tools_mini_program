const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const COLLECTION = 'sgx_income_records'
const SCHEMA_VERSION = 1

function ok(data) {
  return { ok: true, data }
}

function fail(message) {
  return { ok: false, message }
}

function roundMoney(value) {
  return Math.round(value * 100) / 100
}

function normalizeAmount(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return 0
  return roundMoney(amount)
}

function normalizeRecord(raw) {
  const amount = normalizeAmount(raw && raw.amount)
  const date = String((raw && raw.date) || '').trim()
  const source = String((raw && raw.source) || '').trim().slice(0, 20)
  const createdAt = typeof (raw && raw.createdAt) === 'number' ? raw.createdAt : Date.now()
  if (amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !source) return null
  return {
    id: String((raw && raw.id) || `income_${createdAt}_${Math.random().toString(36).slice(2, 8)}`),
    amount,
    date,
    source,
    remark: String((raw && raw.remark) || '').trim().slice(0, 60),
    createdAt,
  }
}

function normalizeSnapshot(doc) {
  const records = Array.isArray(doc && doc.records)
    ? doc.records.map(normalizeRecord).filter(Boolean)
    : []
  return {
    records,
    updatedAt: typeof (doc && doc.updatedAt) === 'number' ? doc.updatedAt : 0,
  }
}

async function getUserDoc(openid) {
  const result = await db.collection(COLLECTION).where({ _openid: openid }).limit(1).get()
  return result.data[0] || null
}

exports.main = async (event) => {
  const { OPENID: openid } = cloud.getWXContext()
  if (!openid) return fail('无法获取用户身份')

  const action = event && event.action

  try {
    if (action === 'fetch') {
      const doc = await getUserDoc(openid)
      return ok(doc ? normalizeSnapshot(doc) : { records: [], updatedAt: 0 })
    }

    if (action === 'save') {
      const records = Array.isArray(event.records)
        ? event.records.map(normalizeRecord).filter(Boolean)
        : []
      const updatedAt = typeof event.updatedAt === 'number' ? event.updatedAt : Date.now()
      const data = {
        records,
        updatedAt,
        schemaVersion: SCHEMA_VERSION,
      }
      const doc = await getUserDoc(openid)
      if (doc && doc._id) {
        await db.collection(COLLECTION).doc(doc._id).update({ data })
      } else {
        await db.collection(COLLECTION).add({ data })
      }
      return ok({ saved: true })
    }

    return fail('未知操作')
  } catch (error) {
    return fail(error && error.message ? error.message : '操作失败')
  }
}
