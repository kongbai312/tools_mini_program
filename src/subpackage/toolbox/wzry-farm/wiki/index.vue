<template>
  <view class="wiki-page" :class="{ 'wiki-page--dark': userStore.isDark }">
    <PageHeader title="数据百科" tone="soft" />

    <scroll-view class="cat-scroll" scroll-x :show-scrollbar="false">
      <view class="cat-row">
        <view
          v-for="cat in categories"
          :key="cat.id"
          class="cat-chip"
          :class="{ 'cat-chip--active': activeCat === cat.id }"
          @tap="activeCat = cat.id"
        >
          <image class="cat-icon" :src="cat.icon" mode="aspectFit" />
          <text class="cat-label">{{ cat.label }}</text>
        </view>
      </view>
    </scroll-view>

    <template v-if="isTableCat">
      <view v-if="tableHeaderLocked" class="wiki-table-body wiki-table-body--locked">
        <view class="panel panel--table">
          <view v-if="activeTableTip" class="tip-card tip-card--compact">
            <text class="tip-text">{{ activeTableTip }}</text>
          </view>
          <input
            v-if="activeCat === 'crops'"
            v-model="cropKeyword"
            class="search-input"
            placeholder="搜索作物名称 / 等级"
            placeholder-style="color:#9CA3AF"
          />
          <input
            v-else-if="activeCat === 'cultivation'"
            v-model="cultiKeyword"
            class="search-input"
            placeholder="搜索作物名称"
            placeholder-style="color:#9CA3AF"
          />
          <WikiFreezeTable
            v-model:lock-header="tableHeaderLocked"
            :body-height-adjust="activeTableBodyHeightAdjust"
            :columns="activeTableColumns"
            :rows="activeTableRows"
            :row-key-field="activeTableRowKeyField"
            :freeze-col-count="activeTableFreezeColCount"
            :theme="activeTableTheme"
          />
        </view>
      </view>

      <scroll-view
        v-else
        class="wiki-table-body"
        scroll-y
        :enable-flex="true"
        :show-scrollbar="false"
      >
        <view class="panel panel--table">
          <view v-if="activeTableTip" class="tip-card tip-card--compact">
            <text class="tip-text">{{ activeTableTip }}</text>
          </view>
          <input
            v-if="activeCat === 'crops'"
            v-model="cropKeyword"
            class="search-input"
            placeholder="搜索作物名称 / 等级"
            placeholder-style="color:#9CA3AF"
          />
          <input
            v-else-if="activeCat === 'cultivation'"
            v-model="cultiKeyword"
            class="search-input"
            placeholder="搜索作物名称"
            placeholder-style="color:#9CA3AF"
          />
          <WikiFreezeTable
            v-model:lock-header="tableHeaderLocked"
            :body-height-adjust="activeTableBodyHeightAdjust"
            :columns="activeTableColumns"
            :rows="activeTableRows"
            :row-key-field="activeTableRowKeyField"
            :freeze-col-count="activeTableFreezeColCount"
            :theme="activeTableTheme"
          />
        </view>
        <view style="height: 48rpx;" />
      </scroll-view>
    </template>

    <scroll-view v-else class="wiki-scroll" scroll-y>
      <view class="panel">
        <view class="tip-card">
          <text class="tip-text">{{ farmLevelTip }}</text>
        </view>
        <input
          v-model="levelKeyword"
          class="search-input"
          placeholder="搜索等级 / 解锁内容"
          placeholder-style="color:#9CA3AF"
        />
        <view
          v-for="row in filteredFarmLevels"
          :key="row.level"
          class="level-card"
          @tap="toggleLevel(row.level)"
        >
          <view class="level-head">
            <text class="level-num">Lv.{{ row.level }}</text>
            <text v-if="row.goldCost != null" class="level-gold">{{ formatFarmNum(row.goldCost) }} 币</text>
          </view>
          <text class="level-exp">
            升级经验 {{ formatFarmNum(row.expRequired) }}
            <text v-if="row.totalExp"> · 累计 {{ formatFarmNum(row.totalExp) }}</text>
          </text>
          <text class="level-unlock" :class="{ 'level-unlock--open': expandedLevel === row.level }">
            {{ row.unlocks }}
          </text>
        </view>
      </view>

      <view style="height: 48rpx;" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import PageHeader from '../../shiguangxu/components/PageHeader.vue'
