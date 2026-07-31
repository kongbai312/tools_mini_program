<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'

onLaunch(() => {
  // 应用启动时恢复用户选择的主题，并同步小程序导航栏颜色。
  useUserStore().initTheme()
})
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>

<style lang="scss">
@import 'uview-plus/index.scss';

page {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background-color: #F5F7FA;
  box-sizing: border-box;
}
</style>
