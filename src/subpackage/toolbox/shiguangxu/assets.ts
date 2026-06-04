/** 时光序 Hub 子模块配置 */
export interface SgxModule {
  id: string
  name: string
  desc: string
  emoji: string
  /** 分包 SVG 图标，优先于 emoji */
  icon?: string
  bgColor: string
  path: string
  group: 'time' | 'life'
}

const SGX_ICON = {
  todo: '/subpackage/toolbox/static/imgs/tools_sgx_daibanshixiang.svg',
  stats: '/subpackage/toolbox/static/imgs/tools_sgx_tongji.svg',
  goal: '/subpackage/toolbox/static/imgs/tools_sgx_mubiaoguanli.svg',
  habit: '/subpackage/toolbox/static/imgs/tools_sgx_xiguandaka.svg',
  pomodoro: '/subpackage/toolbox/static/imgs/tools_sgx_zhuanzhu.svg',
} as const

export const SGX_HUB_PATH = '/subpackage/toolbox/shiguangxu/index'

export const sgxModules: SgxModule[] = [
  {
    id: 'todo',
    name: '待办事项',
    desc: '列表·日周月·四象限',
    emoji: '📋',
    icon: SGX_ICON.todo,
    bgColor: '#EDE9FE',
    path: '/subpackage/toolbox/shiguangxu/todo/index',
    group: 'time',
  },
  {
    id: 'stats',
    name: '统计',
    desc: '待办与习惯概览',
    emoji: '📊',
    icon: SGX_ICON.stats,
    bgColor: '#DBEAFE',
    path: '/subpackage/toolbox/shiguangxu/stats/index',
    group: 'time',
  },
  {
    id: 'goal',
    name: '目标管理',
    desc: '拆解步骤追踪进度',
    emoji: '🎯',
    icon: SGX_ICON.goal,
    bgColor: '#FEF9C3',
    path: '/subpackage/toolbox/shiguangxu/goal/index',
    group: 'life',
  },
  {
    id: 'habit',
    name: '习惯打卡',
    desc: '每日坚持养成',
    emoji: '✅',
    icon: SGX_ICON.habit,
    bgColor: '#D1FAE5',
    path: '/subpackage/toolbox/shiguangxu/habit/index',
    group: 'life',
  },
  {
    id: 'pomodoro',
    name: '番茄专注',
    desc: '专注计时远离干扰',
    emoji: '🍅',
    icon: SGX_ICON.pomodoro,
    bgColor: '#FEE2E2',
    path: '/subpackage/toolbox/shiguangxu/pomodoro/index',
    group: 'life',
  },
]

export const sgxTimeModules = sgxModules.filter((m) => m.group === 'time')
export const sgxLifeModules = sgxModules.filter((m) => m.group === 'life')
