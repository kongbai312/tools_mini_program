<template>
  <view
    class="article-card"
    :class="{ 'article-card--dark': userStore.isDark }"
    hover-class="article-card--hover"
    @tap="$emit('tap')"
  >
    <image class="article-cover" :src="cover" mode="aspectFill" lazy-load />
    <view class="article-content">
      <text class="article-title">{{ article.title }}</text>
      <view class="article-footer">
        <view
          class="article-category-badge"
          :style="{ background: article.categoryColor + '14' }"
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
</template>

<script setup lang="ts">
import type { Article } from '@/store/tools'
import { useUserStore } from '@/store/user'

defineProps<{
  article: Article
  cover: string
}>()

defineEmits<{
  tap: []
}>()

const userStore = useUserStore()
</script>

<style lang="scss" scoped>
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

/* ─── Dark Mode ─── */
.article-card--dark {
  border-bottom-color: #333350;

  &.article-card--hover {
    background: #2A2A45;
  }

  .article-title {
    color: #E8E8F0;
  }

  .meta-text,
  .meta-time {
    color: #666688;
  }
}
</style>
