import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark'
export type Gender = 'male' | 'female'

// 用户中心的本地持久化 key，集中维护便于迁移和排查。
const CHECKIN_STORAGE_KEY = 'profile_checkin'
const THEME_STORAGE_KEY = 'profile_theme'
const PROFILE_STORAGE_KEY = 'profile_info'

const LEGACY_DEFAULT_AVATAR = '/static/imgs/my_role.png'
const LEGACY_GUEST_AVATAR = '/subpackage/profile/static/imgs/profile-guest-avatar.svg.svg'
const LEGACY_DEFAULT_NICKNAME = '星野酱'

export const DEFAULT_AVATAR = '/subpackage/profile/static/imgs/profile-guest-avatar.png'
export const DEFAULT_NICKNAME = '未设置'
const NICKNAME_MAX_LEN = 16
export const WECHAT_DEFAULT_NICKNAME = '微信用户'

interface ProfilePersist {
  avatar: string
  nickname: string
  gender: Gender
  isLoggedIn: boolean
}

const THEME_BG = {
  light: '#F5F7FA',
  dark: '#1A1A2E',
} as const

// 读取当前主题，初始化时优先恢复用户上次选择。
function loadTheme(): Theme {
  try {
    const raw = uni.getStorageSync(THEME_STORAGE_KEY)
    if (raw === 'light' || raw === 'dark') return raw
  } catch {
    /* ignore */
  }
  return 'light'
}

// 真机和 H5 的主题切换，都通过这里同步到系统壳层。
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

// 签到按自然日计算，所以用本地日期字符串做去重标识。
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

// 个人资料只保存 avatar / nickname / gender / isLoggedIn 四项。
function loadProfile(): ProfilePersist {
  const defaults: ProfilePersist = {
    avatar: DEFAULT_AVATAR,
    nickname: DEFAULT_NICKNAME,
    gender: 'female',
    isLoggedIn: false,
  }
  try {
    const raw = uni.getStorageSync(PROFILE_STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<ProfilePersist>
    const parsedAvatar = parsed.avatar || defaults.avatar
    const avatar =
      parsedAvatar === LEGACY_DEFAULT_AVATAR || parsedAvatar === LEGACY_GUEST_AVATAR
        ? defaults.avatar
        : parsedAvatar
    const parsedNickname = (parsed.nickname ?? '').trim()
    const nickname =
      parsedNickname && parsedNickname !== LEGACY_DEFAULT_NICKNAME
        ? parsedNickname
        : defaults.nickname
    return {
      avatar,
      nickname: nickname.slice(0, NICKNAME_MAX_LEN),
      gender:
        parsed.gender === 'male' || parsed.gender === 'female'
          ? parsed.gender
          : defaults.gender,
      isLoggedIn: parsed.isLoggedIn === true,
    }
  } catch {
    return defaults
  }
}

// 把个人资料写回本地缓存，避免页面各自散写 storage 逻辑。
function saveProfile(data: ProfilePersist) {
  uni.setStorageSync(PROFILE_STORAGE_KEY, JSON.stringify(data))
}

// 微信默认昵称不算“用户真正设置过的昵称”。
export function isWechatDefaultNickname(name: string): boolean {
  return name.trim() === WECHAT_DEFAULT_NICKNAME
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
      // 下面这些字段是个人中心和签到页直接展示的数据。
      avatar: profile.avatar,
      nickname: profile.nickname,
      gender: profile.gender,
      isLoggedIn: profile.isLoggedIn,
      level: 18,
      exp: 2360,
      maxExp: 4500,
      isMember: true,
      memberExpiry: '2030-06-01',
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
        isLoggedIn: this.isLoggedIn,
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
      if (isWechatDefaultNickname(trimmed)) {
        uni.showToast({ title: '请填写真实昵称', icon: 'none' })
        return false
      }
      if (trimmed === DEFAULT_NICKNAME) {
        uni.showToast({ title: '请填写昵称', icon: 'none' })
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
    completeWechatProfile(profile: { avatar: string; nickname: string; gender?: Gender }): boolean {
      const nickname = profile.nickname.trim()
      if (!profile.avatar || !nickname || nickname === DEFAULT_NICKNAME || isWechatDefaultNickname(nickname)) return false
      this.avatar = profile.avatar
      this.nickname = nickname.slice(0, NICKNAME_MAX_LEN)
      if (profile.gender === 'male' || profile.gender === 'female') {
        this.gender = profile.gender
      }
      this.isLoggedIn = true
      this.persistProfile()
      return true
    },
    syncWechatProfile(profile: { avatar: string; nickname: string; gender?: Gender }) {
      this.avatar = profile.avatar || this.avatar
      this.nickname = profile.nickname.trim().slice(0, NICKNAME_MAX_LEN) || this.nickname
      if (profile.gender === 'male' || profile.gender === 'female') {
        this.gender = profile.gender
      }
      this.isLoggedIn = true
      this.persistProfile()
    },
    logoutWechatProfile() {
      this.avatar = DEFAULT_AVATAR
      this.nickname = DEFAULT_NICKNAME
      this.gender = 'female'
      this.isLoggedIn = false
      this.persistProfile()
    },
    clearCache() {
      try {
        const keepTheme = this.theme
        const keepProfile: ProfilePersist = {
          avatar: this.avatar,
          nickname: this.nickname,
          gender: this.gender,
          isLoggedIn: this.isLoggedIn,
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
