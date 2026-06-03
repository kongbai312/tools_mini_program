import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark'
export type Gender = 'male' | 'female'

const CHECKIN_STORAGE_KEY = 'profile_checkin'
const THEME_STORAGE_KEY = 'profile_theme'
const PROFILE_STORAGE_KEY = 'profile_info'

const DEFAULT_AVATAR = '/static/imgs/my_role.png'
const DEFAULT_NICKNAME = '星野酱'
const NICKNAME_MAX_LEN = 16

interface ProfilePersist {
  avatar: string
  nickname: string
  gender: Gender
}

const THEME_BG = {
  light: '#F5F7FA',
  dark: '#1A1A2E',
} as const

function loadTheme(): Theme {
  try {
    const raw = uni.getStorageSync(THEME_STORAGE_KEY)
    if (raw === 'light' || raw === 'dark') return raw
  } catch {
    /* ignore */
  }
  return 'light'
}

export function applyAppTheme(theme: Theme) {
  const isDark = theme === 'dark'
  const bg = isDark ? THEME_BG.dark : THEME_BG.light
  uni.setBackgroundColor({
    backgroundColor: bg,
    backgroundColorTop: bg,
    backgroundColorBottom: bg,
  })
  uni.setNavigationBarColor({
    frontColor: isDark ? '#ffffff' : '#000000',
    backgroundColor: isDark ? '#1A1A2E' : '#F5F7FA',
  })
}

function getTodayStr(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

interface CheckInPersist {
  lastCheckInDate: string
  checkInDays: number
  daysToReward: number
}

function loadCheckInPersist(): CheckInPersist & { checkedInToday: boolean } {
  const today = getTodayStr()
  const defaults = {
    lastCheckInDate: '',
    checkInDays: 14,
    daysToReward: 5,
    checkedInToday: false,
  }
  try {
    const raw = uni.getStorageSync(CHECKIN_STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as CheckInPersist
    return {
      lastCheckInDate: parsed.lastCheckInDate ?? '',
      checkInDays: parsed.checkInDays ?? 14,
      daysToReward: parsed.daysToReward ?? 5,
      checkedInToday: parsed.lastCheckInDate === today,
    }
  } catch {
    return defaults
  }
}

function saveCheckInPersist(data: CheckInPersist) {
  uni.setStorageSync(CHECKIN_STORAGE_KEY, JSON.stringify(data))
}

function loadProfile(): ProfilePersist {
  const defaults: ProfilePersist = {
    avatar: DEFAULT_AVATAR,
    nickname: DEFAULT_NICKNAME,
    gender: 'female',
  }
  try {
    const raw = uni.getStorageSync(PROFILE_STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<ProfilePersist>
    const nickname = (parsed.nickname ?? '').trim() || defaults.nickname
    return {
      avatar: parsed.avatar || defaults.avatar,
      nickname: nickname.slice(0, NICKNAME_MAX_LEN),
      gender:
        parsed.gender === 'male' || parsed.gender === 'female'
          ? parsed.gender
          : defaults.gender,
    }
  } catch {
    return defaults
  }
}

function saveProfile(data: ProfilePersist) {
  uni.setStorageSync(PROFILE_STORAGE_KEY, JSON.stringify(data))
}

function formatCacheSize(kb: number): string {
  if (!Number.isFinite(kb) || kb <= 0) return '0.0MB'
  if (kb < 1024) return `${kb.toFixed(1)}KB`
  return `${(kb / 1024).toFixed(1)}MB`
}

export const useUserStore = defineStore('user', {
  state: () => {
    const checkIn = loadCheckInPersist()
    const profile = loadProfile()
    return {
      avatar: profile.avatar,
      nickname: profile.nickname,
      gender: profile.gender,
      level: 18,
      exp: 2360,
      maxExp: 4500,
      isMember: true,
      memberExpiry: '2025-06-01',
      checkInDays: checkIn.checkInDays,
      daysToReward: checkIn.daysToReward,
      rewardPoints: 100,
      checkedInToday: checkIn.checkedInToday,
      lastCheckInDate: checkIn.lastCheckInDate,
      theme: loadTheme() as Theme,
      cacheSize: '0.0MB',
    }
  },
  getters: {
    expPercent: (state): number =>
      Math.round((state.exp / state.maxExp) * 100),
    isDark: (state): boolean => state.theme === 'dark',
  },
  actions: {
    setTheme(theme: Theme) {
      if (this.theme === theme) return
      this.theme = theme
      uni.setStorageSync(THEME_STORAGE_KEY, theme)
      applyAppTheme(theme)
    },
    initTheme() {
      const theme = loadTheme()
      this.theme = theme
      applyAppTheme(theme)
      this.refreshCacheSize()
    },
    refreshCacheSize() {
      try {
        const info = uni.getStorageInfoSync()
        this.cacheSize = formatCacheSize(info.currentSize ?? 0)
      } catch {
        this.cacheSize = '0.0MB'
      }
    },
    persistProfile() {
      saveProfile({
        avatar: this.avatar,
        nickname: this.nickname,
        gender: this.gender,
      })
    },
    setAvatar(path: string) {
      if (!path) return
      this.avatar = path
      this.persistProfile()
      uni.showToast({ title: '头像已更新', icon: 'success' })
    },
    setNickname(name: string): boolean {
      const trimmed = name.trim()
      if (!trimmed) {
        uni.showToast({ title: '昵称不能为空', icon: 'none' })
        return false
      }
      if (trimmed.length > NICKNAME_MAX_LEN) {
        uni.showToast({ title: `昵称最多${NICKNAME_MAX_LEN}字`, icon: 'none' })
        return false
      }
      this.nickname = trimmed
      this.persistProfile()
      uni.showToast({ title: '昵称已保存', icon: 'success' })
      return true
    },
    setGender(gender: Gender) {
      if (this.gender === gender) return
      this.gender = gender
      this.persistProfile()
    },
    clearCache() {
      try {
        const keepTheme = this.theme
        const keepProfile: ProfilePersist = {
          avatar: this.avatar,
          nickname: this.nickname,
          gender: this.gender,
        }
        uni.clearStorageSync()
        uni.setStorageSync(THEME_STORAGE_KEY, keepTheme)
        saveProfile(keepProfile)
        applyAppTheme(keepTheme)
        this.refreshCacheSize()
        uni.showToast({ title: '缓存已清除', icon: 'success' })
      } catch {
        uni.showToast({ title: '清除失败，请重试', icon: 'none' })
      }
    },
    checkIn(): boolean {
      if (this.checkedInToday) return false
      const today = getTodayStr()
      this.checkInDays += 1
      this.daysToReward -= 1
      if (this.daysToReward <= 0) {
        this.daysToReward = 5
      }
      this.checkedInToday = true
      this.lastCheckInDate = today
      saveCheckInPersist({
        lastCheckInDate: today,
        checkInDays: this.checkInDays,
        daysToReward: this.daysToReward,
      })
      return true
    },
  },
})
