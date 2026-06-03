<template>
  <view class="search-page" :class="{ 'search-page--dark': userStore.isDark }">
    <image class="page-bg" :src="discoverBg" mode="aspectFill" />
    <view class="page-body">
      <view class="status-placeholder" :style="{ height: layout.navBarHeight + 'px' }" />

      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="search-input-wrap">
          <text class="search-icon">⌕</text>
          <input
            class="search-input"
            type="text"
            :value="keyword"
            placeholder="搜索文章、主题、工具..."
            confirm-type="search"
            focus
            @input="onInput"
            @confirm="onConfirm"
          />
          <view v-if="keyword" class="clear-btn" @tap.stop="clearKeyword">
            <text class="clear-text">×</text>
          </view>
        </view>
      </view>

      <view v-if="!keyword.trim()" class="hot-section">
        <text class="hot-title">热门搜索</text>
        <view class="hot-tags">
          <view
            v-for="word in hotKeywords"
            :key="word"
            class="hot-tag"
            @tap="selectHot(word)"
          >
            <text class="hot-tag-text">{{ word }}</text>
          </view>
        </view>
      </view>

      <view v-else class="results-section">
        <text v-if="results.length" class="results-hint">找到 {{ results.length }} 条结果</text>
        <view v-if="!results.length" class="empty-wrap">
          <text class="empty-text">暂无相关文章</text>
        </view>
        <view v-else class="results-list">
          <ArticleCard
            v-for="article in resultsWithCover"
            :key="article.id"
            :article="article"
            :cover="articleCover"
            @tap="openArticle(article.id)"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { hotSearchKeywords, useToolsStore } from '@/store/tools'
import { useUserStore } from '@/store/user'
import { useNavBarLayout } from '@/composables/useNavBarLayout'
import ArticleCard from '../components/ArticleCard.vue'
import { articleCover, discoverBg } from '../assets'

const store = useToolsStore()
const userStore = useUserStore()
const { layout } = useNavBarLayout()
const keyword = ref('')
const debouncedKeyword = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const hotKeywords = hotSearchKeywords

const results = computed(() => store.searchArticles(debouncedKeyword.value))

const resultsWithCover = computed(() =>
  results.value.map((article) => ({ ...article, cover: articleCover })),
)

const scheduleSearch = (value: string) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedKeyword.value = value
  }, 300)
}

const onInput = (e: unknown) => {
  const value = (e as { detail?: { value?: string } }).detail?.value ?? ''
  keyword.value = value
  scheduleSearch(keyword.value)
}

const onConfirm = () => {
  debouncedKeyword.value = keyword.value
}

const selectHot = (word: string) => {
  keyword.value = word
  debouncedKeyword.value = word
}

const clearKeyword = () => {
  keyword.value = ''
  debouncedKeyword.value = ''
}

const goBack = () => {
  uni.navigateBack()
}

const openArticle = (id: number) => {
  uni.navigateTo({ url: `/subpackage/discovery/article/index?id=${id}` })
}

onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
})
</script>

<style lang="scss" scoped>
.search-page {
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
  padding: 0 24rpx 48rpx;
}

.status-placeholder {
  width: 100%;
}

.nav-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4rpx 16rpx rgba(91, 127, 255, 0.1);
}

.back-icon {
  font-size: 48rpx;
  line-height: 1;
  color: #5B7FFF;
  margin-top: -4rpx;
}

.search-input-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #fff;
  border-radius: 999rpx;
  padding: 16rpx 24rpx;
  box-shadow: 0 6rpx 24rpx rgba(123, 108, 246, 0.1);
}

.search-icon {
  font-size: 44rpx;
  color: #7B6CF6;
  flex-shrink: 0;
  line-height: 1;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #1A1A2E;
  min-width: 0;
}

.clear-btn {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #F0F0F0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.clear-text {
  font-size: 32rpx;
  color: #999;
  line-height: 1;
}

.hot-section {
  background: #fff;
  border-radius: 32rpx;
  padding: 32rpx 28rpx;
  box-shadow: 0 4rpx 24rpx rgba(91, 127, 255, 0.06);
}

.hot-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1A1A2E;
  margin-bottom: 24rpx;
  display: block;
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.hot-tag {
  padding: 14rpx 28rpx;
  background: #F3F0FF;
  border-radius: 999rpx;
}

.hot-tag-text {
  font-size: 26rpx;
  color: #5B7FFF;
}

.results-section {
  background: #fff;
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 24rpx rgba(91, 127, 255, 0.06);
}

.results-hint {
  display: block;
  padding: 24rpx 28rpx 0;
  font-size: 24rpx;
  color: #999;
}

.empty-wrap {
  padding: 80rpx 28rpx;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #B8BCC8;
}

.results-list {
  padding-bottom: 8rpx;
}

/* ─── Dark Mode ─── */
.search-page--dark {
  background: #1A1A2E;

  .page-bg {
    opacity: 0.12;
  }

  .back-btn {
    background: rgba(45, 45, 74, 0.9);
  }

  .back-icon {
    color: #7B6CF6;
  }

  .search-input-wrap {
    background: #2D2D4A;
    box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.28);
  }

  .search-icon {
    color: #7B6CF6;
  }

  .search-input {
    color: #E8E8F0;
  }

  .clear-btn {
    background: #3D3D60;
  }

  .clear-text {
    color: #888;
  }

  .hot-section {
    background: #252542;
    box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.22);
  }

  .hot-title {
    color: #E8E8F0;
  }

  .hot-tag {
    background: #1E1A38;
  }

  .hot-tag-text {
    color: #7B6CF6;
  }

  .results-section {
    background: #252542;
    box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.22);
  }

  .results-hint {
    color: #666688;
  }

  .empty-text {
    color: #555578;
  }
}
</style>
