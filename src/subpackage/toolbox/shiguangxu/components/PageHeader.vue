<template>
  <view class="sgx-header" :class="`sgx-header--${tone}`">
    <view class="status-placeholder" :style="{ height: layout.navBarHeight + 'px' }" />
    <view class="header-bar">
      <view class="header-back" :style="{ left: padLeft + 'px' }">
        <view class="back-btn" @tap="onBack">
          <text class="back-icon">‹</text>
        </view>
      </view>

      <text class="header-title">{{ title }}</text>

      <view class="header-actions" :style="{ right: padRight + 'px' }">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNavBarLayout } from '@/composables/useNavBarLayout'

withDefaults(
  defineProps<{
    title: string
    tone?: 'default' | 'soft'
  }>(),
  { tone: 'default' },
)

const emit = defineEmits<{
  back: []
}>()

const { layout } = useNavBarLayout()

const padLeft = computed(() => uni.upx2px(24))
/**
 * 标题栏在状态栏+胶囊行之下，与胶囊无水平重叠，用常规右边距即可贴右。
 * safeRightGap 仅适用于与胶囊同一行的区域（如 Tab 页大标题行）。
 */
const padRight = computed(() => uni.upx2px(16))

const onBack = () => {
  emit('back')
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.status-placeholder {
  width: 100%;
}

.header-bar {
  position: relative;
  width: 100%;
  height: 88rpx;
  box-sizing: border-box;
}

.header-back {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  align-items: center;
}

.header-actions {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.header-title {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  max-width: 40%;
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
  color: #1a1a2e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(91, 33, 182, 0.12);
}

.back-icon {
  font-size: 44rpx;
  line-height: 1;
  color: #5b21b6;
  margin-top: -4rpx;
}

.sgx-header--soft {
  background: linear-gradient(180deg, #ede9fe 0%, #f5f3ff 100%);

  .back-btn {
    width: 56rpx;
    height: 56rpx;
    background: rgba(255, 255, 255, 0.75);
    border: 1rpx solid rgba(139, 92, 246, 0.12);
    box-shadow: none;
  }

  .back-icon {
    font-size: 40rpx;
    color: #7c3aed;
  }

  .header-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #312e81;
    letter-spacing: 1rpx;
  }
}
</style>
