/**
 * 王者农场作物数据（用户提供的攻略表整理）
 * updatedAt: 2026-06-04
 */
import { getWaterBucket, matchGrowFilter, parseGrowMinutes, type GrowFilter } from './parseGrow'

export type CropDuration = 1 | 8 | 16 | 32

export interface FarmCrop {
  id: string
  name: string
  unlockLevel: number
  yield: number
  /** 单次收获总售价 */
  totalPrice: number
  exp: number
  pricePerHour: number
  expPerHour: number
  /** 单果单价（普通培育） */
  unitPrice: number
  growTime: string
  growMinutes: number
  /** 浇水规则桶；短时作物为 null */
  waterBucket: CropDuration | null
  /** 满培育所需作物数量 */
  fullCultivation: number | '-'
  mutateLimit: number
  /** 经验≈1 的高金币作物 */
  goldCrop?: boolean
  /** @deprecated 兼容旧组件 */
  durationHours: CropDuration
  basePrice: number
  maxPrice: number
  tags: string[]
  priceVerified: boolean
}

type RawCrop = Omit<FarmCrop, 'growMinutes' | 'waterBucket' | 'durationHours' | 'basePrice' | 'maxPrice' | 'tags' | 'priceVerified' | 'goldCrop'> & {
  goldCrop?: boolean
}

function build(c: RawCrop): FarmCrop {
  const growMinutes = parseGrowMinutes(c.growTime)
  const waterBucket = getWaterBucket(growMinutes)
  const durationHours = waterBucket ?? 1
  const goldCrop = c.goldCrop ?? (c.exp <= 1 && c.expPerHour <= 1)
  return {
    ...c,
    growMinutes,
    waterBucket,
    durationHours,
    basePrice: c.unitPrice,
    maxPrice: c.unitPrice * 2,
    goldCrop,
    tags: goldCrop ? ['金币'] : [],
    priceVerified: true,
  }
}

