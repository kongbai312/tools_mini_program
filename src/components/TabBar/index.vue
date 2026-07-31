<template>
  <view class="tabbar-placeholder" />
  <view class="custom-tabbar" :class="{ 'custom-tabbar--dark': userStore.isDark }">
    <view
      v-for="(item, index) in tabList"
      :key="item.text"
      class="tabbar-item"
      :class="{ 'tabbar-item--active': current === index, 'tabbar-item--disabled': !item.open }"
      @tap="onTabChange(index)"
    >
      <image
        class="tabbar-icon-img"
        :src="current === index ? item.activeIcon : item.icon"
        mode="aspectFit"
      />
      <text class="tabbar-text">{{ item.text }}</text>
    </view>
    <view class="safe-bottom" />
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { TABBAR_DEVELOPING_URL, TABBAR_OPEN_CONFIG, type TabKey } from '@/config/tabbar'

const props = defineProps<{ current: number }>()
const userStore = useUserStore()

// 自定义 TabBar 数据源。open 由配置控制，未开放时跳转开发中页面。
const tabList: { key: TabKey; icon: string; activeIcon: string; text: string; open: boolean }[] = [
  {
    key: 'home',
    icon: '/static/tabs/home-inactive.svg',
    activeIcon: '/static/tabs/home-active.svg',
    text: '首页',
    open: TABBAR_OPEN_CONFIG.home,
  },
  {
    key: 'discovery',
    icon: '/static/tabs/discover-inactive.svg',
    activeIcon: '/static/tabs/discover-active.svg',
    text: '发现',
    open: TABBAR_OPEN_CONFIG.discovery,
  },
  {
    key: 'toolbox',
    icon: '/static/tabs/tools-inactive.svg',
    activeIcon: '/static/tabs/tools-active.svg',
    text: '工具',
    open: TABBAR_OPEN_CONFIG.toolbox,
  },
  {
    key: 'profile',
    icon: '/static/tabs/my-inactive.svg',
    activeIcon: '/static/tabs/my-active.svg',
    text: '我的',
    open: TABBAR_OPEN_CONFIG.profile,
  },
]

const pageUrls = [
  '/subpackage/home/index',
  '/subpackage/discovery/index',
  '/subpackage/toolbox/index',
  '/subpackage/profile/index',
]

// Tab 页之间使用 reLaunch，避免分包 Tab 页互相堆叠页面栈。
const onTabChange = (index: number) => {
  if (index === props.current) return
  const target = tabList[index]
  if (!target.open) {
    uni.reLaunch({ url: `${TABBAR_DEVELOPING_URL}?tab=${target.key}` })
    return
  }
  uni.reLaunch({ url: pageUrls[index] })
}
</script>

<style lang="scss" scoped>
.tabbar-placeholder {
  height: calc(144rpx + env(safe-area-inset-bottom));
}

.custom-tabbar {
  position: fixed;
  left: 18rpx;
  right: 18rpx;
  bottom: calc(16rpx + env(safe-area-inset-bottom));
  z-index: 999;
  display: flex;
  align-items: center;
  height: 112rpx;
  padding: 0 18rpx;
  background: rgba(255, 255, 255, 0.98);
  border: 2rpx solid rgba(221, 233, 245, 0.92);
  border-radius: 32rpx;
  box-shadow: 0 10rpx 34rpx rgba(42, 82, 126, 0.12);
}

.custom-tabbar--dark {
  background: rgba(37, 37, 66, 0.98);
  border-color: rgba(60, 60, 90, 0.92);
  box-shadow: 0 10rpx 34rpx rgba(0, 0, 0, 0.28);
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: #7B8093;
}

.tabbar-item--active {
  color: #ED4C9A;
}

.tabbar-item--disabled {
  opacity: 0.56;
}

.tabbar-icon-img {
  width: 42rpx;
  height: 42rpx;
}

.tabbar-text {
  font-size: 24rpx;
  line-height: 1;
  color: inherit;
  font-weight: 600;
}
</style>
