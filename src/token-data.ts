// 📊 Token consumption data
// 摘要字段都是 export const, 可以用 deploy.py --edit 直接改:
//   python deploy.py --edit src/token-data.ts TOTAL_TOKENS=900000000
//
// 完整更新流程:
//   1. get_token_usage (agent 工具)
//   2. 手动更新 daily 和 byModel 数组
//   3. python deploy.py --edit ... --vercel
//
// Last updated: 2026-05-10 08:00

// == 摘要统计 (可 --edit 直接修改) ==
export const TOTAL_TOKENS = 898_362_793
export const PROMPT_TOKENS = 895_037_742
export const COMPLETION_TOKENS = 3_325_051
export const TOTAL_CALLS = 10_612
export const LAST_UPDATED = '2026-05-10 08:00'

// == 类型定义 ==
export interface DailyPoint {
  date: string
  total: number
  calls: number
  prompt: number
  completion: number
}

export interface ModelStat {
  name: string
  tokens: number
  calls: number
}

// == 每日明细 ==
export const daily: DailyPoint[] = [
  { date: '2026-05-04', total: 281_324_343, calls: 3311, prompt: 280_325_000, completion: 999_343 },
  { date: '2026-05-05', total: 139_683_565, calls: 1485, prompt: 139_189_000, completion: 494_565 },
  { date: '2026-05-06', total: 87_686_595, calls: 1050, prompt: 87_361_000, completion: 325_595 },
  { date: '2026-05-07', total: 25_621_196, calls: 336, prompt: 25_527_000, completion: 94_196 },
  { date: '2026-05-08', total: 92_931_130, calls: 1071, prompt: 92_587_000, completion: 344_130 },
  { date: '2026-05-09', total: 128_572_076, calls: 1476, prompt: 128_082_000, completion: 490_076 },
  { date: '2026-05-10', total: 36_555_566, calls: 385, prompt: 36_425_000, completion: 130_566 },
]

// == 模型分布 ==
export const byModel: ModelStat[] = [
  { name: 'DeepSeek V4 Flash', tokens: 397_582_621, calls: 5010 },
  { name: 'OpenCode Big Pickle', tokens: 497_699_573, calls: 5556 },
  { name: 'Nemotron-3 Super Free', tokens: 2_810_182, calls: 42 },
  { name: 'MiniMax M2.5 Free', tokens: 270_417, calls: 4 },
]

// == 默认导出 (兼容 App.tsx) ==
export interface TokenData {
  updatedAt: string
  totalDays: number
  summary: {
    totalTokens: number
    promptTokens: number
    completionTokens: number
    totalCalls: number
  }
  byModel: ModelStat[]
  daily: DailyPoint[]
}

const data: TokenData = {
  updatedAt: LAST_UPDATED,
  totalDays: daily.length,
  summary: {
    totalTokens: TOTAL_TOKENS,
    promptTokens: PROMPT_TOKENS,
    completionTokens: COMPLETION_TOKENS,
    totalCalls: TOTAL_CALLS,
  },
  byModel,
  daily,
}

export default data
