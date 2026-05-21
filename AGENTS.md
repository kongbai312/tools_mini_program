# AGENTS.md

## 项目概览

本项目是一个**纯前端 UniApp 小程序项目**（工具箱类应用），主要面向微信小程序，同时支持 H5 及多平台小程序构建。

- 应用名称：工具箱
- 技术核心：Vue 3 + TypeScript + uni-app + Vite + Pinia + uview-plus
- 当前数据均为 Pinia store 内的本地 mock 数据，**无独立后端服务、无 API 请求封装、无数据库**
- 页面导航由 `src/pages.json` 与 uni API 管理，不使用 Vue Router
- 底部 Tab 为自定义实现（`src/components/TabBar/index.vue`），Tab 页位于分包，切换使用 `uni.reLaunch`
- 微信小程序已做**分包 + WebP 图片压缩**，主包约 300KB，总体积约 600KB

## 技术栈

### 前端技术栈

| 类型 | 技术 |
| --- | --- |
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 跨端框架 | uni-app 3.x |
| 构建工具 | Vite 5 + `@dcloudio/vite-plugin-uni` |
| 语言 | TypeScript 4.9 |
| 包管理器 | npm（存在 `package-lock.json`） |
| 路由 | uni-app 页面路由（`src/pages.json`，含分包） |
| 状态管理 | Pinia 3 |
| 请求库 | 无（当前无网络请求层） |
| UI 组件库 | uview-plus 3.x（easycom 自动引入） |
| 样式方案 | SCSS（scoped + 全局变量 `src/uni.scss`） |
| 国际化 | vue-i18n（已安装，当前未在入口启用） |
| 代码规范 | 无 ESLint / Prettier / Stylelint 配置 |

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm install` | 安装依赖 |
| `npm run dev:h5` | H5 本地开发 |
| `npm run dev:mp-weixin` | 微信小程序本地开发 |
| `npm run preview:mp-weixin` | 微信小程序预览构建 |
| `npm run build:h5` | H5 生产构建 |
| `npm run build:mp-weixin` | 微信小程序生产构建 |
| `npm run type-check` | TypeScript 类型检查（`vue-tsc --noEmit`） |
| `npm run compress:imgs` | 将分包内 PNG 压缩为 WebP（`scripts/compress-images.mjs`） |
| `npm run dev:mp-*` / `npm run build:mp-*` | 其他平台开发 / 构建（支付宝、百度、抖音等） |

## 目录结构

```txt
.
├── src/
│   ├── main.ts              # 应用入口，注册 Pinia、uview-plus
│   ├── App.vue              # 根组件，全局样式与生命周期
│   ├── pages.json           # 主包页面、分包、预下载、easycom 配置
│   ├── manifest.json        # 应用清单（appid、平台配置）
│   ├── uni.scss             # 全局 SCSS 变量与 uview 主题
│   ├── env.d.ts             # Vue 模块类型声明
│   ├── pages/               # 主包页面（仅启动页）
│   │   └── launch/          # 启动页，reLaunch 到首页分包
│   ├── subpackage/          # 分包目录（四个 Tab 业务页，不含 static 图片）
│   │   ├── home/            # 首页：天气卡片、今日热点
│   │   ├── discovery/       # 发现：搜索、分类、文章列表（含 assets.ts）
│   │   ├── toolbox/         # 工具箱：工具分类列表
│   │   └── profile/         # 我的：用户资料、会员、主题
│   ├── components/          # 共享组件
│   │   └── TabBar/          # 自定义底部导航
│   ├── store/               # Pinia 状态（含 mock 数据，位于主包）
│   │   ├── weather.ts       # 天气、热搜来源与榜单
│   │   ├── tools.ts         # 工具列表、发现分类、文章
│   │   └── user.ts          # 用户资料、主题、缓存
│   └── static/              # 主包静态资源（Tab 图标 + 全部页面 WebP 图片）
│       ├── imgs/            # 各页面图片（分包页面通过 import 引用）
│       └── tabs/            # 底部 Tab SVG 图标
├── scripts/
│   └── compress-images.mjs  # PNG → WebP 压缩脚本
├── vite.config.ts           # Vite 配置（uni 插件）
├── tsconfig.json            # TS 配置，路径别名 @/* -> src/*
├── index.html               # H5 入口 HTML
└── package.json
```

说明：

- `src/pages/index/index.vue` 为 uni 预设遗留页面，未注册在 `pages.json` 中，非当前业务入口
- 页面大图放在主包 `src/static/imgs/`，分包页面通过 `@/static/imgs/` import 引用

## 分包说明

| 分包 root | name | 页面 | 说明 |
| --- | --- | --- | --- |
| `subpackage/home` | home | `index` | 首页 Tab |
| `subpackage/discovery` | discovery | `index` | 发现 Tab |
| `subpackage/toolbox` | toolbox | `index` | 工具箱 Tab |
| `subpackage/profile` | profile | `index` | 我的 Tab |

- **主包**仅含 `pages/launch/index`、公共组件、store、Tab 图标
- **预下载**：启动页预载 `home`；首页预载其余三个分包（见 `pages.json` 的 `preloadRule`）
- 微信小程序单包上限 2MB；当前主包与各分包均远小于限制

## 文件阅读策略

### 修改页面 UI 或交互

优先阅读：

1. 目标页面 `src/subpackage/<name>/index.vue`
2. 页面引用的 Pinia store（`src/store/`）
3. 页面引用的共享组件（如 `TabBar`）
4. 页面专属静态资源 `src/subpackage/<name>/static/`
5. 若涉及路由或 Tab 变更，再读 `src/pages.json`

### 修改底部 Tab 导航

优先阅读：

1. `src/components/TabBar/index.vue`（`pageUrls`、`tabList`）
2. `src/pages.json` 的 `subPackages` 与 `preloadRule`

### 修改首页天气或热点

优先阅读：

1. `src/subpackage/home/index.vue`
2. `src/store/weather.ts`

### 修改工具箱或发现页数据

优先阅读：

1. `src/subpackage/toolbox/index.vue` 或 `src/subpackage/discovery/index.vue`
2. `src/store/tools.ts`

### 修改我的页或用户相关 UI

优先阅读：

1. `src/subpackage/profile/index.vue`
2. `src/store/user.ts`

### 修改全局初始化或 UI 库

优先阅读：

1. `src/main.ts`
2. `src/App.vue`
3. `src/uni.scss`
4. `vite.config.ts`、`tsconfig.json`

### 修改静态资源

优先阅读：

1. 资源引用位置（页面 import / store 字符串路径 / 组件路径）
2. 主包 `src/static/imgs/` 或 `src/static/tabs/` 目录

不要读取 `.png`、`.webp` 等二进制图片内容。

### 修改构建配置或分包

优先阅读：

1. `vite.config.ts`
2. `package.json`
3. `tsconfig.json`
4. `src/pages.json`（分包、预下载）
5. `src/manifest.json`（平台相关配置）

### 排查报错

优先阅读：

1. 报错堆栈中的文件
2. 相关页面、store、组件
3. `pages.json` 路由与分包配置
4. 依赖版本（`package.json`）

## Token 节省规则

1. 先阅读本文件，再决定是否继续读取其他文件
2. 不要全项目扫描；用搜索定位组件名、store 名、页面路径
3. 只读取与当前任务直接相关的文件
4. 不要读取 `node_modules`、`dist`、二进制图片
5. 不要重复输出完整文件内容
6. 修改代码时优先展示关键 diff
7. 简单问题直接给结论

## 代码修改原则

1. 优先最小改动，复用现有模式
2. 保持 `<script setup lang="ts">` + `<style lang="scss" scoped>` 写法
3. 不随意调整目录结构、不升级依赖、不引入不必要的新库
4. 不做与任务无关的重构或大范围格式化
5. 修改 `TabBar` 或 `pages.json` 前，确认四个 Tab 分包路径与 `pageUrls` 一致
6. 修改 store 中的 mock 数据结构时，检查所有引用该数据的页面
7. 新增大图优先放入对应分包 `static/`，避免增大主包

## 前端专项规则

### 组件规则

- 主包页面放在 `src/pages/<name>/index.vue`
- Tab 业务页放在 `src/subpackage/<name>/index.vue`
- 跨页面共享组件放在 `src/components/<Name>/index.vue`
- 使用 Vue 3 Composition API + `<script setup lang="ts">`
- uview-plus 组件通过 easycom 自动引入，前缀 `u-` / `up-`
- 模板使用 uni 组件：`view`、`text`、`image`、`scroll-view` 等
- 不要使用浏览器专属 DOM API 或原生 HTML 标签
- 交互事件使用 `@tap`，平台能力使用 `uni.*` API

### TypeScript 规则

- 路径别名：`@/*` 映射 `src/*`
- 类型定义优先放在使用的 store 或页面文件内（当前无独立 `types/` 目录）
- store 中导出 interface 供页面引用（如 `Tool`、`Article`、`WeatherInfo`）
- 修改后运行 `npm run type-check` 验证

### 样式规则

- 页面/组件样式使用 `<style lang="scss" scoped>`
- 全局变量和主题色定义在 `src/uni.scss`
- uview-plus 全局样式在 `src/App.vue` 中 `@import 'uview-plus/index.scss'`
- 布局单位使用 `rpx`；保留状态栏高度和安全区处理（`env(safe-area-inset-bottom)`）
- UI 风格：轻量、卡片化、圆角、渐变、emoji 点缀，各页面有独立主题色

### 静态资源规则

- **所有页面图片统一放在主包** `src/static/imgs/`（PNG），分包页面用 `/static/imgs/xxx.png` 字符串路径引用
- **禁止**在主包 store 中写分包 static 路径；**禁止**用 ES import 引入图片（真机可能不显示），与 Tab 图标一样用 `/static/` 绝对路径
- **发现页分类/封面图**：路径定义在 `subpackage/discovery/assets.ts`（字符串常量）
- 新增大图 PNG 后可执行 `npm run compress:imgs` 压缩

### 状态管理规则

- 使用 Pinia，`defineStore` 定义在 `src/store/` 下，按业务域拆分
- 当前三个 store：`weather`、`tools`、`user`（位于主包，各分包共享）
- 多区域共享的页面状态放 store；一次性点击逻辑可留在页面内
- 页面通过 `useXxxStore()` 引入，配合 `storeToRefs` 或直接访问

### 路由规则

- 主包页面注册在 `pages.json` 的 `pages` 数组
- Tab 业务页注册在 `pages.json` 的 `subPackages` 数组
- 无原生 `tabBar` 配置，完全依赖自定义 `TabBar` 组件
- Tab 切换：`uni.reLaunch`（分包 Tab 页之间）
- 普通页跳转：`uni.navigateTo`
- 新增 Tab 分包页需同时更新 `pages.json` 的 `subPackages` 和 `TabBar/index.vue` 的 `pageUrls`、`tabList`
- 新增非 Tab 页面优先放入对应业务分包，或新建分包

## 构建、部署与运行规则

- 本地开发：`npm run dev:mp-weixin`，用微信开发者工具打开 `dist/dev/mp-weixin`
- H5 开发：`npm run dev:h5`
- 生产构建：`npm run build:mp-weixin`，输出到 `dist/build/mp-weixin`
- 构建产物目录 `dist/` 已在 `.gitignore` 中
- 微信小程序 appid 配置在 `src/manifest.json` 的 `mp-weixin.appid`
- 无环境变量文件（`.env`），当前无 API 地址配置需求
- 体积敏感改动后运行 `npm run build:mp-weixin`，在微信开发者工具查看主包与各分包大小

## 禁止行为

1. 无关重构、擅自升级依赖、替换技术方案
2. 删除业务逻辑或动态引用代码
3. 大范围格式化无关文件
4. 编造不存在的命令、目录、API 层
5. 读取大量无关文件或二进制资源
6. 在 uni 页面中使用普通 Vue Router 或浏览器 DOM API
7. 修改 `node_modules` 或 `dist`
8. 未确认影响范围就修改公共组件、store 或 `pages.json`
9. 将大图 PNG 直接放入主包 `src/static/` 或在主包页面引用未压缩大图

## 标准任务流程

1. 阅读本文件，理解任务类型（页面 / 组件 / store / 配置 / 资源 / 分包）
2. 按文件阅读策略定位最小必要文件
3. 搜索关键词确认引用关系
4. 制定最小修改方案并实施
5. 运行 `npm run type-check`；路由或构建敏感改动运行 `npm run build:mp-weixin`
6. 总结修改点并给出验证方式

## 输出要求

1. 先给结论，再列修改点，最后给验证方式
2. 不输出无关背景，不重复粘贴完整文件
3. 涉及多文件时用列表说明每个文件的改动
4. 不确定的信息说明不确定点及验证方式

## 维护规则

以下变化时需同步更新本文件：

1. 新增页面、组件、store 或目录结构调整
2. 引入 API 请求层或后端对接
3. 构建命令、依赖或 UI 库变化
4. 路由 / Tab / 分包结构变化
5. 新增 ESLint、环境变量或部署流程
6. 代码规范或样式组织方式变化