import { filterCrops } from '../data/crops'
import { CULTIVATION_ROWS, CULTIVATION_TIP } from '../data/cultivation'
import WikiFreezeTable, { type WikiTableColumn } from '../components/WikiFreezeTable.vue'
import { STALL_LEVELS } from '../data/stallLevels'
import { FARMLAND_LEVELS } from '../data/farmlandLevels'
import { LEVEL_REWARDS, REWARD_TIP } from '../data/rewards'
import { FARM_LEVELS, FARM_LEVEL_TIP } from '../data/farmLevels'
import { formatFarmNum } from '../data/formatNum'

const userStore = useUserStore()

type CatId = 'crops' | 'cultivation' | 'stall' | 'farmland' | 'farmLevel' | 'rewards'

const categories: { id: CatId; label: string; icon: string }[] = [
  { id: 'crops', label: '作物', icon: '/static/imgs/wzry-farm-cat-crops.svg' },
  { id: 'cultivation', label: '培育度', icon: '/static/imgs/wzry-farm-cat-cultivation.svg' },
  { id: 'stall', label: '小摊', icon: '/static/imgs/wzry-farm-cat-stall.svg' },
  { id: 'farmland', label: '农田', icon: '/static/imgs/wzry-farm-cat-farmland.svg' },
  { id: 'farmLevel', label: '农场等级', icon: '/static/imgs/wzry-farm-cat-farm-level.svg' },
  { id: 'rewards', label: '奖励', icon: '/static/imgs/wzry-farm-cat-rewards.svg' },
]

const activeCat = ref<CatId>('crops')
const cropKeyword = ref('')
const cultiKeyword = ref('')
const tableHeaderLocked = ref(true)

const isTableCat = computed(() => activeCat.value !== 'farmLevel')

const cultivationTip = CULTIVATION_TIP
const rewardTip = REWARD_TIP
const farmLevelTip = FARM_LEVEL_TIP
const stallTip = '提升小摊等级可显著提高所有作物出售价格'
const farmlandTip = '农田升级提高产量和收益；二级土地统一 +50% 产量'
const levelKeyword = ref('')
const expandedLevel = ref<number | null>(null)

const filteredCrops = computed(() => filterCrops(cropKeyword.value, 'all'))

const extraCropRows = [
  {
    id: 'taro_wiki',
    unlockLevel: '不限制',
    name: '芋头',
    yield: '—',
    totalPrice: '—',
    exp: '—',
    pricePerHour: '—',
    expPerHour: '—',
    unitPrice: '—',
    growTime: '—',
    fullCultivation: '—',
    mutateLimit: '—',
  },
]

const cropColumns: WikiTableColumn[] = [
  { key: 'unlockLevel', label: '等级', width: 72 },
  {
    key: 'name',
    label: '作物',
    width: 128,
    cellClass: (r) => (r.goldCrop ? 'cell--gold' : ''),
    format: (r) => String(r.name ?? ''),
  },
  { key: 'yield', label: '产量', width: 88 },
  { key: 'totalPrice', label: '售价', width: 100 },
  { key: 'exp', label: '经验', width: 88 },
  { key: 'pricePerHour', label: '售价/h', width: 100 },
  { key: 'expPerHour', label: '经验/h', width: 100 },
  { key: 'unitPrice', label: '单价', width: 88 },
  { key: 'growTime', label: '生长时间', width: 108 },
  { key: 'fullCultivation', label: '满培育', width: 88 },
  { key: 'mutateLimit', label: '变异上限', width: 96 },
]

const cropTableRows = computed<Record<string, unknown>[]>(() =>
  [
    ...filteredCrops.value.map((c) => ({
      id: c.id,
      unlockLevel: c.unlockLevel,
      name: c.name,
      goldCrop: c.goldCrop,
      yield: c.yield,
      totalPrice: c.totalPrice,
      exp: c.exp,
      pricePerHour: c.pricePerHour,
      expPerHour: c.expPerHour,
      unitPrice: c.unitPrice,
      growTime: c.growTime,
      fullCultivation: c.fullCultivation,
      mutateLimit: c.mutateLimit,
    })),
    ...extraCropRows.filter((r) => {
      const q = cropKeyword.value.trim()
      return !q || r.name.includes(q) || r.unlockLevel.includes(q)
    }),
  ],
)

const cultiColumns = computed<WikiTableColumn[]>(() => {
  const cols: WikiTableColumn[] = [
    {
      key: 'name',
      label: '作物',
      width: 128,
      cellClass: (r) => rarityClass(r.rarity as string | undefined),
    },
    { key: 'total', label: '合计', width: 80, cellClass: () => 'cell--accent' },
  ]
  for (let i = 0; i < 9; i++) {
    const idx = i
    cols.push({
      key: `lv${i + 1}`,
      label: `${i + 2}级`,
      width: 72,
      format: (r) => {
        const levels = (r.levels ?? []) as (number | null)[]
        const v = levels[idx]
        return v ?? '—'
      },
    })
  }
  return cols
})

