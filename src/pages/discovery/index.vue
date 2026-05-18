<template>
  <view class="discovery-page">
    <!-- Top bar: search + avatar -->
    <view class="top-bar-wrap">
      <view class="status-placeholder" :style="{ height: statusBarHeight + 'px' }" />
      <view class="top-bar">
        <view class="search-box" @tap="onSearchTap">
          <text class="search-icon">⌕</text>
          <text class="search-placeholder">搜索文章、主题、工具...</text>
        </view>
        <view class="avatar-star">
          <text class="star-icon">★</text>
        </view>
      </view>
    </view>

    <!-- Hot topics categories -->
    <view class="section categories-section">
      <view class="section-header">
        <text class="section-title">🔥 热门主题</text>
        <view class="more-btn" @tap="onMoreTap">
          <text class="more-text">更多</text>
          <text class="arrow-icon">›</text>
        </view>
      </view>
      <scroll-view scroll-x class="categories-scroll" :show-scrollbar="false">
        <view class="categories-list">
          <view
            v-for="cat in store.categories"
            :key="cat.id"
            class="category-item"
            @tap="onCategoryTap(cat.name)"
          >
            <view class="category-icon-wrap" :style="{ background: cat.bgColor }">
              <text class="category-emoji">{{ cat.icon }}</text>
            </view>
            <text class="category-name">{{ cat.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Content tabs -->
    <view class="tabs-wrap">
      <view
        v-for="(tab, i) in tabs"
        :key="i"
        class="tab-item"
        :class="{ 'tab-item--active': activeTab === i }"
        @tap="setTab(i)"
      >
        <text class="tab-text">{{ tab }}</text>
        <view v-if="activeTab === i" class="tab-indicator" />
      </view>
    </view>

    <!-- Article list -->
    <view class="articles-list">
      <view
        v-for="article in currentArticles"
        :key="article.id"
        class="article-card"
        hover-class="article-card--hover"
        @tap="onArticleTap(article)"
      >
        <view class="article-content">
          <view class="article-category-badge" :style="{ background: article.categoryColor + '18', borderColor: article.categoryColor + '40' }">
            <text class="article-category-text" :style="{ color: article.categoryColor }">{{ article.category }}</text>
          </view>
          <text class="article-title">{{ article.title }}</text>
          <view class="article-meta">
            <text class="eye-icon">◉</text>
            <text class="meta-text">{{ article.views }}阅读</text>
            <text class="meta-sep">·</text>
            <text class="meta-time">{{ article.timeAgo }}</text>
          </view>
        </view>
        <image
          class="article-cover"
          :src="article.cover"
          mode="aspectFill"
          lazy-load
        />
      </view>
    </view>

    <!-- Discover role character (top right decoration) -->
    <image
      class="discover-role"
      src="/static/imgs/discover_role.png"
      mode="widthFix"
    />

    <!-- Tab bar -->
    <TabBar :current="1" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToolsStore } from '@/store/tools'
import TabBar from '@/components/TabBar/index.vue'

const store = useToolsStore()
const tabs = ['推荐', '最新', '关注']
const activeTab = computed(() => store.activeTab)
const currentArticles = computed(() => store.currentArticles)

const statusBarHeight = ref(20)
onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
  } catch (e) {
    statusBarHeight.value = 20
  }
})

const setTab = (i: number) => {
  store.setActiveTab(i)
}

const onSearchTap = () => {
  uni.showToast({ title: '搜索功能开发中', icon: 'none' })
}

const onMoreTap = () => {
  uni.showToast({ title: '更多主题', icon: 'none' })
}

const onCategoryTap = (name: string) => {
  uni.showToast({ title: name, icon: 'none', duration: 800 })
}

const onArticleTap = (article: any) => {
  uni.showToast({ title: '文章详情', icon: 'none', duration: 800 })
}
</script>

<style lang="scss" scoped>
.discovery-page {
  min-height: 100vh;
  background: #F5F7FA;
  position: relative;
}

/* ─── Top Bar ─── */
.top-bar-wrap {
  background: #fff;
  position: relative;
  z-index: 10;
}

.status-placeholder {
  width: 100%;
}

.top-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 30rpx 20rpx;
  gap: 20rpx;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #F5F7FA;
  border-radius: 40rpx;
  padding: 16rpx 24rpx;
}

.search-icon {
  font-size: 32rpx;
  line-height: 1;
  color: #999;
}

.search-placeholder {
  font-size: 26rpx;
  color: #BBBBBB;
}

.avatar-star {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #FFF8E1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2rpx 8rpx rgba(255, 184, 0, 0.2);
}

.star-icon {
  font-size: 38rpx;
  line-height: 1;
  color: #FFB800;
}

/* ─── Discover Role ─── */
.discover-role {
  position: absolute;
  top: 0;
  right: 0;
  width: 180rpx;
  pointer-events: none;
  z-index: 5;
}

/* ─── Categories Section ─── */
.categories-section {
  background: #fff;
  margin-top: 16rpx;
  padding: 24rpx 0 20rpx;
}

.section {
  background: #fff;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1A1A2E;
}

.more-btn {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.more-text {
  font-size: 26rpx;
  color: #999;
}

.arrow-icon {
  font-size: 34rpx;
  line-height: 1;
  color: #999;
}

.categories-scroll {
  width: 100%;
}

.categories-list {
  display: flex;
  padding: 0 30rpx;
  gap: 32rpx;
  white-space: nowrap;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
}

.category-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-emoji {
  font-size: 48rpx;
}

.category-name {
  font-size: 24rpx;
  color: #555;
  text-align: center;
}

/* ─── Tabs ─── */
.tabs-wrap {
  display: flex;
  background: #fff;
  margin-top: 16rpx;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0 16rpx;
  position: relative;
}

.tab-text {
  font-size: 30rpx;
  color: #999;
}

.tab-item--active .tab-text {
  color: #1A1A2E;
  font-weight: 700;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  width: 40rpx;
  height: 6rpx;
  background: #5B7FFF;
  border-radius: 3rpx;
}

/* ─── Articles ─── */
.articles-list {
  padding: 16rpx 0;
}

.article-card {
  display: flex;
  align-items: flex-start;
  background: #fff;
  padding: 24rpx 30rpx;
  margin-bottom: 16rpx;
  gap: 20rpx;
}

.article-card--hover {
  background: #F8F9FF;
}

.article-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.article-category-badge {
  width: fit-content;
  padding: 4rpx 14rpx;
  border-radius: 6rpx;
  border: 1rpx solid transparent;
}

.article-category-text {
  font-size: 22rpx;
  font-weight: 500;
}

.article-title {
  font-size: 28rpx;
  color: #1A1A2E;
  line-height: 1.6;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-top: 4rpx;
}

.eye-icon {
  font-size: 22rpx;
  line-height: 1;
  color: #BBBBBB;
}

.meta-text,
.meta-time {
  font-size: 22rpx;
  color: #BBBBBB;
}

.meta-sep {
  font-size: 22rpx;
  color: #DDDDDD;
}

.article-cover {
  width: 200rpx;
  height: 140rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  background: #EEE;
}
</style>
