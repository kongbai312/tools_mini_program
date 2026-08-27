import {
  buildIncomeSummary,
  createIncomeRecord,
  normalizeIncomeAmount,
  sortIncomeRecords,
  validateIncomeRecordInput,
  type IncomeRecord,
} from '../src/utils/incomeCore'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const records: IncomeRecord[] = [
  createIncomeRecord({
    amount: 128.5,
    date: '2026-08-23',
    source: '工资',
    remark: '上午结算',
    now: 10,
  }),
  createIncomeRecord({
    amount: 30,
    date: '2026-08-22',
    source: '兼职',
    remark: '',
    now: 11,
  }),
  createIncomeRecord({
    amount: 900,
    date: '2026-07-30',
    source: '项目',
    remark: '',
    now: 12,
  }),
  createIncomeRecord({
    amount: 1200,
    date: '2025-08-23',
    source: '历史',
    remark: '',
    now: 13,
  }),
]

assert(records[0].id.startsWith('income_10_'), 'created record should include an income id prefix')
assert(records[0].amount === 128.5, 'created record should keep two-decimal amount precision')
assert(records[0].source === '工资', 'created record should trim and keep source text')

const summary = buildIncomeSummary(records, '2026-08-23')
assert(summary.day === 128.5, 'daily summary should include only the selected date')
assert(summary.month === 158.5, 'monthly summary should include records in the selected month')
assert(summary.year === 1058.5, 'yearly summary should include records in the selected year')
assert(summary.total === 2258.5, 'total summary should include every record')

const sorted = sortIncomeRecords(records)
assert(sorted[0].date === '2026-08-23', 'records should sort by date descending first')
assert(sorted[0].createdAt === 10, 'records on the same date should sort by created time descending')

assert(normalizeIncomeAmount('12.345') === 12.35, 'amount input should round to two decimals')
assert(normalizeIncomeAmount('abc') === 0, 'invalid amount input should normalize to zero')
assert(normalizeIncomeAmount('-3') === 0, 'negative amount input should normalize to zero')

assert(validateIncomeRecordInput('18.8', '2026-08-23', '工资') === null, 'valid input should pass')
assert(validateIncomeRecordInput('', '2026-08-23', '工资') === '请输入收入金额', 'empty amount should be rejected')
assert(validateIncomeRecordInput('0', '2026-08-23', '工资') === '收入金额需大于 0', 'zero amount should be rejected')
assert(validateIncomeRecordInput('10', '', '工资') === '请选择收入日期', 'empty date should be rejected')
assert(validateIncomeRecordInput('10', '2026/08/23', '工资') === '收入日期格式无效', 'invalid date should be rejected')
assert(validateIncomeRecordInput('10', '2026-08-23', '') === '请输入收入来源', 'empty source should be rejected')

console.log('income core tests passed')