const cultiTableRows = computed(() => {
  const q = cultiKeyword.value.trim()
  const list = q
    ? CULTIVATION_ROWS.filter((r) => r.name.includes(q))
    : CULTIVATION_ROWS
  return list.map((r) => ({
    id: r.name,
    name: r.name,
    total: r.total,
    rarity: r.rarity,
    levels: [...r.levels],
  }))
})

const stallColumns: WikiTableColumn[] = [
  { key: 'levelText', label: '等级', width: 96 },
  { key: 'upgradeCostText', label: '升级费用', width: 184 },
  { key: 'rewardExpText', label: '奖励经验', width: 184 },
  { key: 'unlockLevel', label: '解锁', width: 112 },
  { key: 'priceBonusText', label: '售价', width: 128, cellClass: () => 'cell--accent' },
]

const stallTableRows = computed<Record<string, unknown>[]>(() =>
  STALL_LEVELS.map((r) => ({
    level: r.level,
    levelText: `Lv.${r.level}`,
    upgradeCostText: formatFarmNum(r.upgradeCost),
    rewardExpText: formatFarmNum(r.rewardExp),
    unlockLevel: r.unlockLevel,
    priceBonusText: `+${r.priceBonusPercent}%`,
  })),
)

const farmlandColumns: WikiTableColumn[] = [
  {
    key: 'name',
    label: '农田',
    width: 152,
    rowClass: (r) => (r.yieldBonusPercent ? 'tr--tier2' : ''),
  },
  { key: 'costText', label: '开垦费用', width: 184 },
  { key: 'expText', label: '经验', width: 152 },
  { key: 'unlockLevel', label: '解锁', width: 104 },
  { key: 'yieldBonusText', label: '产量', width: 112, cellClass: () => 'cell--accent' },
]

const farmlandTableRows = computed<Record<string, unknown>[]>(() =>
  FARMLAND_LEVELS.map((r) => ({
    name: r.name,
    costText: formatFarmNum(r.cost),
    expText: formatFarmNum(r.exp),
    unlockLevel: r.unlockLevel,
    yieldBonusPercent: r.yieldBonusPercent,
    yieldBonusText: r.yieldBonusPercent ? `+${r.yieldBonusPercent}%` : '—',
  })),
)

const rewardColumns: WikiTableColumn[] = [
  { key: 'label', label: '等级', width: 184 },
  { key: 'goldText', label: '金币奖励', width: 260, cellClass: () => 'cell--gold' },
  { key: 'expText', label: '经验奖励', width: 260 },
]

const rewardTableRows = computed<Record<string, unknown>[]>(() =>
  LEVEL_REWARDS.map((r) => ({
    label: r.label,
    goldText: formatFarmNum(r.gold),
    expText: formatFarmNum(r.exp),
  })),
)

const activeTableColumns = computed<WikiTableColumn[]>(() => {
  if (activeCat.value === 'cultivation') return cultiColumns.value
  if (activeCat.value === 'stall') return stallColumns
  if (activeCat.value === 'farmland') return farmlandColumns
  if (activeCat.value === 'rewards') return rewardColumns
  return cropColumns
})

const activeTableRows = computed<Record<string, unknown>[]>(() => {
  if (activeCat.value === 'cultivation') return cultiTableRows.value
  if (activeCat.value === 'stall') return stallTableRows.value
  if (activeCat.value === 'farmland') return farmlandTableRows.value
  if (activeCat.value === 'rewards') return rewardTableRows.value
  return cropTableRows.value
})

const activeTableTip = computed(() => {
  if (activeCat.value === 'cultivation') return cultivationTip
  if (activeCat.value === 'stall') return stallTip
  if (activeCat.value === 'farmland') return farmlandTip
  if (activeCat.value === 'rewards') return rewardTip
  return ''
})

const activeTableRowKeyField = computed(() => {
  if (activeCat.value === 'stall') return 'level'
  if (activeCat.value === 'farmland') return 'name'
  if (activeCat.value === 'rewards') return 'label'
  return 'id'
})

const activeTableFreezeColCount = computed(() =>
  activeCat.value === 'crops' || activeCat.value === 'cultivation' ? 2 : 1,
)

const activeTableTheme = computed<'green' | 'purple'>(() =>
  activeCat.value === 'rewards' ? 'purple' : 'green',
)

