import { defineStore } from 'pinia'

// 工具页和发现页共用的静态数据，以及最近使用工具的本地缓存。
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

export interface ArticleDetail extends Article {
  author: string
  publishTime: string
  paragraphs: string[]
  tags: string[]
}

export const categoryTopicMap: Record<string, string[]> = {
  动漫: ['动漫资讯'],
  AI: ['AI 绘画'],
  科技: ['科技数码', '游戏攻略'],
  影视: ['虚拟偶像'],
  B站: ['虚拟偶像', '动漫资讯'],
}

export const hotSearchKeywords = ['铃芽之旅', 'AI 绘图', '原神 4.7', 'RTX 5090', '初音未来']

const RECENT_STORAGE_KEY = 'toolbox_recent_tools'

// 从本地恢复最近使用工具；解析失败时直接回退为空列表。
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

// 保存最近使用工具的顺序，最新使用的工具会排在最前。
function saveRecentTools(tools: Tool[]) {
  uni.setStorageSync(RECENT_STORAGE_KEY, JSON.stringify(tools))
}

// 发现页分类筛选：部分分类通过映射关键词匹配多个文章分类。
function matchesCategoryFilter(article: Article, topicName: string | null): boolean {
  if (!topicName) return true
  const keywords = categoryTopicMap[topicName]
  if (!keywords) return article.category.includes(topicName)
  return keywords.some((kw) => article.category.includes(kw))
}

