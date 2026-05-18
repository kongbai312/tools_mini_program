import { defineStore } from 'pinia'

export interface Tool {
  id: number
  name: string
  icon: string
  bgColor: string
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

const recentToolsData: Tool[] = [
  { id: 1, name: '原神地图', icon: '🗺️', bgColor: '#4F86C6' },
  { id: 2, name: '汇率换算', icon: '💱', bgColor: '#52C41A' },
  { id: 3, name: 'B站封面', icon: '📺', bgColor: '#FB7299' },
  { id: 4, name: '壁纸大全', icon: '🖼️', bgColor: '#9B59B6' },
  { id: 5, name: '快递查询', icon: '📦', bgColor: '#FF8C00' },
]

const gameToolsData: Tool[] = [
  { id: 1, name: '原神地图', icon: '🗺️', bgColor: '#4F86C6' },
  { id: 2, name: '游戏战绩', icon: '🎮', bgColor: '#E74C3C' },
  { id: 3, name: 'LOL战绩', icon: '⚔️', bgColor: '#C0392B' },
  { id: 4, name: 'Steam折扣', icon: '🎁', bgColor: '#1B2838' },
  { id: 5, name: '抽卡模拟', icon: '🃏', bgColor: '#8E44AD' },
  { id: 6, name: '游戏攻略', icon: '📖', bgColor: '#2ECC71' },
]

const dailyToolsData: Tool[] = [
  { id: 1, name: '汇率换算', icon: '💱', bgColor: '#27AE60' },
  { id: 2, name: '单位换算', icon: '📐', bgColor: '#2980B9' },
  { id: 3, name: '天气预报', icon: '⛅', bgColor: '#3498DB' },
  { id: 4, name: '快速查询', icon: '🔍', bgColor: '#E67E22' },
  { id: 5, name: '记账本', icon: '💰', bgColor: '#F39C12' },
  { id: 6, name: '日历工具', icon: '📅', bgColor: '#E91E63' },
]

const categoriesData: DiscoveryCategory[] = [
  { id: 1, name: '动漫', icon: '🎌', bgColor: '#FF6B9D' },
  { id: 2, name: '游戏', icon: '🎮', bgColor: '#5B7FFF' },
  { id: 3, name: 'AI绘画', icon: '🎨', bgColor: '#FF8C42' },
  { id: 4, name: '影视娱乐', icon: '🎬', bgColor: '#E74C3C' },
  { id: 5, name: '科技数码', icon: '💻', bgColor: '#2196F3' },
  { id: 6, name: '虚拟偶像', icon: '⭐', bgColor: '#9C27B0' },
  { id: 7, name: '更多', icon: '➕', bgColor: '#78909C' },
]

const recommendArticles: Article[] = [
  {
    id: 1,
    title: '《铃芽之旅》新海诚最新作品深度解析：一场关于成长与告别的旅程',
    cover: 'https://picsum.photos/id/237/200/150',
    category: '动漫视听',
    categoryColor: '#FF6B9D',
    views: '2.1万',
    timeAgo: '1小时前',
  },
  {
    id: 2,
    title: 'AI 绘图工具大盘点：6 款神级工具让你轻松出图',
    cover: 'https://picsum.photos/id/26/200/150',
    category: 'AI 绘画',
    categoryColor: '#FF8C42',
    views: '1.8万',
    timeAgo: '2小时前',
  },
  {
    id: 3,
    title: '原神 4.7 版本「纺坠终久之梦」更新内容一览',
    cover: 'https://picsum.photos/id/42/200/150',
    category: '游戏攻略',
    categoryColor: '#5B7FFF',
    views: '3.5万',
    timeAgo: '3小时前',
  },
  {
    id: 4,
    title: '虚拟偶像的未来：技术与情感的完美结合',
    cover: 'https://picsum.photos/id/64/200/150',
    category: '虚拟偶像',
    categoryColor: '#9C27B0',
    views: '1.2万',
    timeAgo: '5小时前',
  },
  {
    id: 5,
    title: 'Steam 秋季特卖来了！这 10 款游戏绝对值得入手',
    cover: 'https://picsum.photos/id/91/200/150',
    category: '科技数码',
    categoryColor: '#2196F3',
    views: '2.7万',
    timeAgo: '6小时前',
  },
  {
    id: 6,
    title: '2024年度最佳国产动画，你看了几部？',
    cover: 'https://picsum.photos/id/13/200/150',
    category: '动漫视听',
    categoryColor: '#FF6B9D',
    views: '4.3万',
    timeAgo: '8小时前',
  },
]

const latestArticles: Article[] = [
  {
    id: 7,
    title: 'RTX 5090 显卡正式发布，性能提升高达 40%',
    cover: 'https://picsum.photos/id/60/200/150',
    category: '科技数码',
    categoryColor: '#2196F3',
    views: '8.9万',
    timeAgo: '30分钟前',
  },
  {
    id: 8,
    title: '【新番情报】2024 年冬季必看动画盘点',
    cover: 'https://picsum.photos/id/15/200/150',
    category: '动漫视听',
    categoryColor: '#FF6B9D',
    views: '3.2万',
    timeAgo: '1小时前',
  },
  {
    id: 9,
    title: '初音未来世界巡回演唱会上海场回顾',
    cover: 'https://picsum.photos/id/29/200/150',
    category: '虚拟偶像',
    categoryColor: '#9C27B0',
    views: '6.7万',
    timeAgo: '2小时前',
  },
]

export const useToolsStore = defineStore('tools', {
  state: () => ({
    recentTools: recentToolsData,
    gameTools: gameToolsData,
    dailyTools: dailyToolsData,
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
  },
})
