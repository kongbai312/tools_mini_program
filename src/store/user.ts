import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark'

export const useUserStore = defineStore('user', {
  state: () => ({
    avatar: '/static/imgs/my_role.png',
    nickname: '星野酱',
    level: 18,
    exp: 2360,
    maxExp: 4500,
    isMember: true,
    memberExpiry: '2025-06-01',
    checkInDays: 15,
    daysToReward: 5,
    rewardPoints: 100,
    theme: 'light' as Theme,
    cacheSize: '128.6MB',
  }),
  getters: {
    expPercent: (state): number =>
      Math.round((state.exp / state.maxExp) * 100),
    isDark: (state): boolean => state.theme === 'dark',
  },
  actions: {
    setTheme(theme: Theme) {
      this.theme = theme
    },
    clearCache() {
      this.cacheSize = '0.0MB'
      uni.showToast({ title: '缓存已清除', icon: 'success' })
    },
  },
})