// 发现页搜索：标题、分类、详情标签一起参与模糊匹配。
function matchesKeyword(article: Article, detail: ArticleDetail | undefined, keyword: string): boolean {
  const q = keyword.trim().toLowerCase()
  if (!q) return true
  const haystack = [article.title, article.category, ...(detail?.tags ?? [])]
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
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

const articleDetailsData: Record<number, ArticleDetail> = {
  1: {
    ...recommendArticles[0],
    author: '动漫观察员',
    publishTime: '2024-05-28 14:00',
    tags: ['新海诚', '铃芽之旅', '动画电影'],
    paragraphs: [
      '《铃芽之旅》延续了新海诚一贯的视觉美学，将灾难与成长两条叙事线编织在一起。影片以「门」与「废墟」作为核心意象，隐喻灾后重建与自我和解。',
      '女主角铃芽的旅程不仅是地理上的移动，更是从逃避到面对的心理蜕变。与新海诚前作相比，本作在动作场面与奇幻设定上更为大胆。',
      '配乐与画面依旧高度协同，关键情绪段落配合久石让式旋律推进，适合在影院环境中完整体验。',
    ],
  },
  2: {
    ...recommendArticles[1],
    author: 'AI 工具站',
    publishTime: '2024-05-28 12:30',
    tags: ['AI', 'Stable Diffusion', 'Midjourney'],
    paragraphs: [
      'AI 绘图工具在 2024 年继续快速迭代，从文生图到局部重绘、ControlNet 控制都已进入「开箱即用」阶段。',
      '本文对比了 6 款主流工具在易用性、风格多样性、中文提示词支持及商用授权方面的差异。',
      '对于入门用户，建议先掌握提示词结构与负面词模板，再按需求选择订阅或本地部署方案。',
    ],
  },
  3: {
    ...recommendArticles[2],
    author: '提瓦特攻略组',
    publishTime: '2024-05-28 11:00',
    tags: ['原神', '4.7', '版本更新'],
    paragraphs: [
      '4.7 版本「纺坠终久之梦」带来了新区域剧情与多位五星角色复刻，活动排期较为紧凑。',
      '深渊与环境机制有所调整，部分旧阵容需要重新配队与圣遗物优化。',
      '限时活动奖励包含大量原石与养成材料，建议优先完成主线与大型活动任务。',
    ],
  },
  4: {
    ...recommendArticles[3],
    author: '虚拟文化志',
    publishTime: '2024-05-28 09:00',
    tags: ['虚拟偶像', 'VTuber', '全息'],
    paragraphs: [
      '虚拟偶像产业正从直播打赏向 IP 联动、线下演唱会与品牌代言延伸，技术门槛持续降低。',
      '实时动捕与 AI 语音合成提升了内容产能，但也对中之人隐私与版权归属提出新挑战。',
      '未来竞争焦点将落在世界观运营与跨平台粉丝沉淀能力上。',
    ],
  },
  5: {
    ...recommendArticles[4],
    author: '游戏特惠君',
    publishTime: '2024-05-28 08:00',
    tags: ['Steam', '秋促', '独立游戏'],
    paragraphs: [
      'Steam 秋季特卖覆盖数千款作品，部分年度大作迎来史低价格。',
      '本文精选 10 款口碑与性价比兼具的游戏，涵盖独立、叙事与合作类型。',
      '购买前建议核对区域定价与退款政策，搭配愿望单可不错过降价提醒。',
    ],
  },
  6: {
    ...recommendArticles[5],
    author: '国漫情报局',
    publishTime: '2024-05-28 06:00',
    tags: ['国产动画', '2024', '盘点'],
    paragraphs: [
      '2024 年国产动画在题材与制作精度上均有突破，院线与流媒体双线发力。',
      '从科幻到传统文化改编，各赛道均出现话题作品，观众讨论度显著提升。',
      '你今年追了几部？欢迎在评论区分享你的年度片单。',
    ],
  },
  7: {
    ...latestArticles[0],
    author: '硬件前沿',
    publishTime: '2024-05-29 15:30',
    tags: ['NVIDIA', 'RTX 5090', '显卡'],
    paragraphs: [
      'NVIDIA 正式发布 RTX 5090，官方宣称相较上代旗舰性能提升约 40%，并强化 AI 算力单元。',
      '新架构在光追与 DLSS 4 协同下，4K 高帧率游戏更具可行性，创作类工作流同样受益。',
      '首发价格与供货情况将影响市场走势，建议关注非公版散热设计与功耗表现评测。',
    ],
  },
  8: {
    ...latestArticles[1],
    author: '番剧日历',
    publishTime: '2024-05-29 14:00',
    tags: ['新番', '冬季', '2024'],
    paragraphs: [
      '2024 年冬季新番档阵容丰富，续作与原创 IP 并存，流媒体同步率进一步提高。',
      '本文按类型梳理必看清单，涵盖恋爱、奇幻、日常与悬疑等赛道代表作。',
      '追番前可结合 MyAnimeList 等评分与用户口碑做二次筛选。',
    ],
  },
  9: {
    ...latestArticles[2],
    author: 'Miku 应援会',
    publishTime: '2024-05-29 13:00',
    tags: ['初音未来', '演唱会', '上海'],
    paragraphs: [
      '初音未来世界巡回演唱会上海场圆满落幕，全息舞台与乐队现场融合呈现震撼视听效果。',
      '歌单涵盖经典曲目与近年新作，全场大合唱环节成为最高潮时刻。',
      '周边售罄速度创近年新高，粉丝二创内容在社交平台持续发酵。',
    ],
  },
}

export const useToolsStore = defineStore('tools', {
  state: () => ({
    // 本机最近使用工具，不依赖云端。
    recentTools: loadRecentTools(),
    // 分类与文章仍是本地 mock 数据，页面只读取和筛选。
    categories: categoriesData,
    recommendArticles,
    latestArticles,
    articleDetails: articleDetailsData,
    activeTab: 0,
    categoryFilter: null as string | null,
  }),
  getters: {
    allArticles(state): Article[] {
      const map = new Map<number, Article>()
      for (const a of [...state.recommendArticles, ...state.latestArticles]) {
        map.set(a.id, a)
      }
      return Array.from(map.values())
    },
    filteredArticles(): Article[] {
      return this.allArticles.filter((a) =>
        matchesCategoryFilter(a, this.categoryFilter),
      )
    },
    filteredRecommendArticles(): Article[] {
      return this.recommendArticles.filter((a) =>
        matchesCategoryFilter(a, this.categoryFilter),
      )
    },
    filteredLatestArticles(): Article[] {
      return this.latestArticles.filter((a) =>
        matchesCategoryFilter(a, this.categoryFilter),
      )
    },
    currentArticles(): Article[] {
      if (this.activeTab === 2) return []
      if (this.activeTab === 0) return this.filteredRecommendArticles
      return this.filteredLatestArticles
    },
  },
  actions: {
    setActiveTab(index: number) {
      this.activeTab = index
    },
    setCategoryFilter(name: string | null) {
      this.categoryFilter = name
    },
    getArticleById(id: number): ArticleDetail | null {
      const detail = this.articleDetails[id]
      if (detail) return detail
      const base = this.allArticles.find((a) => a.id === id)
      if (!base) return null
      return {
        ...base,
        author: '工具箱编辑部',
        publishTime: base.timeAgo,
        paragraphs: [base.title],
        tags: [base.category],
      }
    },
    getRelatedArticles(id: number, limit = 2): Article[] {
      const current = this.getArticleById(id)
      if (!current) return []
      return this.allArticles
        .filter((a) => a.id !== id && a.category === current.category)
        .slice(0, limit)
    },
    searchArticles(keyword: string): Article[] {
      const q = keyword.trim()
      if (!q) return []
      return this.allArticles.filter((a) => {
        const detail = this.articleDetails[a.id]
        return matchesKeyword(a, detail, q)
      })
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
