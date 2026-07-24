/** 大数字展示：万 / 亿 */
export function formatFarmNum(n: number): string {
  if (n >= 100000000) {
    const v = n / 100000000
    return `${Number.isInteger(v) ? v : v.toFixed(2).replace(/\.?0+$/, '')}亿`
  }
  if (n >= 10000) {
    const v = n / 10000
    return `${Number.isInteger(v) ? v : v.toFixed(1).replace(/\.0$/, '')}万`
  }
  return `${n}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
