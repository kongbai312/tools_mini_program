import { defineStore } from 'pinia'

export interface HotTopic {
  id: number
  rank: number
  title: string
  views: string
  tag?: 'new' | 'hot' | 'boom' | 'video' | ''
}

export interface WeatherInfo {
  city: string
  district: string
  temp: number
  weather: string
  weatherIcon: string
  feel: number
  humidity: number
  wind: string
  aqi: number
  aqiLevel: string
}

const weiboTopics: HotTopic[] = [
  { id: 1, rank: 1, title: '原神新角色英宁娜正式上线', views: '1256万', tag: 'boom' },
  { id: 2, rank: 2, title: 'iPhone 16 系列发布会汇总', views: '987万', tag: 'hot' },
  { id: 3, rank: 3, title: '东京奥运会中国代表团再创佳绩', views: '876万', tag: 'hot' },
  { id: 4, rank: 4, title: '某动画剧场版定档 8 月 10 日', views: '742万', tag: 'new' },
  { id: 5, rank: 5, title: '赵露思新剧路透美照', views: '639万', tag: 'video' },
  { id: 6, rank: 6, title: '英雄联盟全球总决赛赛程公布', views: '552万', tag: '' },
  { id: 7, rank: 7, title: '2024 考研报名人数创新高', views: '496万', tag: '' },
  { id: 8, rank: 8, title: '特斯拉 FSD 入华最新进展', views: '412万', tag: '' },
  { id: 9, rank: 9, title: '猫咪表情包大赛火爆全网', views: '367万', tag: '' },
  { id: 10, rank: 10, title: '电影《间谍过家家代号：白》预告', views: '315万', tag: '' },
]

const zhihuTopics: HotTopic[] = [
  { id: 1, rank: 1, title: '如何看待 AI 逐渐取代部分创意类工作？', views: '312万', tag: 'hot' },
  { id: 2, rank: 2, title: '日本动漫为什么能持续吸引全球观众？', views: '278万', tag: '' },
  { id: 3, rank: 3, title: '原神玩家如何评价 4.7 版本新内容？', views: '231万', tag: '' },
  { id: 4, rank: 4, title: '大学四年最值得做的 10 件事情是什么？', views: '196万', tag: 'hot' },
  { id: 5, rank: 5, title: '中国航天技术目前发展到了什么水平？', views: '154万', tag: '' },
  { id: 6, rank: 6, title: '零基础如何高效学习编程？', views: '138万', tag: '' },
  { id: 7, rank: 7, title: '为什么越来越多的年轻人不想结婚？', views: '122万', tag: '' },
  { id: 8, rank: 8, title: '电动车和燃油车哪个更省钱？如何计算？', views: '97万', tag: '' },
  { id: 9, rank: 9, title: '哪些技能在未来 10 年内最保值？', views: '84万', tag: 'new' },
  { id: 10, rank: 10, title: '如何在高压工作中保持心理健康？', views: '73万', tag: '' },
]

const douyinTopics: HotTopic[] = [
  { id: 1, rank: 1, title: '萌猫大赛年度冠军出炉', views: '1456万', tag: 'boom' },
  { id: 2, rank: 2, title: '手工达人 3 分钟制作超精细高达', views: '1203万', tag: 'hot' },
  { id: 3, rank: 3, title: '外国人第一次尝试中国早餐的反应', views: '987万', tag: '' },
  { id: 4, rank: 4, title: '00后整顿职场系列又来了', views: '843万', tag: 'hot' },
  { id: 5, rank: 5, title: '宇宙感超绝的日落大片拍摄技巧', views: '721万', tag: 'new' },
  { id: 6, rank: 6, title: '网红火锅店探店！排队 3 小时值不值', views: '612万', tag: '' },
  { id: 7, rank: 7, title: '教你用手机拍出电影质感大片', views: '534万', tag: '' },
  { id: 8, rank: 8, title: '健身一年身材变化对比太震撼了', views: '468万', tag: '' },
  { id: 9, rank: 9, title: '农村小院改造成精品民宿全程记录', views: '395万', tag: '' },
  { id: 10, rank: 10, title: '盲盒开箱高光时刻合集', views: '352万', tag: '' },
]

const bilibiliTopics: HotTopic[] = [
  { id: 1, rank: 1, title: '【原神】4.7 全新玩法深度体验测评', views: '892万', tag: 'hot' },
  { id: 2, rank: 2, title: '【鬼灭之刃】无限城篇全剧情回顾', views: '756万', tag: '' },
  { id: 3, rank: 3, title: '【AI绘画】ControlNet 最新使用技巧分享', views: '634万', tag: 'new' },
  { id: 4, rank: 4, title: '【初音未来】世界巡回演唱会全场录像', views: '578万', tag: '' },
  { id: 5, rank: 5, title: '【LOL】S14 全球总决赛半决赛精彩集锦', views: '512万', tag: '' },
  { id: 6, rank: 6, title: '【硬核评测】RTX 5090 显卡深度测评', views: '447万', tag: 'new' },
  { id: 7, rank: 7, title: '【手办制作】从零开始制作 1/4 比例手办', views: '389万', tag: '' },
  { id: 8, rank: 8, title: '【Vtuber】周年纪念特别直播精华合集', views: '334万', tag: '' },
  { id: 9, rank: 9, title: '【MMD】星街彗星最新全场舞蹈翻拍', views: '287万', tag: '' },
  { id: 10, rank: 10, title: '【Steam特卖】秋季促销必买游戏推荐', views: '241万', tag: '' },
]

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    weather: {
      city: '上海市',
      district: '浦东新区',
      temp: 28,
      weather: '晴天',
      weatherIcon: '☀️',
      feel: 30,
      humidity: 60,
      wind: '东南风 2级',
      aqi: 32,
      aqiLevel: '优',
    } as WeatherInfo,
    activeSource: 0,
    sources: ['微博热搜', '知乎榜', '抖音热搜', 'B站热搜'],
    allTopics: [weiboTopics, zhihuTopics, douyinTopics, bilibiliTopics] as HotTopic[][],
  }),
  getters: {
    currentTopics: (state): HotTopic[] => state.allTopics[state.activeSource],
  },
  actions: {
    setSource(index: number) {
      this.activeSource = index
    },
  },
})
