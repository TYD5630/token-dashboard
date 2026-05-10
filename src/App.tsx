import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import staticData, { type TokenData } from './token-data'

const easeOut = [0.25, 0.1, 0.25, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } }
}

function fmt(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

function pct(n: number, total: number): string {
  if (!total) return '0%'
  return ((n / total) * 100).toFixed(1) + '%'
}

function formatDate(dateStr: string): string {
  const d = dateStr.split('-')
  return `${d[1]}/${d[2]}`
}

function DailyBar({ value, max, label, sub }: { value: number; max: number; label: string; sub: string }) {
  const h = Math.max((value / max) * 100, 8)
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] sm:text-xs font-semibold text-gray-400">{fmt(value)}</span>
      <div className="w-8 h-20 sm:w-12 sm:h-28 bg-gray-100 rounded-full relative overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-full"
          style={{ height: `${h}%`, background: 'linear-gradient(180deg, #6366f1 0%, #818cf8 50%, #a5b4fc 100%)' }}
          initial={{ height: '0%' }}
          animate={{ height: `${h}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
      <span className="text-[10px] sm:text-xs font-medium text-gray-500">{label}</span>
      <span className="text-[9px] sm:text-[10px] text-gray-400">{sub}</span>
    </div>
  )
}

function useTokenData() {
  const [data, setData] = useState<TokenData>(staticData)
  const [isLive, setIsLive] = useState(false)
  const [lastFetch, setLastFetch] = useState<string>('')

  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch('/api/tokens')
      if (!res.ok) throw new Error('API unavailable')
      const live = await res.json()
      setData(live)
      setIsLive(true)
      setLastFetch(new Date().toLocaleTimeString())
    } catch {
      // API 不可用 → 用静态数据
      setIsLive(false)
    }
  }, [])

  useEffect(() => {
    // 首次加载尝试获取
    fetchLive()
    // 每 30 秒刷新一次
    const interval = setInterval(fetchLive, 30_000)
    return () => clearInterval(interval)
  }, [fetchLive])

  return { data, isLive, lastFetch }
}

function App() {
  const { data, isLive, lastFetch } = useTokenData()
  const s = data.summary
  const maxDaily = Math.max(...data.daily.map(d => d.total), 1)

  return (
    <div className="min-h-dvh bg-gradient-to-b from-gray-50 to-white px-3 py-5 sm:px-6 sm:py-8">
      <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Token 消耗统计</h1>
              {isLive && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium leading-none">LIVE</span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-400">
              {isLive
                ? `实时数据 · 最后更新 ${lastFetch} · 近 ${data.totalDays} 天`
                : `数据更新于 ${data.updatedAt} · 近 ${data.totalDays} 天`}
              {isLive && <span className="ml-2 text-emerald-400">●</span>}
            </p>
          </div>
        </motion.div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '总消耗', value: fmt(s.totalTokens), color: 'from-indigo-500 to-indigo-600', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
            { label: 'Prompt', value: fmt(s.promptTokens), color: 'from-violet-500 to-violet-600', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { label: 'Completion', value: fmt(s.completionTokens), color: 'from-amber-500 to-amber-600', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { label: '调用次数', value: fmt(s.totalCalls), color: 'from-rose-500 to-rose-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              className="rounded-2xl p-4 text-white flex flex-col gap-1.5"
              style={{ background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))` }}
              variants={fadeUp} initial="hidden" animate="show"
              transition={{ delay: 0.1 * i }}
            >
              <div className="flex items-center gap-1.5 opacity-80">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
                <span className="text-[11px] font-medium">{card.label}</span>
              </div>
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">{card.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Model breakdown */}
        <motion.div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">模型消耗占比</h2>
          <div className="space-y-2.5">
            {data.byModel.map((m) => (
              <div key={m.name}>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span className="font-medium">{m.name}</span>
                  <span>{fmt(m.tokens)} ({pct(m.tokens, s.totalTokens)})</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ width: `${pct(m.tokens, s.totalTokens)}`, background: 'linear-gradient(90deg, #6366f1, #a5b4fc)' }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${pct(m.tokens, s.totalTokens)}` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>{fmt(m.calls)} 次调用</span>
                  <span>{pct(m.calls, s.totalCalls)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Daily chart */}
        <motion.div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.4 }}>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">每日消耗趋势</h2>
          <div className="flex justify-center items-end gap-1.5 sm:gap-3">
            {data.daily.length === 0 && (
              <p className="text-gray-400 text-sm py-8">暂无数据</p>
            )}
            {data.daily.map((d) => (
              <DailyBar
                key={d.date}
                value={d.total}
                max={maxDaily}
                label={formatDate(d.date)}
                sub={fmt(d.calls)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default App
