<template>
  <view class="farm-page" :class="{ 'farm-page--dark': userStore.isDark }">
    <PageHeader title="成熟计算器" tone="soft" />

    <scroll-view class="farm-scroll" scroll-y>
      <HarvestCalc v-model:crop-id="selectedCropId" />
      <view class="section-gap" />
      <PriceCalc :crop-id="selectedCropId" />
      <view style="height: 48rpx;" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import PageHeader from '../../shiguangxu/components/PageHeader.vue'
import HarvestCalc from '../components/HarvestCalc.vue'
import PriceCalc from '../components/PriceCalc.vue'
import { FARM_CROPS } from '../data/crops'

const userStore = useUserStore()
const selectedCropId = ref(FARM_CROPS[0].id)
</script>

<style lang="scss" scoped>
.farm-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #ecfdf5 0%, #f6f7fb 100%);
}

.farm-scroll {
  flex: 1;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.section-gap {
  height: 8rpx;
}

.farm-page--dark {
  background: #12112a;
}
</style>
