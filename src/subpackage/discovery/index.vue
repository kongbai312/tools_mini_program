<template>
  <view class="discovery-page" :class="{ 'discovery-page--dark': userStore.isDark }">
    <image class="page-bg" :src="discoverBg" mode="aspectFill" />
    <view class="page-body">
    <!-- Hero: search + character -->
    <view class="discovery-hero">
      <view class="status-placeholder" :style="{ height: layout.navBarHeight + 'px' }" />
      <view class="search-row">
        <view class="search-box" @tap="onSearchTap">
          <view class="search-icon-wrap">
            <text class="search-icon">⌕</text>
          </view>
          <text class="search-placeholder">搜索文章、主题、工具...</text>
          <view class="search-star" @tap.stop="onStarTap">
            <text class="star-icon">★</text>
          </view>
        </view>
        <image
          class="discover-role"
          :src="discoverRole"
          mode="widthFix"
          lazy-load
        />
      </view>
    </view>

    <!-- Hot topics -->
    <view class="categories-area">
      <view v-if="categoryFilter" class="filter-bar">
        <text class="filter-label">当前：{{ categoryFilter }}</text>
        <view class="filter-clear" @tap="clearCategoryFilter">
          <text class="filter-clear-text">× 清除</text>
        </view>
      </view>
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
            :class="{ 'category-item--active': categoryFilter === cat.name }"
            @tap="onCategoryTap(cat.name)"
          >
            <view class="category-icon-wrap" :style="{ background: cat.bgColor }">
              <image
                class="category-icon-img"
                :src="cat.icon"
                mode="aspectFit"
                lazy-load
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

      <view v-if="activeTab === 2" class="follow-empty">
        <text class="empty-icon">☆</text>
        <text class="empty-title">还没有关注的内容</text>
        <text class="empty-desc">去发现页看看推荐文章吧</text>
        <view class="empty-btn" @tap="goRecommend">
          <text class="empty-btn-text">去看看推荐</text>
        </view>
      </view>

      <view v-else-if="!currentArticles.length" class="list-empty">
        <text class="list-empty-text">该主题下暂无文章</text>
        <view class="list-empty-btn" @tap="clearCategoryFilter">
          <text class="list-empty-btn-text">查看全部</text>
        </view>
      </view>

      <view v-else class="articles-list">
        <ArticleCard
          v-for="article in currentArticles"
          :key="article.id"
          :article="article"
          :cover="articleCover"
          @tap="onArticleTap(article)"
        />
      </view>
    </view>

    <!-- Tab bar -->
    <TabBar :current="1" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useToolsStore, type Article } from '@/store/tools'
import { useUserStore } from '@/store/user'
import TabBar from '@/components/TabBar/index.vue'
import { useNavBarLayout } from '@/composables/useNavBarLayout'
import ArticleCard from './components/ArticleCard.vue'
import { articleCover, categoryIcons, discoverBg, discoverRole } from './assets'

const store = useToolsStore()
const userStore = useUserStore()
const { activeTab, categoryFilter } = storeToRefs(store)
const { layout } = useNavBarLayout()
const tabs = ['推荐', '最新', '关注']

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

const goRecommend = () => {
  store.setActiveTab(0)
}

const onSearchTap = () => {
  uni.navigateTo({ url: '/subpackage/discovery/search/index' })
}

const onStarTap = () => {
  uni.showToast({ title: '收藏功能开发中', icon: 'none' })
}

const onMoreTap = () => {
  uni.navigateTo({ url: '/subpackage/discovery/topics/index' })
}

const onCategoryTap = (name: string) => {
  if (name === '更多') {
    onMoreTap()
    return
  }
  if (categoryFilter.value === name) {
    store.setCategoryFilter(null)
  } else {
    store.setCategoryFilter(name)
  }
}

const clearCategoryFilter = () => {
  store.setCategoryFilter(null)
}

const onArticleTap = (article: Article) => {
  uni.navigateTo({ url: `/subpackage/discovery/article/index?id=${article.id}` })
}
</script>

<style lang="scss" scoped>
.discovery-page {
  min-height: 100vh;
  background: #F3F0FF;
  position: relative;
}

.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
}

.page-body {
  position: relative;
  z-index: 1;
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
}

/* ─── Hero + Search ─── */
.discovery-hero {
  position: relative;
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

.search-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 56rpx;
  height: 56rpx;
  padding-bottom: 12rpx;
  box-sizing: border-box;
}

.search-icon {
  font-size: 56rpx;
  line-height: 1;
  color: #7B6CF6;
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
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 20rpx;
  padding: 16rpx 24rpx;
  margin-bottom: 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(91, 127, 255, 0.06);
}

.filter-label {
  font-size: 26rpx;
  color: #5B7FFF;
  font-weight: 500;
}

.filter-clear-text {
  font-size: 26rpx;
  color: #999;
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

.category-item--active .category-name {
  color: #5B7FFF;
  font-weight: 700;
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

.category-item--active .category-icon-wrap {
  box-shadow: 0 0 0 4rpx rgba(91, 127, 255, 0.35);
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
  position: relative;
  z-index: 1;
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

/* ─── Follow empty ─── */
.follow-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 48rpx 96rpx;
}

.empty-icon {
  font-size: 80rpx;
  color: #E0E0E0;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1A1A2E;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #B8BCC8;
  margin-bottom: 40rpx;
}

.empty-btn {
  padding: 20rpx 48rpx;
  background: linear-gradient(135deg, #7B6CF6, #5B7FFF);
  border-radius: 999rpx;
}

.empty-btn-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
}

/* ─── List empty ─── */
.list-empty {
  padding: 64rpx 28rpx;
  text-align: center;
}

.list-empty-text {
  font-size: 28rpx;
  color: #B8BCC8;
  display: block;
  margin-bottom: 24rpx;
}

.list-empty-btn {
  display: inline-flex;
  padding: 16rpx 40rpx;
  background: #F3F0FF;
  border-radius: 999rpx;
}

.list-empty-btn-text {
  font-size: 26rpx;
  color: #5B7FFF;
}

/* ─── Articles ─── */
.articles-list {
  padding: 0;
}

/* ─── Dark Mode ─── */
.discovery-page--dark {
  background: #1A1A2E;

  .page-bg {
    opacity: 0.50;
  }

  .search-box {
    background: #2D2D4A;
    box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.28);
  }

  .search-icon {
    color: #7B6CF6;
  }

  .search-placeholder {
    color: #555578;
  }

  .categories-section {
    background: #252542;
    box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.22);
  }

  .section-title {
    color: #E8E8F0;
  }

  .more-text,
  .arrow-icon {
    color: #666688;
  }

  .category-name {
    color: #9090A8;
  }

  .content-panel {
    background: #252542;
    box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.22);
  }

  .tabs-wrap {
    border-bottom-color: #333350;
  }

  .tab-text {
    color: #666688;
  }

  .tab-item--active .tab-text {
    color: #7B6CF6;
  }

  .tab-indicator {
    background: #7B6CF6;
  }

  .follow-empty .empty-title {
    color: #E8E8F0;
  }

  .follow-empty .empty-desc {
    color: #666688;
  }

  .list-empty-text {
    color: #666688;
  }

  .list-empty-btn {
    background: #2D2D4A;
  }

  .list-empty-btn-text {
    color: #7B6CF6;
  }

  .filter-bar {
    background: #252542;
  }

  .filter-label {
    color: #7B6CF6;
  }

  .filter-clear-text {
    color: #666688;
  }
}
</style>
