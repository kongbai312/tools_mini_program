/** 农场等级（Lv1-80，图5 拆分录入） */
export interface FarmLevel {
  level: number
  /** 升级金币消耗；高等级段无此项 */
  goldCost?: number
  /** 升级所需经验 */
  expRequired: number
  /** 累计总经验（Lv40+ 有参考值） */
  totalExp?: number
  unlocks: string
}

function w(n: number) {
  return n * 10000
}

function yi(n: number) {
  return n * 100000000
}

export const FARM_LEVEL_TIP =
  '升级消耗金币与经验；解锁含农田数量、小摊上限、作物与摆件等。当前录入 Lv1-84。'

export const FARM_LEVELS: FarmLevel[] = [
  { level: 1, goldCost: 0, expRequired: 0, unlocks: '初始：基础农田与小麦' },
  { level: 2, goldCost: 12, expRequired: 5, unlocks: '可开启农田数量 3-4，解锁胡萝卜、桃源金异' },
  { level: 3, goldCost: 50, expRequired: 36, unlocks: '解锁番茄、晴岚金异' },
  { level: 4, goldCost: 100, expRequired: 80, unlocks: '可开启农田数量 4-5，解锁一锭泥水' },
  { level: 5, goldCost: 150, expRequired: 100, unlocks: '解锁蘑菇、农场小摊 0-1' },
  { level: 6, goldCost: 480, expRequired: 360, unlocks: '可开启农田数量 5-6，解锁土豆、铸铁金异' },
  { level: 7, goldCost: 2100, expRequired: 720, unlocks: '可开启农田数量 6-7，农场小摊等级上限 2-3' },
  { level: 8, goldCost: 5000, expRequired: 1100, unlocks: '解锁玉米、一钵微云' },
  { level: 9, goldCost: w(1.3), expRequired: 2200, unlocks: '农场小摊等级上限 3-4' },
  { level: 10, goldCost: w(2.5), expRequired: 3500, unlocks: '可开启农田数量 7-8，解锁草莓、冰晶宝神' },
  { level: 11, goldCost: w(4.5), expRequired: 5000, unlocks: '农场小摊等级上限 4-5' },
  { level: 12, goldCost: w(8.6), expRequired: 7500, unlocks: '可开启农田数量 8-9，解锁向日葵、一钟神仙、柳成深异、青织绕异、江大化' },
  { level: 13, goldCost: w(10.9), expRequired: 10000, unlocks: '农场小摊等级上限 5-6' },
  { level: 14, goldCost: w(13.2), expRequired: 12500, unlocks: '可开启农田数量 9-10，解锁青椒' },
  { level: 15, goldCost: w(15.4), expRequired: 15000, unlocks: '农场小摊等级上限 6-7' },
  { level: 16, goldCost: w(17.9), expRequired: 17500, unlocks: '可开启农田数量 10-11，解锁大蒜' },
  { level: 17, goldCost: w(20.4), expRequired: 20000, unlocks: '农场小摊等级上限 7-8，解锁摆件-兔守竹' },
  { level: 18, goldCost: w(23.6), expRequired: 23500, unlocks: '可开启农田数量 11-12，解锁香蕉、琥珀宝异' },
  { level: 19, goldCost: w(26.8), expRequired: 27000, unlocks: '农场小摊等级上限 8-9' },
  { level: 20, goldCost: w(30.3), expRequired: 30500, unlocks: '可开启农田数量 12-13，解锁蓝莓、琉璃/青玉/珍珠/耀金变异' },
  { level: 21, goldCost: w(33.6), expRequired: 34000, unlocks: '农场小摊等级上限 9-10，解锁小型摆件-樱时光冷水壶' },
  { level: 22, goldCost: w(37.5), expRequired: 37500, unlocks: '可开启农田数量 13-14，解锁黄瓜' },
  { level: 23, goldCost: w(41.3), expRequired: 42000, unlocks: '农场小摊等级上限 10-11' },
  { level: 24, goldCost: w(45.2), expRequired: 46500, unlocks: '可开启农田数量 14-15，解锁茄子' },
  { level: 25, goldCost: w(49.1), expRequired: 51000, unlocks: '农场小摊等级上限 11-12，解锁小型摆件-樱树神衣架' },
  { level: 26, goldCost: w(53.8), expRequired: 55500, unlocks: '可开启农田数量 15-16，解锁南瓜' },
  { level: 27, goldCost: w(59.3), expRequired: 60000, unlocks: '农场小摊等级上限 12-13' },
  { level: 28, goldCost: w(67.5), expRequired: 70000, unlocks: '可开启农田数量 16-17，解锁柚子' },
  { level: 29, goldCost: w(76.2), expRequired: 80000, unlocks: '农场小摊等级上限 13-14，解锁小型摆件-竹松伴读组合' },
  { level: 30, goldCost: w(85.9), expRequired: 90000, unlocks: '可开启农田数量 17-18，解锁卷心菜' },
  { level: 31, goldCost: w(97.5), expRequired: w(10), unlocks: '农场小摊等级上限 14-15' },
  { level: 32, goldCost: w(110), expRequired: w(11), unlocks: '可开启农田数量 18-19，解锁白萝卜' },
  { level: 33, goldCost: w(124), expRequired: w(12), unlocks: '农场小摊等级上限 15-16，解锁摆件-兔守竹' },
  { level: 34, goldCost: w(140), expRequired: w(13), unlocks: '可开启农田数量 19-20，解锁葡萄' },
  { level: 35, goldCost: w(158), expRequired: w(14), unlocks: '农场小摊等级上限 16-17' },
  { level: 36, goldCost: w(178), expRequired: w(16), unlocks: '可开启农田数量 20-21，解锁生菜' },
  { level: 37, goldCost: w(200), expRequired: w(18), unlocks: '农场小摊等级上限 17-18' },
  { level: 38, goldCost: w(227), expRequired: w(20), unlocks: '可开启农田数量 21-22，解锁西瓜' },
  { level: 39, goldCost: w(255), expRequired: w(22), unlocks: '农场小摊等级上限 18-19' },
  { level: 40, expRequired: w(24), totalExp: w(282), unlocks: '可开垦农田数量 22-23，解锁辣椒' },
  { level: 41, expRequired: w(26), totalExp: w(308), unlocks: '农场小摊等级上限 19-20' },
  { level: 42, expRequired: w(28), totalExp: w(334), unlocks: '可开垦农田数量 23-24，解锁洋葱' },
  { level: 43, expRequired: w(30), totalExp: w(360), unlocks: '农场小摊等级上限 20-21' },
  { level: 44, expRequired: w(32), totalExp: w(385), unlocks: '可升至 2 级农田数量 0-1，解锁花菜' },
  { level: 45, expRequired: w(34), totalExp: w(409), unlocks: '农场小摊等级上限 21-22，解锁摆件-龟背竹' },
  { level: 46, expRequired: w(36), totalExp: w(432), unlocks: '可升至 2 级农田数量 1-2，解锁花生' },
  { level: 47, expRequired: w(38), totalExp: w(468), unlocks: '农场小摊等级上限 22-23' },
  { level: 48, expRequired: w(40), totalExp: w(503), unlocks: '可升至 2 级农田数量 2-3，解锁木瓜' },
  { level: 49, expRequired: w(42), totalExp: w(532), unlocks: '农场小摊等级上限 23-24，解锁摆件' },
  { level: 50, expRequired: w(44), totalExp: w(561), unlocks: '可升至 2 级农田数量 3-4，解锁荞麦' },
  { level: 51, expRequired: w(46), totalExp: w(591), unlocks: '农场小摊等级上限 24-25，解锁莴笋' },
  { level: 52, expRequired: w(48), totalExp: w(638), unlocks: '可升至 2 级农田数量 4-5，解锁红枣' },
  { level: 53, expRequired: w(50), totalExp: w(685), unlocks: '农场小摊等级上限 25-26，解锁棉花、摆件' },
  { level: 54, expRequired: w(52), totalExp: w(734), unlocks: '可升至 2 级农田数量 5-6，解锁橘子' },
  { level: 55, expRequired: w(54), totalExp: w(784), unlocks: '农场小摊等级上限 26-27，解锁菠萝' },
  { level: 56, expRequired: w(56), totalExp: w(835), unlocks: '可升至 2 级农田数量 6-7，解锁四季豆' },
  { level: 57, expRequired: w(58), totalExp: w(950), unlocks: '农场小摊等级上限 27-28，解锁冬瓜' },
  { level: 58, expRequired: w(60), totalExp: w(1070), unlocks: '可升至 2 级农田数量 7-8，解锁李子' },
  { level: 59, expRequired: w(62), totalExp: w(1200), unlocks: '农场小摊等级上限 28-29，解锁杨桃' },
  { level: 60, expRequired: w(64), totalExp: w(1350), unlocks: '可升至 2 级农田数量 8-9，解锁梨子' },
  { level: 61, expRequired: w(66), totalExp: w(1520), unlocks: '农场小摊等级上限 29-30，解锁甘蔗' },
  { level: 62, expRequired: w(68), totalExp: w(1760), unlocks: '可升至 2 级农田数量 9-10，解锁葫芦' },
  { level: 63, expRequired: w(70), totalExp: w(2000), unlocks: '农场小摊等级上限 30-31，解锁桃子' },
  { level: 64, expRequired: w(72), totalExp: w(2260), unlocks: '可升至 2 级农田数量 10-11，解锁柠檬' },
  { level: 65, expRequired: w(74), totalExp: w(2540), unlocks: '农场小摊等级上限 31-32，解锁樱桃' },
  { level: 66, expRequired: w(77), totalExp: w(3000), unlocks: '可升至 2 级农田数量 11-12，解锁桑葚' },
  { level: 67, expRequired: w(81), totalExp: w(3600), unlocks: '农场小摊等级上限 32-33，解锁杏子' },
  { level: 68, expRequired: w(88), totalExp: w(4450), unlocks: '可升至 2 级农田数量 12-13，解锁哈密瓜' },
  { level: 69, expRequired: w(98), totalExp: w(5550), unlocks: '农场小摊等级上限 33-34，解锁枇杷' },
  { level: 70, expRequired: w(111), totalExp: w(6900), unlocks: '可升至 2 级农田数量 13-14，解锁灯笼果' },
  { level: 71, expRequired: w(127), totalExp: w(8500), unlocks: '农场小摊等级上限 34-35，解锁树莓' },
  { level: 72, expRequired: w(146), totalExp: yi(1.03), unlocks: '解锁芒果' },
  { level: 73, expRequired: w(165), totalExp: yi(1.24), unlocks: '农场小摊等级上限 35-36，可升至 2 级农田 14-15，解锁山竹' },
  { level: 74, expRequired: w(184), totalExp: yi(1.48), unlocks: '解锁山楂' },
  { level: 75, expRequired: w(203), totalExp: yi(1.74), unlocks: '农场小摊等级上限 36-37，解锁莲花' },
  { level: 76, expRequired: w(222), totalExp: yi(2.02), unlocks: '可升至 2 级农田数量 15-16，解锁咖啡豆' },
  { level: 77, expRequired: w(241), totalExp: yi(2.33), unlocks: '解锁火龙果' },
  { level: 78, expRequired: w(260), totalExp: yi(2.67), unlocks: '解锁石榴' },
  { level: 79, expRequired: w(279), totalExp: yi(3.03), unlocks: '解锁牛油果' },
  { level: 80, expRequired: w(298), totalExp: yi(3.41), unlocks: '解锁龙胆花' },
  { level: 81, expRequired: w(317), totalExp: yi(3.82), unlocks: '农场小摊等级上限 39-40，解锁仙人掌果' },
  { level: 82, expRequired: w(321), totalExp: yi(3.9), unlocks: '可升至2级农田数量 17-18，解锁椰子' },
  { level: 83, expRequired: w(326), totalExp: yi(4.13), unlocks: '解锁荔枝' },
  { level: 84, expRequired: w(331), totalExp: yi(4.38), unlocks: '解锁百合' },
]
