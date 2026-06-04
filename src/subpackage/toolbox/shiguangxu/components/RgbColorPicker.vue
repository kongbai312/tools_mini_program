<template>
  <view class="rgb-picker">
    <view class="rgb-preview" :style="{ background: displayHex }" />
    <view class="rgb-meta">
      <text class="rgb-meta-label">已选颜色</text>
      <text class="rgb-meta-hex">{{ displayHex }}</text>
    </view>
    <view class="rgb-channel">
      <view class="rgb-channel-head">
        <text class="rgb-channel-label">R</text>
        <text class="rgb-channel-num">{{ r }}</text>
      </view>
      <slider
        class="rgb-slider"
        :value="r"
        min="0"
        max="255"
        step="1"
        activeColor="#EF4444"
        backgroundColor="#FEE2E2"
        block-size="22"
        @changing="onChannel('r', $event)"
        @change="onChannel('r', $event)"
      />
    </view>
    <view class="rgb-channel">
      <view class="rgb-channel-head">
        <text class="rgb-channel-label">G</text>
        <text class="rgb-channel-num">{{ g }}</text>
      </view>
      <slider
        class="rgb-slider"
        :value="g"
        min="0"
        max="255"
        step="1"
        activeColor="#10B981"
        backgroundColor="#D1FAE5"
        block-size="22"
        @changing="onChannel('g', $event)"
        @change="onChannel('g', $event)"
      />
    </view>
    <view class="rgb-channel">
      <view class="rgb-channel-head">
        <text class="rgb-channel-label">B</text>
        <text class="rgb-channel-num">{{ b }}</text>
      </view>
      <slider
        class="rgb-slider"
        :value="b"
        min="0"
        max="255"
        step="1"
        activeColor="#3B82F6"
        backgroundColor="#DBEAFE"
        block-size="22"
        @changing="onChannel('b', $event)"
        @change="onChannel('b', $event)"
      />
    </view>
    <view class="rgb-hex-row">
      <text class="rgb-hex-label">#</text>
      <input
        class="rgb-hex-input"
        :value="hexInput"
        maxlength="6"
        placeholder="8B5CF6"
        placeholder-style="color:#B8BCC8"
        @input="onHexInput"
        @blur="onHexBlur"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { hexToRgb, rgbToHex, normalizeHex } from '@/utils/color'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

const r = ref(139)
const g = ref(92)
const b = ref(246)
const hexInput = ref('8B5CF6')

const displayHex = computed(() => rgbToHex(r.value, g.value, b.value))

function syncFromHex(hex: string) {
  const { r: nr, g: ng, b: nb } = hexToRgb(normalizeHex(hex))
  r.value = nr
  g.value = ng
  b.value = nb
  hexInput.value = normalizeHex(hex).replace('#', '')
}

function emitColor() {
  const hex = displayHex.value
  emit('update:modelValue', hex)
  hexInput.value = hex.replace('#', '')
}

function onChannel(
  key: 'r' | 'g' | 'b',
  e: { detail: { value: number } },
) {
  const v = e.detail.value
  if (key === 'r') r.value = v
  else if (key === 'g') g.value = v
  else b.value = v
  emitColor()
}

function onHexInput(e: { detail: { value: string } }) {
  const raw = e.detail.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)
  hexInput.value = raw.toUpperCase()
  if (raw.length === 6) {
    syncFromHex(`#${raw}`)
    emitColor()
  }
}

function onHexBlur() {
  if (hexInput.value.length === 6) {
    syncFromHex(`#${hexInput.value}`)
    emitColor()
    return
  }
  hexInput.value = displayHex.value.replace('#', '')
}

watch(
  () => props.modelValue,
  (hex) => {
    const next = normalizeHex(hex || '#8B5CF6')
    if (next.toUpperCase() === displayHex.value.toUpperCase()) return
    syncFromHex(next)
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
.rgb-picker {
  margin-bottom: 20rpx;
}

.rgb-preview {
  height: 96rpx;
  border-radius: 16rpx;
  border: 2rpx solid #e5e7eb;
  margin-bottom: 16rpx;
}

.rgb-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.rgb-meta-label {
  font-size: 24rpx;
  color: #9ca3af;
}

.rgb-meta-hex {
  font-size: 26rpx;
  font-weight: 700;
  color: #4b5563;
  font-family: monospace;
}

.rgb-channel {
  margin-bottom: 16rpx;
}

.rgb-channel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4rpx;
}

.rgb-channel-label {
  font-size: 26rpx;
  font-weight: 700;
  color: #374151;
}

.rgb-channel-num {
  font-size: 26rpx;
  color: #6b7280;
  font-variant-numeric: tabular-nums;
}

.rgb-slider {
  margin: 0;
}

.rgb-hex-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 8rpx;
  padding: 0 8rpx;
  height: 72rpx;
  background: #f5f3ff;
  border-radius: 12rpx;
}

.rgb-hex-label {
  font-size: 28rpx;
  font-weight: 700;
  color: #6b7280;
}

.rgb-hex-input {
  flex: 1;
  font-size: 28rpx;
  color: #1f2937;
  font-family: monospace;
}
</style>
