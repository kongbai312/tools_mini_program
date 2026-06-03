<template>
  <view class="home-page" :class="{ 'home-page--dark': userStore.isDark }">
    <image class="page-bg" :src="IMG.homeBgLong" mode="aspectFill" />

    <!-- Weather section -->
    <view class="weather-section">
      <!-- 顶部安全区：状态栏 + 微信胶囊 -->
      <view class="status-placeholder" :style="{ height: layout.navBarHeight + 'px' }" />
      <view class="weather-card">
        <view class="weather-bg-wrap">
          <image class="weather-bg-img" :src="IMG.homeBgLong" mode="aspectFill" />
        </view>
        <view class="weather-header">
          <view class="location-wrap">
            <text class="local-icon">⌖</text>
            <text class="city-text">{{ weather.city }} {{ weather.district }}</text>
            <text class="local-icon local-icon--muted">⌄</text>
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
          :src="IMG.homeRole"
          mode="widthFix"
        />
      </view>
    </view>

    <!-- Hot topics card -->
    <view class="topics-card" :class="{ 'topics-card--menu-open': sourceOpen }">
      <view class="card-header">
        <view class="title-wrap">
          <text class="flame-icon">🔥</text>
          <text class="section-title">今日热点</text>
        </view>
        <view class="source-selector">
          <view class="source-pill" @tap.stop="toggleSourceMenu">
            <text class="source-pill-text">{{ sources[activeSource] }}</text>
            <view
              class="source-pill-arrow"
              :class="{ 'source-pill-arrow--open': sourceOpen }"
            />
          </view>
          <view v-if="sourceOpen" class="source-dropdown">
            <view
              v-for="(source, index) in sources"
              :key="source"
              class="source-option"
              :class="{ 'source-option--active': activeSource === index }"
              @tap.stop="selectSource(index)"
            >
              <text class="source-option-text">{{ source }}</text>
              <text v-if="activeSource === index" class="source-option-check">✓</text>
            </view>
          </view>
        </view>
      </view>

      <scroll-view
        scroll-y
        class="topics-scroll"
        :style="topicsScrollStyle"
        :scroll-top="topicsScrollTop"
        :show-scrollbar="false"
      >
        <view class="topics-list" :style="topicsListStyle">
          <view
            v-for="topic in currentTopics"
            :key="`${activeSource}-${topic.id}`"
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
      </scroll-view>
    </view>

    <!-- Tab bar -->
    <TabBar :current="0" />

    <view v-if="sourceOpen" class="source-mask" @tap="closeSourceMenu" />
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeatherStore } from '@/store/weather'
import { useUserStore } from '@/store/user'
import TabBar from '@/components/TabBar/index.vue'
import { useNavBarLayout } from '@/composables/useNavBarLayout'

const IMG = {
  homeBgLong: '/static/imgs/home_bg_long.png',
  homeRole: '/static/imgs/home_role.png',
} as const

const store = useWeatherStore()
const userStore = useUserStore()
const { currentTopics, activeSource, sources } = storeToRefs(store)
const weather = computed(() => store.weather)
const { layout } = useNavBarLayout()
const instance = getCurrentInstance()
const sourceOpen = ref(false)
const topicsScrollHeight = ref(0)
const topicsScrollTop = ref(0)
let heightTimer: ReturnType<typeof setTimeout> | null = null

const topicsScrollStyle = computed(() =>
  topicsScrollHeight.value > 0 ? { height: `${topicsScrollHeight.value}px` } : {},
)

const topicsListStyle = computed(() =>
  topicsScrollHeight.value > 0 ? { minHeight: `${topicsScrollHeight.value}px` } : {},
)

const calcTopicsScrollHeight = () => {
  if (!instance) return
  const query = uni.createSelectorQuery().in(instance)
  query.select('.topics-card').boundingClientRect()
  query.select('.card-header').boundingClientRect()
  query.exec((res) => {
    const cardH = res[0]?.height ?? 0
    const headerH = res[1]?.height ?? 0
    const height = cardH - headerH
    if (height > 0) {
      topicsScrollHeight.value = Math.max(height, uni.upx2px(240))
    }
  })
}

onMounted(() => {
  nextTick(() => {
    heightTimer = setTimeout(calcTopicsScrollHeight, 50)
  })
})

onUnmounted(() => {
  if (heightTimer !== null) {
    clearTimeout(heightTimer)
    heightTimer = null
  }
})

const onTopicTap = (title: string) => {
  uni.showToast({ title: '正在搜索...', icon: 'none', duration: 1000 })
}

