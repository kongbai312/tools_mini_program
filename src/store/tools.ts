import { defineStore } from 'pinia'

export interface Tool {
  id: string
  name: string
  icon: string
  bgColor?: string
  url?: string
}

export interface DiscoveryCategory {
  id: number
  name: string
  icon: string
  bgColor: string
}

export interface Article {
  id: number
  title: string
  cover: string
  category: string
  categoryColor: string
  views: string
  timeAgo: string
}

const RECENT_STORAGE_KEY = 'toolbox_recent_tools'

function loadRecentTools(): Tool[] {
  try {
    const raw = uni.getStorageSync(RECENT_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Tool[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    /* ignore */
  }
  return []
}

function saveRecentTools(tools: Tool[]) {
  uni.setStorageSync(RECENT_STORAGE_KEY, JSON.stringify(tools))
}

const categoriesData: DiscoveryCategory[] = [
  { id: 1, name: '动漫', icon: '', bgColor: '#FFE8F0' },
  { id: 2, name: 'AI', icon: '', bgColor: '#E8F0FF' },
  { id: 3, name: '科技', icon: '', bgColor: '#FFF3E0' },
  { id: 4, name: '影视', icon: '', bgColor: '#FFEBEE' },
  { id: 5, name: 'B站', icon: '', bgColor: '#F3E5F5' },
  { id: 6, name: '更多', icon: '', bgColor: '#ECEFF1' },
]

const recommendArticles: Article[] = [
  {
    id: 1,
    title: '《铃芽之旅》新海诚最新作品深度解析：一场关于成长与告别的旅程',
    cover: '',
    category: '动漫资讯',
    categoryColor: '#7B6CF6',
    views: '2.1万',
    timeAgo: '1小时前',
  },
  {
    id: 2,
    title: 'AI 绘图工具大盘点：6 款神级工具让你轻松出图',
    cover: '',
    category: 'AI 绘画',
    categoryColor: '#FF8C42',
    views: '1.8万',
    timeAgo: '2小时前',
  },
  {
    id: 3,
    title: '原神 4.7 版本「纺坠终久之梦」更新内容一览',
    cover: '',
    category: '游戏攻略',
    categoryColor: '#5B7FFF',
    views: '3.5万',
    timeAgo: '3小时前',
  },
  {
    id: 4,
    title: '虚拟偶像的未来：技术与情感的完美结合',
    cover: '',
    category: '虚拟偶像',
    categoryColor: '#9C27B0',
    views: '1.2万',
    timeAgo: '5小时前',
  },
  {
    id: 5,
    title: 'Steam 秋季特卖来了！这 10 款游戏绝对值得入手',
    cover: '',
    category: '科技数码',
    categoryColor: '#2196F3',
    views: '2.7万',
    timeAgo: '6小时前',
  },
  {
    id: 6,
    title: '2024年度最佳国产动画，你看了几部？',
    cover: '',
    category: '动漫资讯',
    categoryColor: '#7B6CF6',
    views: '4.3万',
    timeAgo: '8小时前',
  },
]

const latestArticles: Article[] = [
  {
    id: 7,
    title: 'RTX 5090 显卡正式发布，性能提升高达 40%',
    cover: '',
    category: '科技数码',
    categoryColor: '#2196F3',
    views: '8.9万',
    timeAgo: '30分钟前',
  },
  {
    id: 8,
    title: '【新番情报】2024 年冬季必看动画盘点',
    cover: '',
    category: '动漫资讯',
    categoryColor: '#7B6CF6',
    views: '3.2万',
    timeAgo: '1小时前',
  },
  {
    id: 9,
    title: '初音未来世界巡回演唱会上海场回顾',
    cover: '',
    category: '虚拟偶像',
    categoryColor: '#9C27B0',
    views: '6.7万',
    timeAgo: '2小时前',
  },
]

export const useToolsStore = defineStore('tools', {
  state: () => ({
    recentTools: loadRecentTools(),
    categories: categoriesData,
    recommendArticles,
    latestArticles,
    activeTab: 0,
  }),
  getters: {
    currentArticles: (state): Article[] =>
      state.activeTab === 0 ? state.recommendArticles : state.latestArticles,
  },
  actions: {
    setActiveTab(index: number) {
      this.activeTab = index
    },
    addRecentTool(tool: Tool) {
      const filtered = this.recentTools.filter((item) => item.id !== tool.id)
      this.recentTools = [tool, ...filtered]
      saveRecentTools(this.recentTools)
    },
    removeRecentTool(id: string) {
      this.recentTools = this.recentTools.filter((item) => item.id !== id)
      saveRecentTools(this.recentTools)
    },
    initRecentTools(tools: Tool[]) {
      this.recentTools = [...tools]
      saveRecentTools(this.recentTools)
    },
  },
})
