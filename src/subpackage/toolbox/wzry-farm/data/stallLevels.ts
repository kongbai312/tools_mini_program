/** 小摊等级 */
export interface StallLevel {
  level: number
  upgradeCost: number
  rewardExp: number
  unlockLevel: number
  priceBonusPercent: number
}

function wan(n: number) {
  return n * 10000
}

function yi(n: number) {
  return n * 100000000
}

export const STALL_LEVELS: StallLevel[] = [
  { level: 1, upgradeCost: 0, rewardExp: 0, unlockLevel: 5, priceBonusPercent: 0 },
  { level: 2, upgradeCost: 1000, rewardExp: 150, unlockLevel: 6, priceBonusPercent: 5 },
  { level: 3, upgradeCost: 3000, rewardExp: 360, unlockLevel: 7, priceBonusPercent: 10 },
  { level: 4, upgradeCost: wan(1), rewardExp: 720, unlockLevel: 9, priceBonusPercent: 15 },
  { level: 5, upgradeCost: wan(5.4), rewardExp: 1500, unlockLevel: 11, priceBonusPercent: 20 },
  { level: 6, upgradeCost: wan(11.2), rewardExp: 3000, unlockLevel: 13, priceBonusPercent: 25 },
  { level: 7, upgradeCost: wan(17.8), rewardExp: 4500, unlockLevel: 15, priceBonusPercent: 30 },
  { level: 8, upgradeCost: wan(25.6), rewardExp: 7140, unlockLevel: 17, priceBonusPercent: 35 },
  { level: 9, upgradeCost: wan(34.4), rewardExp: 9720, unlockLevel: 19, priceBonusPercent: 40 },
  { level: 10, upgradeCost: wan(44.3), rewardExp: wan(1.2), unlockLevel: 21, priceBonusPercent: 45 },
  { level: 11, upgradeCost: wan(56.2), rewardExp: wan(1.5), unlockLevel: 23, priceBonusPercent: 50 },
  { level: 12, upgradeCost: wan(69.3), rewardExp: wan(1.8), unlockLevel: 25, priceBonusPercent: 55 },
  { level: 13, upgradeCost: wan(86.1), rewardExp: wan(2.2), unlockLevel: 27, priceBonusPercent: 60 },
  { level: 14, upgradeCost: wan(114.9), rewardExp: wan(2.6), unlockLevel: 29, priceBonusPercent: 65 },
  { level: 15, upgradeCost: wan(152), rewardExp: wan(3.2), unlockLevel: 31, priceBonusPercent: 70 },
  { level: 16, upgradeCost: wan(197.7), rewardExp: wan(4), unlockLevel: 33, priceBonusPercent: 75 },
  { level: 17, upgradeCost: wan(253), rewardExp: wan(4.9), unlockLevel: 35, priceBonusPercent: 80 },
  { level: 18, upgradeCost: wan(319.6), rewardExp: wan(5.9), unlockLevel: 37, priceBonusPercent: 85 },
  { level: 19, upgradeCost: wan(399.8), rewardExp: wan(7), unlockLevel: 39, priceBonusPercent: 90 },
  { level: 20, upgradeCost: wan(478), rewardExp: wan(7.9), unlockLevel: 41, priceBonusPercent: 95 },
  { level: 21, upgradeCost: wan(551.6), rewardExp: wan(8.7), unlockLevel: 43, priceBonusPercent: 100 },
  { level: 22, upgradeCost: wan(619.4), rewardExp: wan(9.3), unlockLevel: 45, priceBonusPercent: 105 },
  { level: 23, upgradeCost: wan(699.8), rewardExp: wan(9.8), unlockLevel: 47, priceBonusPercent: 110 },
  { level: 24, upgradeCost: wan(779), rewardExp: wan(10.2), unlockLevel: 49, priceBonusPercent: 115 },
  { level: 25, upgradeCost: wan(860.4), rewardExp: wan(10.7), unlockLevel: 51, priceBonusPercent: 120 },
  { level: 26, upgradeCost: wan(994.4), rewardExp: wan(11.2), unlockLevel: 53, priceBonusPercent: 125 },
  { level: 27, upgradeCost: wan(1133), rewardExp: wan(11.8), unlockLevel: 55, priceBonusPercent: 130 },
  { level: 28, upgradeCost: wan(1352), rewardExp: wan(12.5), unlockLevel: 57, priceBonusPercent: 135 },
  { level: 29, upgradeCost: wan(1716), rewardExp: wan(13.6), unlockLevel: 59, priceBonusPercent: 140 },
  { level: 30, upgradeCost: wan(2169), rewardExp: wan(15.3), unlockLevel: 61, priceBonusPercent: 145 },
  { level: 31, upgradeCost: wan(2821), rewardExp: wan(17.6), unlockLevel: 63, priceBonusPercent: 150 },
  { level: 32, upgradeCost: wan(5642), rewardExp: wan(21), unlockLevel: 65, priceBonusPercent: 155 },
  { level: 33, upgradeCost: yi(1.01), rewardExp: wan(24.6), unlockLevel: 67, priceBonusPercent: 160 },
  { level: 34, upgradeCost: yi(1.82), rewardExp: wan(28.4), unlockLevel: 69, priceBonusPercent: 165 },
  { level: 35, upgradeCost: yi(2.92), rewardExp: wan(32.4), unlockLevel: 71, priceBonusPercent: 170 },
  { level: 36, upgradeCost: yi(4.09), rewardExp: wan(36.6), unlockLevel: 73, priceBonusPercent: 175 },
  { level: 37, upgradeCost: yi(5.52), rewardExp: wan(41), unlockLevel: 75, priceBonusPercent: 180 },
  { level: 38, upgradeCost: yi(7.18), rewardExp: wan(45.6), unlockLevel: 77, priceBonusPercent: 185 },
  { level: 39, upgradeCost: yi(8.98), rewardExp: wan(50.4), unlockLevel: 79, priceBonusPercent: 190 },
  { level: 40, upgradeCost: yi(12.13), rewardExp: wan(75), unlockLevel: 81, priceBonusPercent: 195 },
]