const raw: RawCrop[] = [
  { id: 'wheat', name: '小麦', unlockLevel: 1, yield: 5, totalPrice: 3, exp: 1, pricePerHour: 360, expPerHour: 120, unitPrice: 1, growTime: '30秒', fullCultivation: 1, mutateLimit: 1 },
  { id: 'carrot', name: '胡萝卜', unlockLevel: 2, yield: 5, totalPrice: 10, exp: 6, pricePerHour: 300, expPerHour: 100, unitPrice: 2, growTime: '2分钟', fullCultivation: 3, mutateLimit: 1 },
  { id: 'tomato', name: '番茄', unlockLevel: 3, yield: 5, totalPrice: 25, exp: 15, pricePerHour: 300, expPerHour: 180, unitPrice: 5, growTime: '5分钟', fullCultivation: 4, mutateLimit: 1 },
  { id: 'mushroom', name: '蘑菇', unlockLevel: 4, yield: 10, totalPrice: 140, exp: 60, pricePerHour: 420, expPerHour: 180, unitPrice: 14, growTime: '20分钟', fullCultivation: 8, mutateLimit: 1 },
  { id: 'potato', name: '土豆', unlockLevel: 6, yield: 10, totalPrice: 430, exp: 180, pricePerHour: 460, expPerHour: 180, unitPrice: 46, growTime: '1小时', fullCultivation: 10, mutateLimit: 1 },
  { id: 'corn', name: '玉米', unlockLevel: 8, yield: 10, totalPrice: 3420, exp: 1526, pricePerHour: 427.5, expPerHour: 190.8, unitPrice: 342, growTime: '8小时', fullCultivation: 7, mutateLimit: 1 },
  { id: 'strawberry', name: '草莓', unlockLevel: 10, yield: 20, totalPrice: 5880, exp: 3139, pricePerHour: 366.3, expPerHour: 196.2, unitPrice: 293, growTime: '16小时', fullCultivation: 8, mutateLimit: 1 },
  { id: 'sunflower', name: '向日葵', unlockLevel: 12, yield: 20, totalPrice: 480, exp: 202, pricePerHour: 480, expPerHour: 202, unitPrice: 24, growTime: '1小时', fullCultivation: 18, mutateLimit: 2 },
  { id: 'pepper_green', name: '青椒', unlockLevel: 14, yield: 25, totalPrice: 3525, exp: 1656, pricePerHour: 440.6, expPerHour: 207, unitPrice: 141, growTime: '8小时', fullCultivation: 16, mutateLimit: 2 },
  { id: 'garlic', name: '大蒜', unlockLevel: 16, yield: 30, totalPrice: 6030, exp: 3396, pricePerHour: 376.9, expPerHour: 212.4, unitPrice: 301, growTime: '16小时', fullCultivation: 15, mutateLimit: 2 },
  { id: 'banana', name: '香蕉', unlockLevel: 18, yield: 40, totalPrice: 19320, exp: 1, pricePerHour: 1207.5, expPerHour: 0.1, unitPrice: 483, growTime: '16小时', fullCultivation: 15, mutateLimit: 2, goldCrop: true },
  { id: 'blueberry', name: '蓝莓', unlockLevel: 20, yield: 20, totalPrice: 9000, exp: 7142, pricePerHour: 281.3, expPerHour: 223.2, unitPrice: 450, growTime: '32小时', fullCultivation: 13, mutateLimit: 3 },
  { id: 'cucumber', name: '黄瓜', unlockLevel: 22, yield: 25, totalPrice: 550, exp: 229, pricePerHour: 550, expPerHour: 229, unitPrice: 22, growTime: '1小时', fullCultivation: 180, mutateLimit: 2 },
  { id: 'eggplant', name: '茄子', unlockLevel: 24, yield: 15, totalPrice: 4110, exp: 1872, pricePerHour: 513.8, expPerHour: 234, unitPrice: 374, growTime: '8小时', fullCultivation: 78, mutateLimit: 2 },
  { id: 'pumpkin', name: '南瓜', unlockLevel: 26, yield: 10, totalPrice: 7050, exp: 3830, pricePerHour: 440.6, expPerHour: 239.4, unitPrice: 705, growTime: '16小时', fullCultivation: 52, mutateLimit: 2 },
  { id: 'peach', name: '桃子', unlockLevel: 28, yield: 25, totalPrice: 22550, exp: 1, pricePerHour: 1409.4, expPerHour: 0.1, unitPrice: 902, growTime: '16小时', fullCultivation: 52, mutateLimit: 2, goldCrop: true },
  { id: 'cabbage', name: '卷心菜', unlockLevel: 30, yield: 20, totalPrice: 10500, exp: 8006, pricePerHour: 328.1, expPerHour: 250.2, unitPrice: 525, growTime: '32小时', fullCultivation: 36, mutateLimit: 3 },
  { id: 'radish', name: '白萝卜', unlockLevel: 32, yield: 10, totalPrice: 670, exp: 256, pricePerHour: 670, expPerHour: 256, unitPrice: 67, growTime: '1小时', fullCultivation: 900, mutateLimit: 2 },
  { id: 'grape', name: '葡萄', unlockLevel: 34, yield: 30, totalPrice: 4980, exp: 2088, pricePerHour: 622.5, expPerHour: 261, unitPrice: 166, growTime: '8小时', fullCultivation: 360, mutateLimit: 2 },
  { id: 'lettuce', name: '生菜', unlockLevel: 36, yield: 20, totalPrice: 8560, exp: 4262, pricePerHour: 535, expPerHour: 266.4, unitPrice: 428, growTime: '16小时', fullCultivation: 225, mutateLimit: 2 },
  { id: 'watermelon', name: '西瓜', unlockLevel: 38, yield: 20, totalPrice: 27400, exp: 1, pricePerHour: 1712.5, expPerHour: 0.1, unitPrice: 1370, growTime: '16小时', fullCultivation: 225, mutateLimit: 2, goldCrop: true },
  { id: 'chili', name: '辣椒', unlockLevel: 40, yield: 20, totalPrice: 12760, exp: 8870, pricePerHour: 398.8, expPerHour: 277.2, unitPrice: 638, growTime: '32小时', fullCultivation: 128, mutateLimit: 3 },
  { id: 'onion', name: '洋葱', unlockLevel: 42, yield: 30, totalPrice: 780, exp: 283, pricePerHour: 780, expPerHour: 283, unitPrice: 26, growTime: '1小时', fullCultivation: 900, mutateLimit: 3 },
  { id: 'cauliflower', name: '花菜', unlockLevel: 44, yield: 15, totalPrice: 5880, exp: 2304, pricePerHour: 735, expPerHour: 288, unitPrice: 392, growTime: '8小时', fullCultivation: 360, mutateLimit: 2 },
  { id: 'kiwi', name: '猕猴桃', unlockLevel: 45, yield: 20, totalPrice: 13800, exp: 9300, pricePerHour: 431.3, expPerHour: 290.6, unitPrice: 690, growTime: '32小时', fullCultivation: 128, mutateLimit: 3 },
  { id: 'peanut', name: '花生', unlockLevel: 46, yield: 50, totalPrice: 10050, exp: 4694, pricePerHour: 628.1, expPerHour: 293.4, unitPrice: 201, growTime: '16小时', fullCultivation: 225, mutateLimit: 2 },
  { id: 'papaya', name: '木瓜', unlockLevel: 48, yield: 40, totalPrice: 32240, exp: 1, pricePerHour: 2015, expPerHour: 0.1, unitPrice: 806, growTime: '16小时', fullCultivation: 225, mutateLimit: 2, goldCrop: true },
  { id: 'melon', name: '甜瓜', unlockLevel: 50, yield: 20, totalPrice: 15000, exp: 9734, pricePerHour: 468.8, expPerHour: 304.2, unitPrice: 750, growTime: '32小时', fullCultivation: 128, mutateLimit: 3 },
  { id: 'asparagus', name: '莴笋', unlockLevel: 51, yield: 30, totalPrice: 930, exp: 310, pricePerHour: 930, expPerHour: 310, unitPrice: 31, growTime: '1小时', fullCultivation: 1206, mutateLimit: 2 },
  { id: 'red_date', name: '红枣', unlockLevel: 52, yield: 50, totalPrice: 7050, exp: 2520, pricePerHour: 881.3, expPerHour: 315, unitPrice: 141, growTime: '8小时', fullCultivation: 397, mutateLimit: 2 },
  { id: 'cotton', name: '棉花', unlockLevel: 53, yield: 40, totalPrice: 12060, exp: 5126, pricePerHour: 755, expPerHour: 320.4, unitPrice: 302, growTime: '16小时', fullCultivation: 271, mutateLimit: 2 },
  { id: 'orange', name: '橘子', unlockLevel: 54, yield: 60, totalPrice: 38540, exp: 1, pricePerHour: 2415, expPerHour: 0.1, unitPrice: 644, growTime: '16小时', fullCultivation: 256, mutateLimit: 2, goldCrop: true },
  { id: 'pineapple', name: '菠萝', unlockLevel: 55, yield: 20, totalPrice: 18000, exp: 10580, pricePerHour: 562.5, expPerHour: 331.2, unitPrice: 900, growTime: '32小时', fullCultivation: 140, mutateLimit: 3 },
  { id: 'green_bean', name: '四季豆', unlockLevel: 56, yield: 100, totalPrice: 1100, exp: 337, pricePerHour: 1100, expPerHour: 337, unitPrice: 11, growTime: '1小时', fullCultivation: 1512, mutateLimit: 2 },
  { id: 'winter_melon', name: '冬瓜', unlockLevel: 57, yield: 10, totalPrice: 8220, exp: 2738, pricePerHour: 1027.5, expPerHour: 342, unitPrice: 822, growTime: '8小时', fullCultivation: 434, mutateLimit: 2 },
  { id: 'water_chestnut', name: '荸荠', unlockLevel: 58, yield: 30, totalPrice: 14100, exp: 5558, pricePerHour: 881.3, expPerHour: 347.4, unitPrice: 470, growTime: '16小时', fullCultivation: 317, mutateLimit: 2 },
  { id: 'lychee', name: '荔枝', unlockLevel: 59, yield: 30, totalPrice: 45120, exp: 1, pricePerHour: 2820, expPerHour: 0.1, unitPrice: 1504, growTime: '16小时', fullCultivation: 287, mutateLimit: 2, goldCrop: true },
  { id: 'pear', name: '梨子', unlockLevel: 60, yield: 20, totalPrice: 21000, exp: 11462, pricePerHour: 656.3, expPerHour: 358.2, unitPrice: 1050, growTime: '32小时', fullCultivation: 170, mutateLimit: 3 },
  { id: 'sugarcane', name: '甘蔗', unlockLevel: 61, yield: 15, totalPrice: 1125, exp: 364, pricePerHour: 1125, expPerHour: 364, unitPrice: 75, growTime: '1小时', fullCultivation: 1518, mutateLimit: 3 },
  { id: 'gourd', name: '葫芦', unlockLevel: 62, yield: 20, totalPrice: 8400, exp: 2952, pricePerHour: 1050, expPerHour: 369, unitPrice: 420, growTime: '8小时', fullCultivation: 471, mutateLimit: 3 },
  { id: 'peach_hi', name: '桃子', unlockLevel: 63, yield: 50, totalPrice: 14400, exp: 5920, pricePerHour: 900, expPerHour: 374.4, unitPrice: 288, growTime: '16小时', fullCultivation: 362, mutateLimit: 3 },
  { id: 'lemon', name: '柠檬', unlockLevel: 64, yield: 40, totalPrice: 46080, exp: 1, pricePerHour: 2880, expPerHour: 0.1, unitPrice: 1152, growTime: '16小时', fullCultivation: 318, mutateLimit: 3, goldCrop: true },
  { id: 'starfruit', name: '杨桃', unlockLevel: 65, yield: 20, totalPrice: 21500, exp: 12326, pricePerHour: 675, expPerHour: 385.2, unitPrice: 1080, growTime: '32小时', fullCultivation: 191, mutateLimit: 4 },
  { id: 'mulberry', name: '桑葚', unlockLevel: 66, yield: 125, totalPrice: 1375, exp: 391, pricePerHour: 1375, expPerHour: 391, unitPrice: 11, growTime: '1小时', fullCultivation: 2124, mutateLimit: 3 },
  { id: 'apricot', name: '杏子', unlockLevel: 67, yield: 60, totalPrice: 10260, exp: 3168, pricePerHour: 1260, expPerHour: 396, unitPrice: 168, growTime: '8小时', fullCultivation: 508, mutateLimit: 3 },
  { id: 'hami', name: '哈密瓜', unlockLevel: 68, yield: 20, totalPrice: 17280, exp: 6422, pricePerHour: 1080, expPerHour: 401.4, unitPrice: 864, growTime: '16小时', fullCultivation: 405, mutateLimit: 3 },
  { id: 'persimmon', name: '柿子', unlockLevel: 69, yield: 80, totalPrice: 55280, exp: 1, pricePerHour: 3455, expPerHour: 0.1, unitPrice: 691, growTime: '16小时', fullCultivation: 340, mutateLimit: 3, goldCrop: true },
  { id: 'physalis', name: '灯笼果', unlockLevel: 70, yield: 20, totalPrice: 22160, exp: 13190, pricePerHour: 692.5, expPerHour: 412.2, unitPrice: 1108, growTime: '32小时', fullCultivation: 212, mutateLimit: 4 },
  { id: 'blueberry_hi', name: '蓝莓', unlockLevel: 71, yield: 135, totalPrice: 1620, exp: 418, pricePerHour: 1620, expPerHour: 418, unitPrice: 12, growTime: '1小时', fullCultivation: 2430, mutateLimit: 3 },
  { id: 'mango', name: '芒果', unlockLevel: 72, yield: 30, totalPrice: 11970, exp: 3384, pricePerHour: 1496.3, expPerHour: 423, unitPrice: 399, growTime: '8小时', fullCultivation: 545, mutateLimit: 3 },
  { id: 'mangosteen', name: '山竹', unlockLevel: 73, yield: 40, totalPrice: 20520, exp: 6854, pricePerHour: 1282.5, expPerHour: 428.4, unitPrice: 513, growTime: '16小时', fullCultivation: 454, mutateLimit: 3 },
  { id: 'hawthorn', name: '山楂', unlockLevel: 74, yield: 60, totalPrice: 65640, exp: 1, pricePerHour: 4102.5, expPerHour: 0.1, unitPrice: 1094, growTime: '16小时', fullCultivation: 380, mutateLimit: 3, goldCrop: true },
  { id: 'lotus', name: '莲花', unlockLevel: 75, yield: 20, totalPrice: 25720, exp: 14054, pricePerHour: 803.8, expPerHour: 439.2, unitPrice: 1286, growTime: '32小时', fullCultivation: 233, mutateLimit: 4 },
  { id: 'coffee_bean', name: '咖啡豆', unlockLevel: 76, yield: 107, totalPrice: 1926, exp: 445, pricePerHour: 1926, expPerHour: 445, unitPrice: 18, growTime: '1小时', fullCultivation: 2736, mutateLimit: 3 },
  { id: 'dragon_fruit', name: '火龙果', unlockLevel: 77, yield: 40, totalPrice: 14280, exp: 3600, pricePerHour: 1785, expPerHour: 450, unitPrice: 357, growTime: '8小时', fullCultivation: 582, mutateLimit: 3 },
  { id: 'pomegranate', name: '石榴', unlockLevel: 78, yield: 40, totalPrice: 24480, exp: 7286, pricePerHour: 1530, expPerHour: 455.4, unitPrice: 612, growTime: '16小时', fullCultivation: 501, mutateLimit: 3 },
  { id: 'avocado', name: '牛油果', unlockLevel: 79, yield: 60, totalPrice: 78360, exp: 1, pricePerHour: 4897.5, expPerHour: 0.1, unitPrice: 1306, growTime: '16小时', fullCultivation: 411, mutateLimit: 3, goldCrop: true },
  { id: 'gentian', name: '龙胆花', unlockLevel: 80, yield: 20, totalPrice: 29560, exp: 15000, pricePerHour: 923.8, expPerHour: 468.8, unitPrice: 1478, growTime: '32小时', fullCultivation: 254, mutateLimit: 4 },
  { id: 'cactus', name: '仙人掌果', unlockLevel: 81, yield: 80, totalPrice: 2160, exp: 512, pricePerHour: 2160, expPerHour: 512, unitPrice: 27, growTime: '1小时', fullCultivation: 3042, mutateLimit: 3 },
  { id: 'coconut', name: '椰子', unlockLevel: 82, yield: 40, totalPrice: 16400, exp: 4140, pricePerHour: 2050, expPerHour: 517.5, unitPrice: 410, growTime: '8小时', fullCultivation: 619, mutateLimit: 3 },
  { id: 'lychee_hi', name: '荔枝', unlockLevel: 83, yield: 40, totalPrice: 28120, exp: 8379, pricePerHour: 1757.5, expPerHour: 523.7, unitPrice: 703, growTime: '16小时', fullCultivation: 547, mutateLimit: 3 },
  { id: 'lily', name: '百合', unlockLevel: 84, yield: 80, totalPrice: 90080, exp: 1, pricePerHour: 5630, expPerHour: 0.1, unitPrice: 1126, growTime: '16小时', fullCultivation: '-', mutateLimit: 3, goldCrop: true },
]

