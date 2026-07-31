import { createSSRApp } from "vue";
import App from "./App.vue";
import uviewPlus from "uview-plus";
import { createPinia } from "pinia";
import { getWechatCloud } from "@/services/wechatCloud";

// UniApp 应用入口：集中初始化云开发、Pinia 和 uview-plus。
export function createApp() {
  // 提前初始化微信云开发，避免进入云功能页面时重复 init。
  getWechatCloud();
  const app = createSSRApp(App);
  app.use(createPinia());
  app.use(uviewPlus);
  return {
    app,
  };
}