const toggleSourceMenu = () => {
  sourceOpen.value = !sourceOpen.value
}

const closeSourceMenu = () => {
  sourceOpen.value = false
}

const selectSource = (index: number) => {
  store.setSource(index)
  sourceOpen.value = false
  topicsScrollTop.value = 1
  nextTick(() => {
    topicsScrollTop.value = 0
  })
}
</script>

<style lang="scss" scoped>
.home-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
  position: relative;
  background: #fff;
  overflow: hidden;
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

/* ─── Weather Section ─── */
.weather-section {
  flex-shrink: 0;
  padding: 0 20rpx 18rpx;
  position: relative;
  z-index: 1;
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

.weather-bg-wrap {
  position: absolute;
  inset: 0;
  border-radius: 28rpx;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.weather-bg-img {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
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
  padding: 10rpx 260rpx 16rpx 34rpx;
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
  bottom: 0;
  z-index: 2;
  width: 248rpx;
  pointer-events: none;
}

/* ─── Topics Card ─── */
.topics-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  margin: 14rpx 20rpx 0;
  background: #fff;
  border-radius: 28rpx;
  padding: 24rpx 22rpx 18rpx;
  border: 2rpx solid rgba(223, 238, 248, 0.95);
  box-shadow: 0 12rpx 40rpx rgba(35, 55, 95, 0.08);
  overflow: hidden;
}

.topics-card--menu-open {
  z-index: 25;
  overflow: visible;
}

.card-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 16rpx;
}

.topics-scroll {
  flex: 1;
  min-height: 0;
  width: 100%;
}

.topics-list {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
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

.source-selector {
  position: relative;
  z-index: 30;
}

.source-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  min-width: 160rpx;
  height: 56rpx;
  padding: 0 22rpx 0 20rpx;
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
  width: 10rpx;
  height: 10rpx;
  border-right: 3rpx solid #FF5C98;
  border-bottom: 3rpx solid #FF5C98;
  transform: rotate(45deg);
  transition: transform 0.22s ease;
  flex-shrink: 0;
  margin-top: -5rpx;
  margin-left: 4rpx;
}

.source-pill-arrow--open {
  transform: rotate(225deg);
  margin-top: 3rpx;
}

.source-dropdown {
  position: absolute;
  top: calc(100% + 10rpx);
  right: 0;
  min-width: 220rpx;
  padding: 8rpx;
  border-radius: 20rpx;
  background: #fff;
  border: 2rpx solid #FFE3EF;
  box-shadow: 0 12rpx 36rpx rgba(255, 79, 147, 0.14);
  z-index: 2;
}

.source-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 18rpx 20rpx;
  border-radius: 14rpx;
}

.source-option--active {
  background: #FFF0F6;
}

.source-option-text {
  font-size: 26rpx;
  color: #4A4F63;
  line-height: 1;
}

.source-option--active .source-option-text {
  color: #FF4F93;
  font-weight: 700;
}

.source-option-check {
  font-size: 24rpx;
  color: #FF4F93;
  font-weight: 700;
  line-height: 1;
}

.source-mask {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: transparent;
}

/* Topic items */
.topic-item {
  display: flex;
  align-items: center;
  min-height: 58rpx;
  padding: 6rpx 0;
  flex-shrink: 0;
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

/* ─── Dark Mode ─── */
.home-page--dark {
  background: #1A1A2E;

  .page-bg {
    opacity: 0.28;
  }

  .weather-card {
    background: rgba(37, 37, 66, 0.78);
    border-color: rgba(80, 80, 120, 0.42);
    box-shadow: 0 14rpx 38rpx rgba(0, 0, 0, 0.32);
  }

  .weather-bg-img {
    opacity: 0.18;
  }

  .topics-card {
    background: #252542;
    border-color: rgba(60, 60, 90, 0.6);
    box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.28);
  }

  .section-title {
    color: #E8E8F0;
  }

  .topic-title {
    color: #D0D0E0;
  }

  .rank-num {
    color: #666688;
  }

  .views-count {
    color: #666688;
  }

  .topic-item {
    border-bottom-color: #333350;
  }

  .source-pill {
    background: #2D2D4A;
    border-color: #4D3D58;
  }

  .source-dropdown {
    background: #252542;
    border-color: #3D3D60;
    box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.35);
  }

  .source-option-text {
    color: #C0C0D8;
  }

  .source-option--active {
    background: #2A2A45;
  }
}
</style>
