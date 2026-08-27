<template>
  <view class="interview-home">
    <PageHeader title="面试题" tone="soft" />

    <scroll-view class="home-scroll" scroll-y>
      <view class="hero">
        <text class="hero-kicker">学习类</text>
        <text class="hero-title">面试题</text>
        <text class="hero-sub">题库管理、刷题、错题本分开处理，适合你这种多题库、题型混合的场景。</text>
      </view>

      <view class="entry-grid">
        <view class="entry-card" @tap="go('/subpackage/toolbox/interview/banks/index')">
          <text class="entry-icon">题</text>
          <text class="entry-title">题库</text>
          <text class="entry-sub">新建、删除、搜索、分页管理题库和题目</text>
        </view>
        <view class="entry-card" @tap="go('/subpackage/toolbox/interview/practice/index')">
          <text class="entry-icon">刷</text>
          <text class="entry-title">刷题</text>
          <text class="entry-sub">顺序刷题或随机刷题，支持选择题和问答题</text>
        </view>
        <view class="entry-card" @tap="go('/subpackage/toolbox/interview/wrong/index')">
          <text class="entry-icon">错</text>
          <text class="entry-title">错题本</text>
          <text class="entry-sub">按题库查看错题，直接重练或移除</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import PageHeader from '../shiguangxu/components/PageHeader.vue'

function go(url: string) {
  uni.navigateTo({ url })
}
</script>

<style lang="scss" scoped>
.interview-home {
  min-height: 100vh;
  background: linear-gradient(180deg, #f6f1e7 0%, #fbfaf6 35%, #f7f4ec 100%);
}

.home-scroll {
  height: calc(100vh - 88rpx);
  padding: 0 24rpx 32rpx;
  box-sizing: border-box;
}

.hero {
  margin-top: 12rpx;
  padding: 30rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #10233f 0%, #1d4ed8 100%);
  box-shadow: 0 18rpx 42rpx rgba(16, 35, 63, 0.2);
}

.hero-kicker {
  display: block;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.72);
}

.hero-title {
  display: block;
  margin-top: 10rpx;
  font-size: 48rpx;
  line-height: 1.1;
  font-weight: 800;
  color: #fff;
}

.hero-sub {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.82);
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 18rpx;
}

.entry-card {
  padding: 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10rpx 30rpx rgba(16, 35, 63, 0.08);
}

.entry-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 22rpx;
  background: #10233f;
  color: #fff;
  font-size: 28rpx;
  font-weight: 800;
}

.entry-title {
  display: block;
  margin-top: 16rpx;
  font-size: 30rpx;
  color: #10233f;
  font-weight: 800;
}

.entry-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.5;
  color: #667085;
}
</style>
