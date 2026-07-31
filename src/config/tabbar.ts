export type TabKey = 'home' | 'discovery' | 'toolbox' | 'profile'

// 自定义 TabBar 的功能开关。未开放的 Tab 会跳到“开发中”页。
export const TABBAR_OPEN_CONFIG: Record<TabKey, boolean> = {
  home: false,
  discovery: false,
  toolbox: true,
  profile: true,
}

export const TABBAR_DISABLED_MESSAGE = '该功能正在开发，后续逐步上线'

// 被关闭的 Tab 统一跳转目标。
export const TABBAR_DEVELOPING_URL = '/pages/developing/index'
