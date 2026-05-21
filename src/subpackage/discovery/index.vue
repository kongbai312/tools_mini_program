<template>
  <view class="discovery-page">
    <!-- Hero: gradient + search -->
    <view class="discovery-hero">
      <view class="status-placeholder" :style="{ height: layout.navBarHeight + 'px' }" />
      <view class="search-row">
        <view class="search-box" @tap="onSearchTap">
          <text class="search-icon">⌕</text>
          <text class="search-placeholder">搜索文章、主题、工具...</text>
          <view class="search-star">
            <text class="star-icon">★</text>
          </view>
        </view>
        <image
          class="discover-role"
          :src="discoverRole"
          mode="widthFix"
        />
      </view>
    </view>

    <!-- Hot topics -->
    <view class="categories-area">
      <view class="section categories-section">
      <view class="section-header">
        <text class="section-title">🔥 热门主题</text>
        <view class="more-btn" @tap="onMoreTap">
          <text class="more-text">更多</text>
          <text class="arrow-icon">›</text>
        </view>
      </view>
      <view class="categories-list">
          <view
            v-for="cat in categories"
            :key="cat.id"
            class="category-item"
            @tap="onCategoryTap(cat.name)"
          >
            <view class="category-icon-wrap" :style="{ background: cat.bgColor }">
              <image
                class="category-icon-img"
                :src="cat.icon"
                mode="aspectFit"
              />
            </view>
            <text class="category-name">{{ cat.name }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Content tabs + article list -->
    <view class="content-panel">
      <view class="tabs-wrap">
        <view
          v-for="(tab, i) in tabs"
          :key="i"
          class="tab-item"
          :class="{ 'tab-item--active': activeTab === i }"
          @tap="setTab(i)"
        >
          <text class="tab-text">{{ tab }}</text>
          <view v-if="activeTab === i" class="tab-indicator"></view>
        </view>
      </view>

      <view class="articles-list">
        <view
          v-for="article in currentArticles"
          :key="article.id"
          class="article-card"
          hover-class="article-card--hover"
          @tap="onArticleTap(article)"
        >
          <image
            class="article-cover"
            :src="article.cover"
            mode="aspectFill"
          />
          <view class="article-content">
            <text class="article-title">{{ article.title }}</text>
            <view class="article-footer">
              <view
                class="article-category-badge"
                :style="{
                  background: article.categoryColor + '14',
                }"
              >
                <text class="article-category-text" :style="{ color: article.categoryColor }">
                  {{ article.category }}
                </text>
              </view>
              <view class="article-meta">
                <text class="meta-text">{{ article.views }}阅读</text>
                <text class="meta-time">{{ article.timeAgo }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Tab bar -->
    <TabBar :current="1" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useToolsStore } from '@/store/tools'
import TabBar from '@/components/TabBar/index.vue'
import { useNavBarLayout } from '@/composables/useNavBarLayout'
import { articleCover, categoryIcons, discoverRole } from './assets'

const store = useToolsStore()
const { layout } = useNavBarLayout()
const tabs = ['推荐', '最新', '关注']
const activeTab = computed(() => store.activeTab)
const categories = computed(() =>
  store.categories.map((cat) => ({
    ...cat,
    icon: categoryIcons[cat.id] ?? '',
  })),
)
const currentArticles = computed(() =>
  store.currentArticles.map((article) => ({
    ...article,
    cover: articleCover,
  })),
)

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

/* ─── Hero + Search ─── */
.discovery-hero {
  position: relative;
  z-index: 10;
  background: linear-gradient(180deg, #DCD4FF 0%, #EAE6FF 45%, #F3F0FF 75%, #F5F7FA 100%);
  padding-bottom: 8rpx;
}

.status-placeholder {
  width: 100%;
}

.search-row {
  display: flex;
  align-items: flex-end;
  gap: 4rpx;
  padding: 12rpx 12rpx 8rpx 24rpx;
}

.search-box {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #fff;
  border-radius: 999rpx;
  padding: 18rpx 20rpx 18rpx 28rpx;
  box-shadow: 0 6rpx 24rpx rgba(123, 108, 246, 0.1);
}

.search-icon {
  font-size: 32rpx;
  line-height: 1;
  color: #A0A4B0;
  flex-shrink: 0;
}

.search-placeholder {
  flex: 1;
  font-size: 26rpx;
  color: #C0C4CC;
}

.search-star {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #FFF8E1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2rpx 8rpx rgba(255, 184, 0, 0.18);
}

.star-icon {
  font-size: 32rpx;
  line-height: 1;
  color: #FFB800;
}

/* ─── Categories Area ─── */
.categories-area {
  position: relative;
  margin: 0 24rpx;
  z-index: 12;
}

.discover-role {
  width: 168rpx;
  flex-shrink: 0;
  margin-bottom: -45rpx;
  position: relative;
  z-index: 20;
  pointer-events: none;
}

/* ─── Categories Section ─── */
.categories-section {
  background: #fff;
  margin: 12rpx 0 0;
  padding: 28rpx 0 32rpx;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(91, 127, 255, 0.06);
  position: relative;
  z-index: 15;
}

.section {
  background: #fff;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28rpx 24rpx;
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

.categories-list {
  display: flex;
  padding: 0 20rpx;
  justify-content: space-between;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  flex: 1;
  min-width: 0;
}

.category-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx;
  box-sizing: border-box;
  flex-shrink: 0;
}

.category-icon-img {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
}

.category-name {
  font-size: 24rpx;
  color: #555;
  text-align: center;
}

/* ─── Content Panel (tabs + articles) ─── */
.content-panel {
  background: #fff;
  margin: 16rpx 24rpx 32rpx;
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 24rpx rgba(91, 127, 255, 0.06);
  padding-bottom: 8rpx;
}

/* ─── Tabs ─── */
.tabs-wrap {
  display: flex;
  padding: 0 28rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0 18rpx;
  position: relative;
}

.tab-text {
  font-size: 30rpx;
  color: #999;
}

.tab-item--active .tab-text {
  color: #5B7FFF;
  font-weight: 700;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  width: 48rpx;
  height: 6rpx;
  background: #5B7FFF;
  border-radius: 3rpx;
}

/* ─── Articles ─── */
.articles-list {
  padding: 0;
}

.article-card {
  display: flex;
  align-items: flex-start;
  padding: 24rpx 28rpx;
  gap: 24rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.article-card:last-child {
  border-bottom: none;
}

.article-card--hover {
  background: #FAFBFF;
}

.article-cover {
  width: 220rpx;
  height: 148rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
  background: #EEE;
}

.article-content {
  flex: 1;
  min-width: 0;
  height: 148rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.article-title {
  font-size: 30rpx;
  color: #1A1A2E;
  line-height: 1.45;
  font-weight: 700;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.article-category-badge {
  flex-shrink: 0;
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
}

.article-category-text {
  font-size: 22rpx;
  font-weight: 500;
  line-height: 1.2;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex-shrink: 0;
}

.meta-text,
.meta-time {
  font-size: 22rpx;
  color: #B8BCC8;
  line-height: 1.2;
}
</style>
