# 面试题工具 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cloud-backed "面试题" learning tool with a seeded front-end interview question bank, random/ordered practice, and a wrong-book view.

**Architecture:** Keep the question bank in a dedicated cloud collection and the user-specific wrong-book/progress in a separate per-user collection. The toolbox page only owns the entry point; the interview page owns practice UI and talks to a small store/service pair for data loading, progress sync, and mode switching.

**Tech Stack:** Vue 3 `<script setup>`, TypeScript, Pinia, uni-app, CloudBase `wx.cloud`, SCSS, SVG icon assets.

---

### Task 1: Cloud schema and interview data layer

**Files:**
- Modify: `src/config/cloud.ts`
- Create: `src/store/interviewSeed.ts`
- Create: `src/services/interviewCloud.ts`

- [ ] **Step 1: Write the seed question set**

```ts
export interface InterviewQuestionSeed {
  id: string
  sort: number
  title: string
  options: string[]
  answerIndex: number
  analysis: string
  tags: string[]
  imageUrl?: string
}
```

- [ ] **Step 2: Add cloud collection names**

```ts
export const CLOUD_COLLECTIONS = {
  shiguangxuTodos: 'sgx_todos',
  incomeRecords: 'sgx_income_records',
  scoreRooms: 'score_rooms',
  scoreRoomMembers: 'score_room_members',
  interviewQuestions: 'interview_questions',
  interviewProgress: 'interview_progress',
} as const
```

- [ ] **Step 3: Implement cloud fetch/save helpers**

```ts
export async function fetchInterviewQuestions(): Promise<InterviewQuestionSeed[] | null> { /* ... */ }
export async function seedInterviewQuestions(seed: InterviewQuestionSeed[]): Promise<boolean> { /* ... */ }
export async function fetchInterviewProgress(): Promise<InterviewProgress | null> { /* ... */ }
export async function saveInterviewProgress(progress: InterviewProgress): Promise<boolean> { /* ... */ }
```

### Task 2: Interview store and practice state

**Files:**
- Create: `src/store/interview.ts`

- [ ] **Step 1: Define the store state and getters**

```ts
export type PracticeMode = 'ordered' | 'random'

export interface InterviewProgress {
  wrongIds: string[]
  practiceMode: PracticeMode
  lastQuestionId: string | null
  updatedAt: number
}
```

- [ ] **Step 2: Implement initialization and sync**

```ts
async init() {
  await loadQuestions()
  await loadProgress()
  rebuildOrder()
}
```

- [ ] **Step 3: Implement practice actions**

```ts
submitAnswer(optionIndex: number): boolean
nextQuestion(): void
prevQuestion(): void
setPracticeMode(mode: PracticeMode): void
openWrongQuestion(questionId: string): void
removeFromWrongBook(questionId: string): void
```

### Task 3: Interview page UI

**Files:**
- Create: `src/subpackage/toolbox/interview/index.vue`

- [ ] **Step 1: Build the page shell**

```vue
<PageHeader title="面试题" tone="soft" />
```

- [ ] **Step 2: Add practice controls and question card**

```vue
<view class="mode-switch">
  <view @tap="store.setPracticeMode('ordered')">顺序刷题</view>
  <view @tap="store.setPracticeMode('random')">随机刷题</view>
</view>
```

- [ ] **Step 3: Add wrong-book list and question jump**

```vue
<view v-for="item in store.wrongQuestions" @tap="store.openWrongQuestion(item.id)">
  <!-- question row -->
</view>
```

### Task 4: Toolbox entry, icon, and route

**Files:**
- Create: `src/subpackage/toolbox/static/imgs/tools_learning_interview.svg`
- Modify: `src/subpackage/toolbox/assets.ts`
- Modify: `src/subpackage/toolbox/index.vue`
- Modify: `src/pages.json`

- [ ] **Step 1: Draw the SVG icon**

```svg
<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">...</svg>
```

- [ ] **Step 2: Add the tool item and section**

```ts
export const learningTools: Tool[] = [
  {
    id: 'interview',
    name: '面试题',
    icon: TOOL_ICONS.learningInterview,
    url: '/subpackage/toolbox/interview/index',
  },
]
```

- [ ] **Step 3: Register the subpackage page**

```json
{
  "path": "interview/index",
  "style": {
    "navigationStyle": "custom",
    "backgroundColor": "#F7F4EC"
  }
}
```

### Task 5: Verification

**Files:**
- None

- [ ] **Step 1: Run a focused TypeScript check**

```bash
npm run type-check
```

- [ ] **Step 2: Fix any compile or route errors**

```bash
npm run type-check
```
