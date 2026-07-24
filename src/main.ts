import { createSSRApp } from "vue";
import App from "./App.vue";
import uviewPlus from "uview-plus";
import { createPinia } from "pinia";
import { getWechatCloud } from "@/services/wechatCloud";

export function createApp() {
  getWechatCloud();
  const app = createSSRApp(App);
  app.use(createPinia());
  app.use(uviewPlus);
  return {
    app,
  };
}
