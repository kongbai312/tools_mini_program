<template>
  <view class="article-page" :class="{ 'article-page--dark': userStore.isDark }" :style="{ '--fade-end': userStore.isDark ? '#1A1A2E' : '#F0F2F8' }">
    <scroll-view v-if="article" scroll-y class="page-scroll" :show-scrollbar="false">
      <!-- Hero cover -->
      <view class="hero">
        <image class="hero-cover" :src="articleCoverImg" mode="aspectFill" lazy-load />
        <view class="hero-mask" />
        <view class="hero-fade" />

        <view class="nav-overlay" :style="{ paddingTop: layout.statusBarHeight + 'px' }">
          <view class="nav-inner" :style="{ height: layout.navContentHeight + 'px' }">
            <view class="back-btn" @tap="goBack">
              <text class="back-icon">‹</text>
            </view>
          </view>
        </view>

        <view class="hero-badge" :style="{ borderColor: article.categoryColor }">
          <text class="hero-badge-dot" :style="{ background: article.categoryColor }" />
          <text class="hero-badge-text" :style="{ color: article.categoryColor }">
            {{ article.category }}
          </text>
        </view>
      </view>

      <!-- Main content sheet -->
      <view class="content-sheet">
        <text class="article-title">{{ article.title }}</text>

        <view class="author-row">
          <view class="author-avatar" :style="{ background: article.categoryColor + '18' }">
            <text class="author-initial">{{ authorInitial }}</text>
          </view>
          <view class="author-info">
            <text class="author-name">{{ article.author }}</text>
            <text class="author-date">{{ article.publishTime }}</text>
          </view>
          <view class="stats-pill">
            <text class="stats-views">{{ article.views }}</text>
            <text class="stats-unit">阅读</text>
          </view>
        </view>

        <view class="meta-chips">
          <text class="meta-chip meta-chip--time">{{ article.timeAgo }}</text>
          <text
            v-for="tag in article.tags"
            :key="tag"
            class="meta-chip"
          >{{ tag }}</text>
        </view>

        <view class="divider">
          <view class="divider-line" />
          <text class="divider-label">正文</text>
          <view class="divider-line" />
        </view>

        <view class="paragraphs">
          <text
            v-for="(para, i) in article.paragraphs"
            :key="i"
            class="paragraph"
            :class="{ 'paragraph--lead': i === 0 }"
          >{{ para }}</text>
        </view>

        <view class="action-bar">
          <view class="action-item" @tap="onLike">
            <text class="action-icon">♡</text>
            <text class="action-label">点赞</text>
          </view>
          <view class="action-item" @tap="onCollect">
            <text class="action-icon">☆</text>
            <text class="action-label">收藏</text>
          </view>
          <view class="action-item" @tap="onShare">
            <text class="action-icon">↗</text>
            <text class="action-label">分享</text>
          </view>
        </view>
      </view>

      <!-- Related -->
      <view v-if="relatedArticles.length" class="related-section">
        <view class="related-header">
          <text class="related-title">相关推荐</text>
          <text class="related-count">{{ relatedArticles.length }} 篇</text>
        </view>
        <view class="related-list">
          <ArticleCard
            v-for="item in relatedWithCover"
            :key="item.id"
            :article="item"
            :cover="articleCoverImg"
            @tap="openArticle(item.id)"
          />
        </view>
      </view>

      <view class="page-footer" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useToolsStore } from '@/store/tools'
import { useUserStore } from '@/store/user'
import type { ArticleDetail } from '@/store/tools'
import { useNavBarLayout } from '@/composables/useNavBarLayout'
import ArticleCard from '../components/ArticleCard.vue'
import { articleCover as articleCoverImg } from '../assets'

const store = useToolsStore()
const userStore = useUserStore()
const { layout } = useNavBarLayout()
const article = ref<ArticleDetail | null>(null)
const articleId = ref(0)
let backTimer: ReturnType<typeof setTimeout> | null = null

const authorInitial = computed(() => {
  const name = article.value?.author ?? ''
  return name ? name.charAt(0) : '编'
})

const relatedArticles = computed(() =>
  articleId.value ? store.getRelatedArticles(articleId.value) : [],
)

const relatedWithCover = computed(() =>
  relatedArticles.value.map((a) => ({ ...a, cover: articleCoverImg })),
)

const scheduleBack = () => {
  if (backTimer) clearTimeout(backTimer)
  backTimer = setTimeout(() => {
    backTimer = null
    uni.navigateBack()
  }, 800)
}

onLoad((options) => {
  const id = Number(options?.id)
  if (!id || Number.isNaN(id)) {
    uni.showToast({ title: '文章不存在', icon: 'none' })
    scheduleBack()
    return
  }
  const detail = store.getArticleById(id)
  if (!detail) {
    uni.showToast({ title: '文章不存在', icon: 'none' })
    scheduleBack()
    return
  }
  articleId.value = id
  article.value = detail
})

onUnmounted(() => {
  if (backTimer) {
    clearTimeout(backTimer)
    backTimer = null
  }
})

const goBack = () => {
  uni.navigateBack()
}

const openArticle = (id: number) => {
  uni.redirectTo({ url: `/subpackage/discovery/article/index?id=${id}` })
}

const onLike = () => {
  uni.showToast({ title: '已点赞', icon: 'none' })
}

const onCollect = () => {
  uni.showToast({ title: '收藏功能开发中', icon: 'none' })
}

