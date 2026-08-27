import { defineStore } from 'pinia'
import { todayStr } from '@/utils/sgxDate'
import {
  buildIncomeSummary,
  createIncomeRecord,
  normalizeIncomeRecord,
  sortIncomeRecords,
  type IncomeRecord,
} from '@/utils/incomeCore'
import {
  fetchIncomeCloudSnapshot,
  saveIncomeCloudSnapshot,
} from '@/services/incomeCloud'

const STORAGE_PREFIX = 'sgx_'
const RECORDS_KEY = 'income_records'
const CLOUD_UPDATED_AT_KEY = 'income_cloud_updated_at'
const CLOUD_AUTOSAVE_DELAY = 800

let cloudAutosaveTimer: ReturnType<typeof setTimeout> | null = null

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = uni.getStorageSync(STORAGE_PREFIX + key)
    if (raw) return JSON.parse(raw) as T
  } catch {
    /* ignore */
  }
  return fallback
}

function saveJson(key: string, data: unknown) {
  uni.setStorageSync(STORAGE_PREFIX + key, JSON.stringify(data))
}

function loadRecords(): IncomeRecord[] {
  return sortIncomeRecords(
    loadJson<Partial<IncomeRecord>[]>(RECORDS_KEY, [])
      .map(normalizeIncomeRecord)
      .filter((item): item is IncomeRecord => Boolean(item)),
  )
}

export const useIncomeStore = defineStore('income', {
  state: () => ({
    records: loadRecords(),
    cloudUpdatedAt: loadJson<number>(CLOUD_UPDATED_AT_KEY, 0),
    cloudLoading: false,
    cloudSaving: false,
    cloudPendingSave: false,
    cloudPulling: false,
  }),

  getters: {
    summary: (state) => buildIncomeSummary(state.records, todayStr()),
    recentRecords: (state) => sortIncomeRecords(state.records),
  },

  actions: {
    persistRecords() {
      const updatedAt = Date.now()
      this.records = sortIncomeRecords(this.records)
      this.cloudUpdatedAt = updatedAt
      saveJson(RECORDS_KEY, this.records)
      saveJson(CLOUD_UPDATED_AT_KEY, updatedAt)
      this.scheduleCloudSync()
    },

    addRecord(amount: number, date: string, source: string, remark: string) {
      const record = createIncomeRecord({ amount, date, source, remark })
      this.records.unshift(record)
      this.persistRecords()
      return record
    },

    removeRecord(id: string) {
      this.records = this.records.filter((item) => item.id !== id)
      this.persistRecords()
    },

    applyFromCloud(records: IncomeRecord[], updatedAt: number) {
      this.records = sortIncomeRecords(
        records
          .map(normalizeIncomeRecord)
          .filter((item): item is IncomeRecord => Boolean(item)),
      )
      this.cloudUpdatedAt = updatedAt
      saveJson(RECORDS_KEY, this.records)
      saveJson(CLOUD_UPDATED_AT_KEY, updatedAt)
    },

    async syncFromCloud() {
      if (this.cloudLoading || this.cloudPulling) return
      this.cloudLoading = true
      try {
        const cloud = await fetchIncomeCloudSnapshot()
        if (!cloud) {
          if (this.cloudUpdatedAt > 0) await this.syncToCloud()
          return
        }
        if (cloud.updatedAt > this.cloudUpdatedAt) {
          this.applyFromCloud(cloud.records, cloud.updatedAt)
          return
        }
        if (this.cloudUpdatedAt > cloud.updatedAt) {
          await this.syncToCloud()
        }
      } finally {
        this.cloudLoading = false
      }
    },

    async syncToCloud(): Promise<boolean> {
      if (this.cloudUpdatedAt <= 0) return false
      if (this.cloudSaving) {
        this.cloudPendingSave = true
        return false
      }
      this.cloudSaving = true
      let ok = false
      try {
        ok = await saveIncomeCloudSnapshot(this.records, this.cloudUpdatedAt)
      } finally {
        this.cloudSaving = false
        if (this.cloudPendingSave) {
          this.cloudPendingSave = false
          void this.syncToCloud()
        }
      }
      return ok
    },

    scheduleCloudSync() {
      if (cloudAutosaveTimer) clearTimeout(cloudAutosaveTimer)
      cloudAutosaveTimer = setTimeout(() => {
        cloudAutosaveTimer = null
        void this.syncToCloud()
      }, CLOUD_AUTOSAVE_DELAY)
    },

    async uploadToCloud(): Promise<boolean> {
      if (cloudAutosaveTimer) {
        clearTimeout(cloudAutosaveTimer)
        cloudAutosaveTimer = null
      }
      const updatedAt = Date.now()
      this.cloudUpdatedAt = updatedAt
      saveJson(RECORDS_KEY, this.records)
      saveJson(CLOUD_UPDATED_AT_KEY, updatedAt)
      return this.syncToCloud()
    },

    async pullFromCloud(): Promise<boolean> {
      if (this.cloudPulling) return false
      if (cloudAutosaveTimer) {
        clearTimeout(cloudAutosaveTimer)
        cloudAutosaveTimer = null
      }
      this.cloudPulling = true
      try {
        const cloud = await fetchIncomeCloudSnapshot()
        if (!cloud) return false
        this.applyFromCloud(cloud.records, cloud.updatedAt)
        return true
      } finally {
        this.cloudPulling = false
      }
    },
  },
})
