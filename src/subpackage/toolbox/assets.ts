import type { Tool } from '@/store/tools'
import { SGX_HUB_PATH } from './shiguangxu/assets'

// 工具箱入口配置：新增工具时优先在这里补图标、名称和跳转路径。
export const TOOL_ICONS = {
  wzryZlcx: '/subpackage/toolbox/static/imgs/tools_wzry_zlcx.svg',
  wzryNcjsq: '/subpackage/toolbox/static/imgs/tools_wzry_ncjsq.svg',
  rcSgx: '/subpackage/toolbox/static/imgs/tools_rc_sgx.svg',
  rcScoreboard: '/subpackage/toolbox/static/imgs/tools_rc_scoreboard.svg',
} as const

export const wzryTools: Tool[] = [
  { id: 'wzry_zlcx', name: '战力查询', icon: TOOL_ICONS.wzryZlcx },
  {
    id: 'wzry_ncjsq',
    name: '农场计算器',
    icon: TOOL_ICONS.wzryNcjsq,
    url: '/subpackage/toolbox/wzry-farm/index',
  },
]

export const dailyTools: Tool[] = [
  { id: 'rc_sgx', name: '时光序', icon: TOOL_ICONS.rcSgx, url: SGX_HUB_PATH },
  {
    id: 'rc_scoreboard',
    name: '计分器',
    icon: TOOL_ICONS.rcScoreboard,
    url: '/subpackage/toolbox/scoreboard/index',
  },
]

export const allTools: Tool[] = [...wzryTools, ...dailyTools]

export const defaultRecentTools: Tool[] = [...allTools]
