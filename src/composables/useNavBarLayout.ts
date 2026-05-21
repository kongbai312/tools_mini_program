import { onMounted, ref } from 'vue'

export interface NavBarLayout {
  /** 状态栏高度 px */
  statusBarHeight: number
  /** 顶部安全区总高度（状态栏 + 胶囊行）px */
  navBarHeight: number
  /** 胶囊行高度 px */
  navContentHeight: number
  /** 自屏幕左缘至胶囊左缘的宽度 px */
  capsuleRightGap: number
}

const DEFAULT: NavBarLayout = {
  statusBarHeight: 20,
  navBarHeight: 64,
  navContentHeight: 44,
  capsuleRightGap: 96,
}

/** 自定义导航栏页面：获取状态栏与胶囊按钮占位信息 */
export function useNavBarLayout() {
  const layout = ref<NavBarLayout>({ ...DEFAULT })

  onMounted(() => {
    try {
      const sys = uni.getSystemInfoSync()
      const menu = uni.getMenuButtonBoundingClientRect()
      const statusBarHeight = sys.statusBarHeight || 20
      const navContentHeight = (menu.top - statusBarHeight) * 2 + menu.height
      const navBarHeight = statusBarHeight + navContentHeight
      const capsuleRightGap = sys.screenWidth - menu.left

      layout.value = {
        statusBarHeight,
        navBarHeight,
        navContentHeight,
        capsuleRightGap,
      }
    } catch {
      layout.value = { ...DEFAULT }
    }
  })

  /** 在已有 page 水平 padding 的容器内，右侧应额外留出的 px */
  const safeRightGap = (pagePaddingRpx = 0) =>
    Math.max(8, layout.value.capsuleRightGap - uni.upx2px(pagePaddingRpx))

  return { layout, safeRightGap }
}
