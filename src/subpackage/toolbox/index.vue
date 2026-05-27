<template>
  <view class="toolbox-page" :style="{ '--nav-h': layout.navBarHeight + 'px' }">
    <image class="page-bg" :src="toolsBg" mode="widthFix" />

    <view class="banner">
      <view class="status-placeholder" :style="{ height: layout.navBarHeight + 'px' }" />

      <view class="banner-content" :style="{ paddingRight: safeRightGap(32) + 'px' }">
        <view class="banner-text">
          <text class="banner-title">工具箱</text>
          <text class="banner-subtitle">超多实用工具，生活更便捷~</text>
        </view>
      </view>
    </view>

    <view class="content-area">
      <!-- Recently used -->
      <view class="section-block">
        <view class="section-header">
          <text class="section-title">最近使用</text>
          <view class="action-btn" @tap="toggleRecentEdit">
            <text class="action-text">{{ isEditingRecent ? '完成' : '编辑' }}</text>
            <text v-if="!isEditingRecent" class="action-arrow">›</text>
          </view>
        </view>

        <view v-if="store.recentTools.length" class="tools-row tools-row--recent">
          <view
            v-for="tool in store.recentTools"
            :key="tool.id"
            class="tool-item"
            @tap="onRecentTap(tool)"
          >
            <view class="tool-icon-box">
              <view class="tool-icon-wrap">
                <image class="tool-icon-img" :src="tool.icon" mode="aspectFit" />
              </view>
              <view
                v-if="isEditingRecent"
                class="tool-delete-btn"
                @tap.stop="removeRecent(tool.id)"
              >
                <text class="tool-delete-icon">×</text>
              </view>
            </view>
            <text class="tool-name">{{ tool.name }}</text>
          </view>
        </view>
        <view v-else class="recent-empty">
          <text class="recent-empty-text">暂无最近使用的工具</text>
        </view>
      </view>

      <!-- 王者荣耀类 -->
      <view class="section-block">
        <view class="section-header">
          <text class="section-title">王者荣耀</text>
        </view>
        <view class="tools-row">
          <view
            v-for="tool in wzryTools"
            :key="tool.id"
            class="tool-item"
            @tap="onToolTap(tool)"
          >
            <view class="tool-icon-wrap tool-icon-wrap--sm">
              <image class="tool-icon-img" :src="tool.icon" mode="aspectFit" />
            </view>
            <text class="tool-name tool-name--sm">{{ tool.name }}</text>
          </view>
        </view>
      </view>

      <!-- 日常类 -->
      <view class="section-block">
        <view class="section-header">
          <text class="section-title">日常类</text>
        </view>
        <view class="tools-row">
          <view
            v-for="tool in dailyTools"
            :key="tool.id"
            class="tool-item"
            @tap="onToolTap(tool)"
          >
            <view class="tool-icon-wrap tool-icon-wrap--sm">
              <image class="tool-icon-img" :src="tool.icon" mode="aspectFit" />
            </view>
            <text class="tool-name tool-name--sm">{{ tool.name }}</text>
          </view>
        </view>
      </view>

      <view style="height: 40rpx;" />
    </view>

    <view class="tools-role-wrap">
      <image
        class="tools-role"
        :src="toolsRole"
        mode="heightFix"
      />
    </view>

    <TabBar :current="2" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToolsStore, type Tool } from '@/store/tools'
import TabBar from '@/components/TabBar/index.vue'
import { useNavBarLayout } from '@/composables/useNavBarLayout'
import { wzryTools, dailyTools, defaultRecentTools } from './assets'

const toolsBg = '/static/imgs/tools_bg.png'
const toolsRole = '/static/imgs/tools_role.png'
const store = useToolsStore()
const { layout, safeRightGap } = useNavBarLayout()
const isEditingRecent = ref(false)

onMounted(() => {
  if (store.recentTools.length === 0) {
    store.initRecentTools(defaultRecentTools)
  }
})

const toggleRecentEdit = () => {
  isEditingRecent.value = !isEditingRecent.value
}

const removeRecent = (id: string) => {
  store.removeRecentTool(id)
}

const onRecentTap = (tool: Tool) => {
  if (isEditingRecent.value) return
  onToolTap(tool)
}

const onToolTap = (tool: Tool) => {
  store.addRecentTool(tool)
  uni.showToast({ title: tool.name, icon: 'none', duration: 800 })
}
</script>

<style lang="scss" scoped>
.toolbox-page {
  position: relative;
  min-height: 100vh;
  background: #fff;
}

.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 0;
  pointer-events: none;
}

/* ─── Banner ─── */
.banner {
  position: relative;
  z-index: 1;
  padding-bottom: 72rpx;
}

.status-placeholder {
  width: 100%;
}

.banner-content {
  position: relative;
  z-index: 2;
  padding: 16rpx 32rpx 28rpx;
}

.banner-text {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.banner-title {
  font-size: 56rpx;
  font-weight: 800;
  color: #fff;
  letter-spacing: 2rpx;
  line-height: 1.1;
}

.banner-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.4;
}

.tools-role-wrap {
  position: absolute;
  top: calc(var(--nav-h) - 8rpx);
  right: 0;
  z-index: 10;
  width: 300rpx;
  height: 220rpx;
  overflow: hidden;
  pointer-events: none;
}

.tools-role {
  position: absolute;
  right: 0;
  top: 0;
  height: 220rpx;
  width: auto;
}

/* ─── Content Area ─── */
.content-area {
  margin-top: -40rpx;
  padding-top: 4rpx;
  position: relative;
  z-index: 2;
  background: transparent;
}

.section-block {
  background: #fff;
  border-radius: 28rpx;
  margin: 0 24rpx 20rpx;
  padding: 28rpx 24rpx 26rpx;
  box-shadow: 0 8rpx 32rpx rgba(109, 40, 217, 0.08);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1A1A2E;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 2rpx;
}

.action-text {
  font-size: 26rpx;
  color: #A855F7;
  font-weight: 500;
}

.action-arrow {
  font-size: 32rpx;
  line-height: 1;
  color: #A855F7;
  margin-top: -2rpx;
}

.recent-empty {
  padding: 12rpx 0 8rpx;
}

.recent-empty-text {
  font-size: 24rpx;
  color: #999;
}

/* ─── Tools row ─── */
.tools-row {
  display: flex;
  flex-wrap: wrap;
  gap: 28rpx 32rpx;
  align-items: flex-start;
}

.tools-row--recent {
  gap: 28rpx 40rpx;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
  width: 96rpx;
}

.tool-icon-box {
  position: relative;
}

.tool-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
}

.tool-icon-wrap--sm {
  width: 84rpx;
  height: 84rpx;
  border-radius: 22rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.tool-icon-img {
  width: 100%;
  height: 100%;
}

.tool-delete-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #FF4D4F;
  border: 2rpx solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.tool-delete-icon {
  font-size: 28rpx;
  line-height: 1;
  color: #fff;
  font-weight: 700;
  margin-top: -2rpx;
}

.tool-name {
  font-size: 22rpx;
  color: #666;
  text-align: center;
  line-height: 1.3;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-name--sm {
  font-size: 20rpx;
  color: #777;
  white-space: normal;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}
</style>
