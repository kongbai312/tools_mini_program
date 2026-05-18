<template>
  <view class="home-page">
    <!-- Weather section with gradient background -->
    <view class="weather-section">
      <!-- Status bar + header -->
      <view class="status-placeholder" :style="{ height: statusBarHeight + 'px' }" />
      <view class="weather-card">
        <image class="weather-bg-img" src="/static/imgs/home-bg.png" mode="aspectFill" />
        <view class="weather-header">
          <view class="location-wrap">
            <text class="local-icon">⌖</text>
            <text class="city-text">{{ weather.city }} {{ weather.district }}</text>
            <text class="local-icon local-icon--muted">⌄</text>
          </view>
          <view class="header-right">
            <text class="wx-emoji">{{ weather.weatherIcon }}</text>
            <view class="add-btn">
              <text class="plus-icon">+</text>
            </view>
          </view>
        </view>

        <!-- Weather body -->
        <view class="weather-body">
          <view class="weather-left">
            <view class="temp-wrap">
              <text class="temperature">{{ weather.temp }}</text>
              <text class="degree">°C</text>
            </view>
            <text class="weather-type">{{ weather.weather }}</text>
            <view class="weather-details">
              <text class="detail-item">体感 {{ weather.feel }}°C</text>
              <text class="detail-sep">·</text>
              <text class="detail-item">湿度 {{ weather.humidity }}%</text>
              <text class="detail-sep">·</text>
              <text class="detail-item">{{ weather.wind }}</text>
            </view>
            <view class="aqi-badge">
              <view class="aqi-dot" />
              <text class="aqi-text">空气{{ weather.aqiLevel }} {{ weather.aqi }}</text>
            </view>
          </view>
        </view>
        <image
          class="character-img"
          src="/static/imgs/home_role.png"
          mode="widthFix"
        />
      </view>
    </view>

    <!-- Hot topics card -->
    <view class="topics-card">
      <view class="card-header">
        <view class="title-wrap">
          <text class="flame-icon">🔥</text>
          <text class="section-title">今日热点</text>
        </view>
        <view class="source-pill" @tap="cycleSource">
          <text class="source-pill-text">{{ store.sources[store.activeSource] }}</text>
          <text class="source-pill-arrow">⌄</text>
        </view>
      </view>

      <view class="topics-list">
        <view
          v-for="topic in store.currentTopics"
          :key="topic.id"
          class="topic-item"
          hover-class="topic-item--hover"
          @tap="onTopicTap(topic.title)"
        >
          <text
            class="rank-num"
            :class="{
              'rank-top1': topic.rank === 1,
              'rank-top2': topic.rank === 2,
              'rank-top3': topic.rank === 3,
            }"
          >{{ topic.rank }}</text>
          <text class="topic-title">{{ topic.title }}</text>
          <view class="topic-right">
            <view v-if="topic.tag === 'new'" class="tag tag-new"><text>新</text></view>
            <view v-else-if="topic.tag === 'hot'" class="tag tag-hot"><text>热</text></view>
            <view v-else-if="topic.tag === 'boom'" class="tag tag-boom"><text>爆</text></view>
            <view v-else-if="topic.tag === 'video'" class="tag tag-video"><text>折</text></view>
            <text class="views-count">{{ topic.views }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Tab bar -->
    <TabBar :current="0" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useWeatherStore } from '@/store/weather'
import TabBar from '@/components/TabBar/index.vue'

const store = useWeatherStore()
const weather = computed(() => store.weather)

const statusBarHeight = ref(20)
onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
  } catch (e) {
    statusBarHeight.value = 20
  }
})

const onTopicTap = (title: string) => {
  uni.showToast({ title: '正在搜索...', icon: 'none', duration: 1000 })
}

const cycleSource = () => {
  const nextIndex = (store.activeSource + 1) % store.sources.length
  store.setSource(nextIndex)
}
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #E5F7FF 0%, #F7FBFF 42%, #FFFFFF 100%);
  padding-bottom: 20rpx;
}

/* ─── Weather Section ─── */
.weather-section {
  background: linear-gradient(160deg, #4AC8EE 0%, #6BCFF5 40%, #9DDFF8 70%, #C3EDFB 100%);
  padding: 0 20rpx 18rpx;
  position: relative;
  overflow: hidden;
}

.weather-card {
  position: relative;
  overflow: hidden;
  min-height: 378rpx;
  border-radius: 28rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.62);
  background: rgba(88, 193, 239, 0.78);
  box-shadow: 0 14rpx 38rpx rgba(29, 124, 199, 0.18);
}

