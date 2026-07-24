export type TabKey = 'home' | 'discovery' | 'toolbox' | 'profile'

export const TABBAR_OPEN_CONFIG: Record<TabKey, boolean> = {
  home: false,
  discovery: false,
  toolbox: true,
  profile: true,
}

export const TABBAR_DISABLED_MESSAGE = '该功能正在开发，后续逐步上线'

export const TABBAR_DEVELOPING_URL = '/pages/developing/index'
