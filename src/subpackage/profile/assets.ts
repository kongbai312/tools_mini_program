export const PROFILE_ICONS = {
  member: '/subpackage/profile/static/imgs/huangjinhuiyuan.svg',
  checkin: '/subpackage/profile/static/imgs/qiandao.svg',
  boy: '/subpackage/profile/static/imgs/boy.svg',
  girl: '/subpackage/profile/static/imgs/gril.svg',
  theme: '/subpackage/profile/static/imgs/zhuti.svg',
  day: '/subpackage/profile/static/imgs/eventing.svg',
  night: '/subpackage/profile/static/imgs/night.svg',
  feedback: '/subpackage/profile/static/imgs/fankui.svg',
  clearCache: '/subpackage/profile/static/imgs/qingchuhuancun.svg',
  setting: '/subpackage/profile/static/imgs/shezhi.svg',
  about: '/subpackage/profile/static/imgs/guanyu.svg',
  cloud: '/subpackage/profile/static/imgs/my-cloud.svg',
  none: '/subpackage/profile/static/imgs/zanwu.svg',
} as const

/** 每 10 级一档：1-10、11-20 … */
export const LEVEL_TIER_COLORS = [
  '#36B37E',
  '#9F7AEA',
  '#4F86C6',
  '#FA8C16',
  '#EB5A8C',
  '#F5A623',
  '#E74C3C',
  '#13C2C2',
  '#597EF7',
  '#722ED1',
] as const

export function getLevelTierColor(level: number): string {
  const tier = Math.min(Math.floor((Math.max(level, 1) - 1) / 10), LEVEL_TIER_COLORS.length - 1)
  return LEVEL_TIER_COLORS[tier]
}
