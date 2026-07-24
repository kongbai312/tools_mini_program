/** 农田开垦等级 */
export interface FarmlandLevel {
  name: string
  cost: number
  exp: number
  unlockLevel: number
  yieldBonusPercent: number | null
}

function wan(n: number) {
  return n * 10000
}

function yi(n: number) {
  return n * 100000000
}

export const FARMLAND_LEVELS: FarmlandLevel[] = [
  { name: '第4块', cost: 10, exp: 20, unlockLevel: 2, yieldBonusPercent: null },
  { name: '第5块', cost: 100, exp: 50, unlockLevel: 4, yieldBonusPercent: null },
  { name: '第6块', cost: 1000, exp: 160, unlockLevel: 6, yieldBonusPercent: null },
  { name: '第7块', cost: 8000, exp: 500, unlockLevel: 8, yieldBonusPercent: null },
  { name: '第8块', cost: wan(1.6), exp: 1000, unlockLevel: 10, yieldBonusPercent: null },
  { name: '第9块', cost: wan(7.8), exp: 3000, unlockLevel: 12, yieldBonusPercent: null },
  { name: '第10块', cost: wan(13), exp: 6000, unlockLevel: 14, yieldBonusPercent: null },
  { name: '第11块', cost: wan(19), exp: 9000, unlockLevel: 16, yieldBonusPercent: null },
  { name: '第12块', cost: wan(27), exp: wan(1.2), unlockLevel: 18, yieldBonusPercent: null },
  { name: '第13块', cost: wan(39), exp: wan(1.5), unlockLevel: 20, yieldBonusPercent: null },
  { name: '第14块', cost: wan(53), exp: wan(1.8), unlockLevel: 22, yieldBonusPercent: null },
  { name: '第15块', cost: wan(70), exp: wan(2.1), unlockLevel: 24, yieldBonusPercent: null },
  { name: '第16块', cost: wan(90), exp: wan(2.5), unlockLevel: 26, yieldBonusPercent: null },
  { name: '第17块', cost: wan(125), exp: wan(3), unlockLevel: 28, yieldBonusPercent: null },
  { name: '第18块', cost: wan(175), exp: wan(3.7), unlockLevel: 30, yieldBonusPercent: null },
  { name: '第19块', cost: wan(239), exp: wan(4.5), unlockLevel: 32, yieldBonusPercent: null },
  { name: '第20块', cost: wan(317), exp: wan(5.6), unlockLevel: 34, yieldBonusPercent: null },
  { name: '第21块', cost: wan(410), exp: wan(6.7), unlockLevel: 36, yieldBonusPercent: null },
  { name: '第22块', cost: wan(523), exp: wan(7.8), unlockLevel: 38, yieldBonusPercent: null },
  { name: '第23块', cost: wan(648), exp: wan(8.9), unlockLevel: 40, yieldBonusPercent: null },
  { name: '第24块', cost: wan(766), exp: wan(10), unlockLevel: 42, yieldBonusPercent: null },
  { name: '二级地1', cost: wan(868), exp: wan(12), unlockLevel: 44, yieldBonusPercent: 50 },
  { name: '二级地2', cost: wan(1010), exp: wan(12.2), unlockLevel: 46, yieldBonusPercent: 50 },
  { name: '二级地3', cost: wan(1146), exp: wan(13.3), unlockLevel: 48, yieldBonusPercent: 50 },
  { name: '二级地4', cost: wan(1307), exp: wan(14.4), unlockLevel: 50, yieldBonusPercent: 50 },
  { name: '二级地5', cost: wan(1486), exp: wan(15.5), unlockLevel: 52, yieldBonusPercent: 50 },
  { name: '二级地6', cost: wan(1674), exp: wan(16.6), unlockLevel: 54, yieldBonusPercent: 50 },
  { name: '二级地7', cost: wan(2117), exp: wan(17.7), unlockLevel: 56, yieldBonusPercent: 50 },
  { name: '二级地8', cost: wan(2671), exp: wan(18.8), unlockLevel: 58, yieldBonusPercent: 50 },
  { name: '二级地9', cost: wan(3385), exp: wan(20), unlockLevel: 60, yieldBonusPercent: 50 },
  { name: '二级地10', cost: wan(4327), exp: wan(24), unlockLevel: 62, yieldBonusPercent: 50 },
  { name: '二级地11', cost: wan(6449), exp: wan(28), unlockLevel: 64, yieldBonusPercent: 50 },
  { name: '二级地12', cost: wan(8452), exp: wan(32), unlockLevel: 66, yieldBonusPercent: 50 },
  { name: '二级地13', cost: yi(1.07), exp: wan(36), unlockLevel: 68, yieldBonusPercent: 50 },
  { name: '二级地14', cost: yi(1.36), exp: wan(40), unlockLevel: 70, yieldBonusPercent: 50 },
  { name: '二级地15', cost: yi(1.94), exp: wan(58), unlockLevel: 73, yieldBonusPercent: 50 },
  { name: '二级地16', cost: yi(3.4), exp: wan(76), unlockLevel: 76, yieldBonusPercent: 50 },
  { name: '二级地17', cost: yi(6.3), exp: wan(94), unlockLevel: 79, yieldBonusPercent: 50 },
  { name: '二级地18', cost: yi(8.83), exp: wan(110), unlockLevel: 82, yieldBonusPercent: 50 },
  { name: '二级地19', cost: yi(12.37), exp: wan(130), unlockLevel: 85, yieldBonusPercent: 50 },
]
