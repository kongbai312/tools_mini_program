/** 时光序 Hub 子模块配置 */
export interface SgxModule {
  id: string
  name: string
  desc: string
  emoji: string
  bgColor: string
  path: string
  group: 'time' | 'life'
}

export const SGX_HUB_PATH = '/subpackage/toolbox/shiguangxu/index'

export const sgxModules: SgxModule[] = [
  {
    id: 'todo',
    name: '待办事项',
    desc: '列表·日周月·四象限',
    emoji: '📋',
    bgColor: '#E8F0FF',
    path: '/subpackage/toolbox/shiguangxu/todo/index',
    group: 'time',
  },
  {
    id: 'stats',
    name: '时间统计',
    desc: '事项与消费分布',
    emoji: '📊',
    bgColor: '#E0F2FE',
    path: '/subpackage/toolbox/shiguangxu/stats/index',
    group: 'time',
  },
  {
    id: 'goal',
    name: '目标管理',
    desc: '拆解步骤追踪进度',
    emoji: '🎯',
    bgColor: '#FEF3C7',
    path: '/subpackage/toolbox/shiguangxu/goal/index',
    group: 'life',
  },
  {
    id: 'bill',
    name: '记账',
    desc: '收支记录与汇总',
    emoji: '💰',
    bgColor: '#D1FAE5',
    path: '/subpackage/toolbox/shiguangxu/bill/index',
    group: 'life',
  },
  {
    id: 'diary',
    name: '日记',
    desc: '记录生活点滴',
    emoji: '📔',
    bgColor: '#FFEDD5',
    path: '/subpackage/toolbox/shiguangxu/diary/index',
    group: 'life',
  },
  {
    id: 'countdown',
    name: '倒数纪念日',
    desc: '重要日子倒计时',
    emoji: '🎂',
    bgColor: '#FFE8F0',
    path: '/subpackage/toolbox/shiguangxu/countdown/index',
    group: 'life',
  },
  {
    id: 'habit',
    name: '习惯打卡',
    desc: '每日坚持养成',
    emoji: '✅',
    bgColor: '#E8FFF3',
    path: '/subpackage/toolbox/shiguangxu/habit/index',
    group: 'life',
  },
  {
    id: 'pomodoro',
    name: '番茄专注',
    desc: '专注计时远离干扰',
    emoji: '🍅',
    bgColor: '#FFF3E0',
    path: '/subpackage/toolbox/shiguangxu/pomodoro/index',
    group: 'life',
  },
  {
    id: 'memo',
    name: '备忘录',
    desc: '随时记录灵感',
    emoji: '📝',
    bgColor: '#F3E5F5',
    path: '/subpackage/toolbox/shiguangxu/memo/index',
    group: 'life',
  },
]

export const sgxTimeModules = sgxModules.filter((m) => m.group === 'time')
export const sgxLifeModules = sgxModules.filter((m) => m.group === 'life')
