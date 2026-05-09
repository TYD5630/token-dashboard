// Token consumption data — update with: npx tsx scripts/update-token-data.ts
// Or manually: get_token_usage → paste numbers here → git push
// Last updated: 2026-05-09 20:30

export interface TokenDataPoint {
  date: string
  total: number
  calls: number
  prompt: number
  completion: number
}

export interface TokenData {
  updatedAt: string
  totalDays: number
  summary: {
    totalTokens: number
    promptTokens: number
    completionTokens: number
    totalCalls: number
  }
  byModel: {
    name: string
    tokens: number
    calls: number
  }[]
  daily: TokenDataPoint[]
}

const data: TokenData = {
  updatedAt: '2026-05-09 20:30',
  totalDays: 7,
  summary: {
    totalTokens: 849_079_387,
    promptTokens: 845_913_878,
    completionTokens: 3_165_509,
    totalCalls: 10_054,
  },
  byModel: [
    { name: 'DeepSeek V4 Flash', tokens: 397_572_068, calls: 5005 },
    { name: 'OpenCode Big Pickle', tokens: 448_426_720, calls: 5003 },
    { name: 'Nemotron-3 Super Free', tokens: 2_810_182, calls: 42 },
    { name: 'MiniMax M2.5 Free', tokens: 270_417, calls: 4 },
  ],
  daily: [
    { date: '2026-05-03', total: 105_988_322, calls: 1498, prompt: 105_587_000, completion: 401_322 },
    { date: '2026-05-04', total: 281_324_343, calls: 3311, prompt: 280_325_000, completion: 999_343 },
    { date: '2026-05-05', total: 139_683_565, calls: 1485, prompt: 139_189_000, completion: 494_565 },
    { date: '2026-05-06', total: 87_686_595, calls: 1050, prompt: 87_361_000, completion: 325_595 },
    { date: '2026-05-07', total: 25_621_196, calls: 336, prompt: 25_527_000, completion: 94_196 },
    { date: '2026-05-08', total: 92_931_130, calls: 1071, prompt: 92_587_000, completion: 344_130 },
    { date: '2026-05-09', total: 115_844_236, calls: 1303, prompt: 115_337_878, completion: 506_358 },
  ],
}

export default data
