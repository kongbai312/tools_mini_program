# Income Bookkeeping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a standalone income bookkeeping module under 时光序 that records income entries, syncs them to WeChat cloud storage through a cloud function, and shows daily, monthly, and yearly income totals.

**Architecture:** Keep calculation logic in a small pure utility module, persist records in a dedicated Pinia store, and use one `income` cloud function as the write/read gateway to the cloud database. The page should stay thin: it handles form state and binds to store getters for summary cards and record lists.

**Tech Stack:** Vue 3, TypeScript, Pinia, uni-app, 微信云开发 (`wx.cloud`), `wx-server-sdk`

---

### Task 1: Income core logic and failing test

**Files:**
- Create: `tests/incomeCore.test.ts`
- Create: `src/utils/incomeCore.ts`

- [ ] **Step 1: Write the failing test**

```ts
import {
  buildIncomeSummary,
  createIncomeRecord,
  normalizeIncomeAmount,
  sortIncomeRecords,
  validateIncomeRecordInput,
} from '../src/utils/incomeCore'
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsc tests/incomeCore.test.ts --module commonjs --target es2019 --moduleResolution node --esModuleInterop --skipLibCheck --outDir C:\\tmp\\tools-income-test`
Expected: FAIL because `src/utils/incomeCore` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export interface IncomeRecord { id: string; amount: number; date: string; source: string; remark: string; createdAt: number }
export function normalizeIncomeAmount(value: string): number {}
export function validateIncomeRecordInput(amount: string, date: string, source: string): string | null {}
export function createIncomeRecord(input: { amount: number; date: string; source: string; remark: string; now?: number }): IncomeRecord {}
export function sortIncomeRecords(records: IncomeRecord[]): IncomeRecord[] {}
export function buildIncomeSummary(records: IncomeRecord[], today: string): { day: number; month: number; year: number; total: number } {}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsc tests/incomeCore.test.ts --module commonjs --target es2019 --moduleResolution node --esModuleInterop --skipLibCheck --outDir C:\\tmp\\tools-income-test && node C:\\tmp\\tools-income-test\\tests\\incomeCore.test.js`
Expected: PASS with `income core tests passed`.

### Task 2: Cloud sync gateway

**Files:**
- Modify: `src/config/cloud.ts`
- Create: `src/services/incomeCloud.ts`
- Create: `cloudfunctions/income/index.js`

- [ ] **Step 1: Add the cloud collection name and client wrapper**

```ts
export const CLOUD_COLLECTIONS = {
  shiguangxuTodos: 'sgx_todos',
  scoreRooms: 'score_rooms',
  scoreRoomMembers: 'score_room_members',
  incomeRecords: 'sgx_income_records',
} as const
```

```ts
export async function fetchIncomeCloudSnapshot(): Promise<IncomeCloudSnapshot | null> {}
export async function saveIncomeCloudSnapshot(records: IncomeRecord[], updatedAt = Date.now()): Promise<boolean> {}
```

- [ ] **Step 2: Add the failing cloud-function gateway**

```js
function ok(data) { return { ok: true, data } }
function fail(message) { return { ok: false, message } }
module.exports.main = async (event, context) => {}
```

- [ ] **Step 3: Implement cloud function fetch/save against `sgx_income_records`**

```js
if (action === 'fetch') { /* query by _openid and return normalized snapshot */ }
if (action === 'save') { /* upsert current user's snapshot */ }
```

- [ ] **Step 4: Smoke-check the module shape**

Run: `node -e "require('./cloudfunctions/income/index.js')"`
Expected: no syntax error.

### Task 3: Income store

**Files:**
- Create: `src/store/income.ts`

- [ ] **Step 1: Add local state, summary getters, and cloud sync actions**

```ts
export const useIncomeStore = defineStore('income', {
  state: () => ({ records: [], cloudUpdatedAt: 0, loading: false, saving: false }),
  getters: { todaySummary(), monthSummary(), yearSummary(), totalSummary() },
  actions: { addRecord(), removeRecord(), syncFromCloud(), syncToCloud() }
})
```

- [ ] **Step 2: Persist to local storage and use cloud snapshot sync**

```ts
saveJson('income_records', this.records)
saveJson('income_cloud_updated_at', updatedAt)
```

- [ ] **Step 3: Verify the store compiles**

Run: `npm run type-check`
Expected: no new type errors from the income store.

### Task 4: Income page and entry point

**Files:**
- Create: `src/subpackage/toolbox/shiguangxu/income/index.vue`
- Modify: `src/subpackage/toolbox/shiguangxu/assets.ts`
- Modify: `src/pages.json`
- Add: `src/subpackage/toolbox/static/imgs/tools_sgx_jizhang.svg`

- [ ] **Step 1: Add the lifecycle module card and icon**

```ts
{
  id: 'income',
  name: '收入记账',
  desc: '日月年收入统计',
  icon: SGX_ICON.income,
  bgColor: '#FDE68A',
  path: '/subpackage/toolbox/shiguangxu/income/index',
  group: 'life',
}
```

- [ ] **Step 2: Register the page route**

```json
{
  "path": "shiguangxu/income/index",
  "style": {
    "navigationStyle": "custom",
    "backgroundColor": "#FFF7E6"
  }
}
```

- [ ] **Step 3: Build the income page**

```vue
<PageHeader title="收入记账" />
<!-- summary cards + add form + record list -->
```

- [ ] **Step 4: Run a narrow verification**

Run: `npm run type-check`
Expected: passes after route and page wiring.

### Task 5: Final verification

**Files:**
- All files above

- [ ] **Step 1: Run the focused test again**

Run: `npx tsc tests/incomeCore.test.ts --module commonjs --target es2019 --moduleResolution node --esModuleInterop --skipLibCheck --outDir C:\\tmp\\tools-income-test && node C:\\tmp\\tools-income-test\\tests\\incomeCore.test.js`

- [ ] **Step 2: Run type-check**

Run: `npm run type-check`

- [ ] **Step 3: Summarize the implemented surface**

Confirm the new module card, page, cloud sync path, and daily/monthly/yearly totals all work together.
