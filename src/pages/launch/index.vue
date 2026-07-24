<template>
  <view class="launch-page" />
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { TABBAR_DEVELOPING_URL, TABBAR_OPEN_CONFIG } from '@/config/tabbar'

onLoad(() => {
  uni.reLaunch({
    url: TABBAR_OPEN_CONFIG.home ? '/subpackage/home/index' : `${TABBAR_DEVELOPING_URL}?tab=home`,
  })
})
</script>

<style lang="scss" scoped>
.launch-page {
  min-height: 100vh;
  background: #5ac7f0;
}
</style>
