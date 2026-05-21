<template>
  <view class="launch-page" />
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'

onLoad(() => {
  uni.reLaunch({ url: '/subpackage/home/index' })
})
</script>

<style lang="scss" scoped>
.launch-page {
  min-height: 100vh;
  background: #5ac7f0;
}
</style>
