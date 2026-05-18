---
name: tools-mini-program-token-efficient-dev
description: Use when the user explicitly names this skill while developing or inspecting this uni-app Vue toolbox mini-program project, especially when they want reduced token usage, minimal file reads, or less repeated project exploration.
disable-model-invocation: true
---

# 工具箱小程序低 Token 开发

## 核心原则

使用最小必要上下文。先按下面的项目地图定位文件，只读取和当前需求直接相关的文件；只有地图无法判断影响范围时，才使用搜索。

## 项目速览

- 技术栈：`uni-app`、Vue 3、TypeScript、Pinia、SCSS、`uview-plus`。
- 入口：`src/main.ts` 注册 Pinia 和 `uview-plus`；`src/App.vue` 引入全局 `uview-plus/index.scss`。
- 应用配置：`src/pages.json`；应用清单：`src/manifest.json`；路径别名：`@/*` -> `src/*`。
- 页面：
  - 首页：`src/pages/home/index.vue`，天气卡片和今日热点。
  - 发现：`src/pages/discovery/index.vue`，搜索、分类、文章 tab。
  - 工具箱：`src/pages/toolbox/index.vue`，最近使用、游戏类、日常类工具。
  - 我的：`src/pages/profile/index.vue`，用户、会员、主题、缓存 UI。
- 共享组件：`src/components/TabBar/index.vue`。
- 状态：
  - `src/store/weather.ts`：天气数据和热搜来源。
  - `src/store/tools.ts`：工具列表、发现分类、文章、发现页 active tab。
  - `src/store/user.ts`：用户资料、主题、缓存状态。
- 静态资源：`src/static/imgs/` 放页面角色和背景图；`src/static/tabs/` 放底部 tab 图标。

## 最小读取计划

先根据任务选择最小文件集，不要一上来全项目搜索：

| 任务 | 优先读取 |
| --- | --- |
| 新增或修改页面 | 目标 `src/pages/<page>/index.vue`；只有路由或页面配置变化时再读 `src/pages.json` |
| 修改底部 tab | `src/components/TabBar/index.vue` 和 `src/pages.json` |
| 修改首页天气或热点 | `src/pages/home/index.vue` 和 `src/store/weather.ts` |
| 修改工具箱或发现页数据 | `src/pages/toolbox/index.vue` 或 `src/pages/discovery/index.vue`，再读 `src/store/tools.ts` |
| 修改我的页或用户行为 | `src/pages/profile/index.vue` 和 `src/store/user.ts` |
| 修改全局初始化 | `src/main.ts`、`src/App.vue`、`vite.config.ts`、`tsconfig.json` |
| 修改图片或图标 | 先看 `src/static/imgs/` 或 `src/static/tabs/` 的调用位置；非必要不读取大型图片内容 |

只在符号未知或需要确认跨文件影响时使用 `rg`。不要扫描 `node_modules`、`dist` 或大型图片文件。

## 本项目约定

- Vue 文件使用 `<script setup lang="ts">` 和 `<style lang="scss" scoped>`。
- 优先使用 `view`、`text`、`image`、`scroll-view` 与 uni API，不要随意引入浏览器专属 DOM API。
- 交互使用 `@tap`；平台能力使用 `uni.showToast`、`uni.switchTab`、`uni.getSystemInfoSync` 等。
- 移动端布局使用 `rpx`；已有状态栏、安全区处理时要保留。
- UI 风格保持轻量、可爱、卡片化：渐变、圆角、浅阴影、emoji 点缀、页面主题色。
- 多个区域共享的页面状态放到 Pinia store；一次性点击逻辑留在页面内。
- 新增 tab 页面时，同时更新 `src/pages.json` 和 `src/components/TabBar/index.vue`。
- 模板里的静态资源路径使用 `/static/...`。

## 编辑策略

1. 先说明本次准备读取或编辑哪些文件。
2. 只读取选中的最小文件集。
3. 按现有模式做最小改动。
4. 避免无关重构、格式化噪音、依赖升级和生成物变更。
5. 编辑后运行最便宜的相关检查：
   - TS/Vue 类型相关改动：`npm run type-check`。
   - 路由、页面配置或构建敏感改动：必要时运行 `npm run build:h5`。
   - 纯资源或文案改动：通常不需要命令，检查变更路径即可。

## 常见坑

- 不要在 uni 页面里随意加入原生 HTML 元素。
- 不要假设项目使用普通 Vue Router；页面和导航由 `pages.json` 与 uni API 管理。
- 不要修改 `node_modules` 或 `dist`。
- 不要为了理解设计去读取完整 `.png` 或超长单行 SVG 内容；先看文件名和调用位置。
- 不要因为项目小就自动做大范围探索。这个 skill 的目的就是避免重复重新认识项目。