const onShare = () => {
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.article-page {
  min-height: 100vh;
  background: #F0F2F8;
}

.page-scroll {
  height: 100vh;
}

.page-footer {
  height: calc(32rpx + env(safe-area-inset-bottom));
}

/* ─── Hero ─── */
.hero {
  position: relative;
  width: 100%;
  height: 520rpx;
  overflow: hidden;
}

.hero-cover {
  width: 100%;
  height: 100%;
  background: #2a2a3e;
}

.hero-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(20, 24, 40, 0.35) 0%,
    rgba(20, 24, 40, 0.05) 45%,
    rgba(20, 24, 40, 0.55) 100%
  );
  pointer-events: none;
}

.hero-fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 220rpx;
  background: linear-gradient(180deg, transparent 0%, var(--fade-end, #F0F2F8) 72%);
  pointer-events: none;
}

.nav-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.nav-inner {
  display: flex;
  align-items: center;
  padding: 0 24rpx;
}

.back-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(12px);
  border: 1rpx solid rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 52rpx;
  line-height: 1;
  color: #fff;
  margin-top: -6rpx;
  font-weight: 300;
}

.hero-badge {
  position: absolute;
  left: 32rpx;
  bottom: 72rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 12rpx 26rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  border: 1.5rpx solid transparent;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.18);
}

.hero-badge-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.hero-badge-text {
  font-size: 24rpx;
  font-weight: 700;
  letter-spacing: 0.5rpx;
}

/* ─── Content sheet ─── */
.content-sheet {
  position: relative;
  margin: -48rpx 24rpx 0;
  background: #fff;
  border-radius: 36rpx;
  padding: 44rpx 36rpx 36rpx;
  box-shadow: 0 8rpx 40rpx rgba(42, 58, 110, 0.08);
}

.article-title {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: #14182B;
  line-height: 1.5;
  letter-spacing: 0.5rpx;
  margin-bottom: 36rpx;
}

.author-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 28rpx;
}

.author-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.author-initial {
  font-size: 32rpx;
  font-weight: 700;
  color: #5B7FFF;
}

.author-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.author-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1A1A2E;
}

.author-date {
  font-size: 22rpx;
  color: #A8AEBD;
}

.stats-pill {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 12rpx 20rpx;
  background: #F5F7FC;
  border-radius: 16rpx;
}

.stats-views {
  font-size: 28rpx;
  font-weight: 700;
  color: #5B7FFF;
  line-height: 1.2;
}

.stats-unit {
  font-size: 20rpx;
  color: #A8AEBD;
}

.meta-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 36rpx;
}

.meta-chip {
  font-size: 22rpx;
  color: #6B7289;
  background: #F3F5FA;
  padding: 10rpx 20rpx;
  border-radius: 12rpx;
  line-height: 1.2;
}

.meta-chip--time {
  color: #5B7FFF;
  background: #EEF2FF;
  font-weight: 500;
}

.divider {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 36rpx;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, #E8ECF4, transparent);
}

.divider-label {
  font-size: 22rpx;
  color: #C5CAD8;
  letter-spacing: 4rpx;
  flex-shrink: 0;
}

.paragraphs {
  display: flex;
  flex-direction: column;
  gap: 36rpx;
}

.paragraph {
  font-size: 30rpx;
  color: #3D4257;
  line-height: 1.9;
  letter-spacing: 0.5rpx;
  text-align: justify;
}

.paragraph--lead {
  font-size: 32rpx;
  color: #2A2F45;
  line-height: 1.85;
  font-weight: 500;
}

.action-bar {
  display: flex;
  margin-top: 48rpx;
  padding-top: 32rpx;
  border-top: 1rpx solid #F0F2F8;
  gap: 16rpx;
}

.action-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx 0;
  background: #F8F9FC;
  border-radius: 20rpx;
}

.action-item:active {
  background: #EEF2FF;
}

.action-icon {
  font-size: 36rpx;
  color: #5B7FFF;
  line-height: 1;
}

.action-label {
  font-size: 22rpx;
  color: #8A90A5;
}

/* ─── Related ─── */
.related-section {
  margin: 28rpx 24rpx 0;
  background: #fff;
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 32rpx rgba(42, 58, 110, 0.06);
}

.related-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 32rpx 32rpx 8rpx;
}

.related-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #14182B;
}

.related-count {
  font-size: 24rpx;
  color: #A8AEBD;
}

.related-list {
  padding-bottom: 8rpx;
}

/* ─── Dark Mode ─── */
.article-page--dark {
  background: #1A1A2E;

  .content-sheet {
    background: #252542;
    box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.32);
  }

  .article-title {
    color: #E8E8F0;
  }

  .author-name {
    color: #E8E8F0;
  }

  .author-date {
    color: #666688;
  }

  .stats-pill {
    background: #2D2D4A;
  }

  .meta-chip {
    background: #2D2D4A;
    color: #9090A8;
  }

  .meta-chip--time {
    background: #1E1E40;
  }

  .divider-line {
    background: linear-gradient(90deg, transparent, #333350, transparent);
  }

  .divider-label {
    color: #444460;
  }

  .paragraph {
    color: #BEBECE;
  }

  .paragraph--lead {
    color: #D8D8E8;
  }

  .action-item {
    background: #2D2D4A;
  }

  .action-item:active {
    background: #252560;
  }

  .action-label {
    color: #666688;
  }

  .related-section {
    background: #252542;
    box-shadow: 0 6rpx 32rpx rgba(0, 0, 0, 0.28);
  }

  .related-title {
    color: #E8E8F0;
  }

  .related-count {
    color: #666688;
  }
}
</style>
