<template>
  <view class="developing-page" :class="{ 'developing-page--dark': userStore.isDark }">
    <view class="status-placeholder" :style="{ height: layout.navBarHeight + 'px' }" />

    <view class="content">
      <view class="icon-wrap">
        <view class="icon-window">
          <view class="icon-dot icon-dot--red" />
          <view class="icon-dot icon-dot--yellow" />
          <view class="icon-dot icon-dot--green" />
          <view class="icon-line icon-line--top" />
          <view class="icon-line icon-line--bottom" />
        </view>
      </view>
      <text class="eyebrow">{{ currentTabName }}</text>
      <text class="title">{{ TABBAR_DISABLED_MESSAGE }}</text>
    </view>

    <TabBar :current="currentTabIndex" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import TabBar from '@/components/TabBar/index.vue'
import { TABBAR_DISABLED_MESSAGE, type TabKey } from '@/config/tabbar'
import { useUserStore } from '@/store/user'
import { useNavBarLayout } from '@/composables/useNavBarLayout'

const userStore = useUserStore()
const { layout } = useNavBarLayout()

const currentTab = ref<TabKey>('home')

const tabIndexMap: Record<TabKey, number> = {
  home: 0,
  discovery: 1,
  toolbox: 2,
  profile: 3,
}

const tabNameMap: Record<TabKey, string> = {
  home: '首页',
  discovery: '发现',
  toolbox: '工具',
  profile: '我的',
}

const isTabKey = (value: unknown): value is TabKey =>
  value === 'home' || value === 'discovery' || value === 'toolbox' || value === 'profile'

onLoad((query) => {
  const tab = query?.tab
  currentTab.value = isTabKey(tab) ? tab : 'home'
})

const currentTabIndex = computed(() => tabIndexMap[currentTab.value])
const currentTabName = computed(() => tabNameMap[currentTab.value])
</script>

<style lang="scss" scoped>
.developing-page {
  min-height: 100vh;
  box-sizing: border-box;
  background: linear-gradient(180deg, #eef8ff 0%, #f7f8fc 52%, #fff5f8 100%);
  color: #1f2742;
}

.status-placeholder {
  width: 100%;
}

.content {
  min-height: calc(100vh - 260rpx);
  padding: 96rpx 52rpx 180rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.icon-wrap {
  width: 152rpx;
  height: 152rpx;
  border-radius: 40rpx;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18rpx 42rpx rgba(83, 112, 153, 0.13);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-window {
  position: relative;
  width: 92rpx;
  height: 72rpx;
  border-radius: 18rpx;
  background: #eaf4ff;
  border: 4rpx solid #44546f;
  box-shadow: inset 0 18rpx 0 rgba(255, 255, 255, 0.88);
}

.icon-dot {
  position: absolute;
  top: 12rpx;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
}

.icon-dot--red {
  left: 14rpx;
  background: #ff6b95;
}

.icon-dot--yellow {
  left: 30rpx;
  background: #f6c85f;
}

.icon-dot--green {
  left: 46rpx;
  background: #3fcf8e;
}

.icon-line {
  position: absolute;
  left: 18rpx;
  right: 18rpx;
  height: 6rpx;
  border-radius: 999rpx;
  background: #9ab2d4;
}

.icon-line--top {
  top: 42rpx;
}

.icon-line--bottom {
  top: 56rpx;
  right: 34rpx;
}

.eyebrow {
  margin-top: 30rpx;
  font-size: 24rpx;
  line-height: 1.4;
  color: #ed4c9a;
  font-weight: 800;
}

.title {
  margin-top: 12rpx;
  max-width: 560rpx;
  font-size: 36rpx;
  line-height: 1.35;
  font-weight: 800;
  color: #202845;
}

.developing-page--dark {
  background: linear-gradient(180deg, #1a1a2e 0%, #21213a 56%, #2b2238 100%);
  color: #e8e8f0;

  .icon-wrap {
    background: rgba(45, 45, 74, 0.96);
    box-shadow: 0 18rpx 42rpx rgba(0, 0, 0, 0.28);
  }

  .title {
    color: #f3f4ff;
  }

  .eyebrow {
    color: #ff9fc0;
  }

  .icon-window {
    background: #26324f;
    border-color: #c8d5f3;
    box-shadow: inset 0 18rpx 0 rgba(255, 255, 255, 0.12);
  }

  .icon-line {
    background: #8292bd;
  }
}
</style>