export const FARM_CROPS: FarmCrop[] = raw.map(build).sort(
  (a, b) => a.unlockLevel - b.unlockLevel || a.name.localeCompare(b.name, 'zh-CN'),
)

export const CROP_BY_ID = Object.fromEntries(FARM_CROPS.map((c) => [c.id, c])) as Record<string, FarmCrop>

export const DURATION_LABEL: Record<CropDuration, string> = {
  1: '1 小时',
  8: '8 小时',
  16: '16 小时',
  32: '32 小时',
}

export const DURATION_OPTIONS: { value: GrowFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'short', label: '短时' },
  { value: 1, label: '1h' },
  { value: 8, label: '8h' },
  { value: 16, label: '16h' },
  { value: 32, label: '32h' },
]

export function formatCropPrice(crop: FarmCrop): string {
  return `${crop.basePrice} / ${crop.maxPrice}`
}

export function filterCrops(keyword: string, duration: GrowFilter): FarmCrop[] {
  const q = keyword.trim()
  return FARM_CROPS.filter((c) => {
    if (!matchGrowFilter(c.growMinutes, duration)) return false
    if (!q) return true
    return (
      c.name.includes(q) ||
      c.tags.some((t) => t.includes(q)) ||
      String(c.unlockLevel).includes(q) ||
      c.growTime.includes(q)
    )
  })
}
