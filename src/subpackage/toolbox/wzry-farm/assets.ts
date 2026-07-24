/** 农场 Hub 子模块 */
export interface FarmModule {
  id: string
  name: string
  desc: string
  icon: string
  bgColor: string
  path: string
}

export const FARM_HUB_PATH = '/subpackage/toolbox/wzry-farm/index'

export const farmModules: FarmModule[] = [
  {
    id: 'calc',
    name: '成熟计算器',
    desc: '种植时间·浇水节点·收益估算',
    icon: '/static/imgs/wzry-farm-calc.svg',
    bgColor: '#D1FAE5',
    path: '/subpackage/toolbox/wzry-farm/calc/index',
  },
  {
    id: 'wiki',
    name: '数据百科',
    desc: '作物·培育度·小摊·农田·等级·奖励',
    icon: '/static/imgs/wzry-farm-wiki.svg',
    bgColor: '#FEF3C7',
    path: '/subpackage/toolbox/wzry-farm/wiki/index',
  },
]