const activeTableBodyHeightAdjust = computed(() =>
  activeCat.value === 'cultivation' ? 120 : 0,
)

const filteredFarmLevels = computed(() => {
  const q = levelKeyword.value.trim()
  if (!q) return FARM_LEVELS
  return FARM_LEVELS.filter(
    (r) =>
      String(r.level).includes(q) ||
      r.unlocks.includes(q) ||
      (r.goldCost != null && String(r.goldCost).includes(q)),
  )
})

const toggleLevel = (level: number) => {
  expandedLevel.value = expandedLevel.value === level ? null : level
}

const rarityClass = (r?: string) => {
  if (r === 'gold') return 'rarity--gold'
  if (r === 'blue') return 'rarity--blue'
  if (r === 'pink') return 'rarity--pink'
  return ''
}
</script>

<style lang="scss" scoped>
.wiki-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f6f7fb;
  overflow: hidden;
}

.cat-scroll {
  flex-shrink: 0;
  white-space: nowrap;
  padding: 8rpx 0 12rpx;
}

.cat-row {
  display: inline-flex;
  gap: 12rpx;
  padding: 0 24rpx;
}

.cat-chip {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 24rpx;
  border-radius: 999rpx;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(5, 150, 105, 0.08);
}

.cat-chip--active {
  background: linear-gradient(135deg, #059669, #10b981);
  box-shadow: 0 6rpx 20rpx rgba(5, 150, 105, 0.25);
}

.cat-icon {
  width: 34rpx;
  height: 34rpx;
  flex-shrink: 0;
}

.cat-label {
  font-size: 26rpx;
  color: #374151;
  font-weight: 600;
}

.cat-chip--active .cat-label {
  color: #fff;
}

.wiki-scroll,
.wiki-table-body {
  flex: 1;
  min-height: 0;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.wiki-table-body {
  display: flex;
  flex-direction: column;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.panel--table {
  flex: none;
  gap: 12rpx;
  padding-bottom: 16rpx;
}

.wiki-table-body--locked .panel--table {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tip-card--compact {
  flex-shrink: 0;
}

.search-input {
  height: 72rpx;
  flex-shrink: 0;
  background: #fff;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.tip-card {
  background: #ecfdf5;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  border: 1rpx solid rgba(16, 185, 129, 0.2);
}

.tip-text {
  font-size: 24rpx;
  color: #047857;
  line-height: 1.5;
}

.level-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);
}

.level-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.level-num {
  font-size: 32rpx;
  font-weight: 800;
  color: #059669;
}

.level-gold {
  font-size: 24rpx;
  color: #d97706;
  font-weight: 600;
}

.level-exp {
  display: block;
  font-size: 22rpx;
  color: #6b7280;
  margin-bottom: 10rpx;
}

.level-unlock {
  display: block;
  font-size: 24rpx;
  color: #374151;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.level-unlock--open {
  -webkit-line-clamp: unset;
  display: block;
}

.rarity--gold { color: #d97706; }
.rarity--blue { color: #2563eb; }
.rarity--pink { color: #db2777; }

.table-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);
}

.table-head {
  display: flex;
  padding: 16rpx 12rpx;
}

.table-head--green {
  background: #059669;
}

.table-head--purple {
  background: #7c3aed;
}

.th {
  flex: 1;
  font-size: 20rpx;
  color: #fff;
  text-align: center;
  font-weight: 600;
}

.th--s { flex: 0.7; }
.th--m { flex: 1.1; }
.th--l { flex: 1.2; }

.table-row {
  display: flex;
  padding: 18rpx 12rpx;
  border-bottom: 1rpx solid #f3f4f6;
}

.table-row:nth-child(even) {
  background: #fafafa;
}

.table-row--tier2 {
  background: #ecfdf5 !important;
}

.td {
  flex: 1;
  font-size: 22rpx;
  color: #374151;
  text-align: center;
}

.td--s { flex: 0.7; }
.td--m { flex: 1.1; }
.td--l { flex: 1.2; text-align: left; padding-left: 8rpx; }
.td--accent { color: #059669; font-weight: 700; }
.td--gold { color: #d97706; font-weight: 600; }

.wiki-page--dark {
  background: #12112a;

  .table-card,
  .cat-chip,
  .search-input {
    background: rgba(30, 28, 58, 0.95);
    border: 1rpx solid #2e2c50;
  }

  .crop-name,
  .culti-name,
  .td,
  .stat-v {
    color: #e0deff;
  }
}
</style>