.weather-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.42;
}

.status-placeholder {
  width: 100%;
}

.weather-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 28rpx 2rpx;
  position: relative;
  z-index: 1;
}

.location-wrap {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.local-icon {
  font-size: 30rpx;
  line-height: 1;
  color: rgba(255, 255, 255, 0.95);
}

.local-icon--muted {
  color: rgba(255, 255, 255, 0.7);
}

.city-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
  margin: 0 6rpx;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.wx-emoji {
  font-size: 40rpx;
}

.add-btn {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.plus-icon {
  font-size: 34rpx;
  line-height: 1;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 300;
}

.weather-body {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 10rpx 34rpx 12rpx;
  position: relative;
  z-index: 1;
}

.weather-left {
  flex: 1;
  padding-bottom: 0;
  position: relative;
  z-index: 2;
  max-width: 430rpx;
}

.temp-wrap {
  display: flex;
  align-items: flex-start;
  line-height: 1;
  margin-top: 4rpx;
}

.temperature {
  font-size: 110rpx;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.12);
}

.degree {
  font-size: 40rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 20rpx;
  font-weight: 500;
}

.weather-type {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
  margin-top: 18rpx;
  display: block;
}

.weather-details {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 20rpx;
  gap: 4rpx;
}

.detail-item {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
}

.detail-sep {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 4rpx;
}

.aqi-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 20rpx;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 40rpx;
  padding: 6rpx 16rpx;
  width: fit-content;
}

.aqi-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #52C41A;
}

.aqi-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.95);
}

.character-img {
  position: absolute;
  right: 4rpx;
  bottom: -32rpx;
  z-index: 1;
  width: 320rpx;
}

/* ─── Topics Card ─── */
.topics-card {
  margin: 14rpx 20rpx 0;
  background: #fff;
  border-radius: 28rpx;
  padding: 24rpx 22rpx 18rpx;
  border: 2rpx solid rgba(223, 238, 248, 0.95);
  box-shadow: 0 12rpx 40rpx rgba(35, 55, 95, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 16rpx;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.flame-icon {
  font-size: 36rpx;
  line-height: 1;
}

.section-title {
  font-size: 36rpx;
  font-weight: 800;
  color: #1D2440;
  letter-spacing: 1rpx;
}

.source-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  min-width: 146rpx;
  height: 56rpx;
  padding: 0 18rpx;
  border: 2rpx solid #FFC7DD;
  border-radius: 999rpx;
  background: #FFF8FC;
}

.source-pill-text {
  font-size: 26rpx;
  font-weight: 700;
  color: #FF4F93;
  line-height: 1;
}

.source-pill-arrow {
  font-size: 28rpx;
  color: #FF7AAD;
  line-height: 1;
}

/* Topic items */
.topic-item {
  display: flex;
  align-items: center;
  min-height: 58rpx;
  padding: 3rpx 0;
}

.topic-item--hover {
  opacity: 0.72;
}

.rank-num {
  font-size: 31rpx;
  font-weight: 800;
  color: #8B8FA6;
  width: 42rpx;
  text-align: left;
  flex-shrink: 0;
  font-family: DINAlternate-Bold, Impact, sans-serif;
}

.rank-top1 {
  color: #FF2F2F;
}

.rank-top2 {
  color: #FF6B21;
}

.rank-top3 {
  color: #FF8A00;
}

.topic-title {
  flex: 1;
  font-size: 28rpx;
  color: #1F2742;
  line-height: 1.5;
  margin: 0 14rpx 0 8rpx;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topic-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
  min-width: 134rpx;
  justify-content: flex-end;
}

.tag {
  width: 30rpx;
  height: 30rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag text {
  font-size: 20rpx;
  line-height: 1;
  color: #fff;
  font-weight: 800;
}

.tag-new {
  background: linear-gradient(135deg, #FF62CB, #B550FF);
}

.tag-hot {
  background: linear-gradient(135deg, #FFB22E, #FF6B21);
}

.tag-boom {
  background: linear-gradient(135deg, #FF4B5C, #E60012);
}

.tag-video {
  background: linear-gradient(135deg, #6DA7FF, #336DFF);
}

.views-count {
  font-size: 24rpx;
  color: #8D92AA;
  min-width: 78rpx;
  text-align: right;
}
</style>
