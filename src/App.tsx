import { motion } from 'framer-motion'
import data from './token-data'

const easeOut = [0.25, 0.1, 0.25, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } }
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
}

function fmt(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

function pct(n: number, total: number): string {
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

function App() {
  const s = data.summary
  const maxDaily = Math.max(...data.daily.map(d => d.total))

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
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Token 消耗统计</h1>
            <p className="text-xs sm:text-sm text-gray-400">数据更新于 {data.updatedAt} · 近 {data.totalDays} 天</p>
          </div>
        </motion.div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: '总消耗', value: fmt(s.totalTokens), sub: `${s.totalCalls.toLocaleString()} 次调用`, color: 'bg-indigo-50 text-indigo-600' },
            { label: 'Prompt', value: fmt(s.promptTokens), sub: pct(s.promptTokens, s.totalTokens), color: 'bg-violet-50 text-violet-600' },
            { label: 'Completion', value: fmt(s.completionTokens), sub: pct(s.completionTokens, s.totalTokens), color: 'bg-amber-50 text-amber-600' },
            { label: '日均', value: fmt(Math.round(s.totalTokens / data.totalDays)), sub: `${Math.round(s.totalCalls / data.totalDays)} 次/天`, color: 'bg-emerald-50 text-emerald-600' },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: i * 0.05 }}
            >
              <div className={`inline-flex px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold mb-2 sm:mb-3 ${card.color}`}>
                {card.label}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{card.value}</div>
              <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{card.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Daily bar chart */}
        <motion.div
          className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4">每日 Token 趋势</h2>
          <div className="flex items-end justify-around gap-1 sm:gap-2">
            {data.daily.map((d) => (
              <DailyBar key={d.date} value={d.total} max={maxDaily} label={formatDate(d.date)} sub={fmt(d.calls) + '次'} />
            ))}
          </div>
        </motion.div>

        {/* Model breakdown */}
        <motion.div
          className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4">模型分布</h2>
          <div className="space-y-3">
            {data.byModel.map((m, i) => {
              const p = (m.tokens / s.totalTokens) * 100
              const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500']
              return (
                <div key={m.name}>
                  <div className="flex justify-between text-[10px] sm:text-sm mb-1">
                    <span className="font-medium text-gray-700">{m.name}</span>
                    <span className="text-gray-400">{p.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex-1 h-2 sm:h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${colors[i % colors.length]}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${p}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 * i }}
                      />
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-400 w-16 sm:w-20 text-right">{fmt(m.tokens)}</span>
                    <span className="text-[10px] sm:text-xs text-gray-400 w-10 sm:w-12 text-right">{m.calls}次</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Daily table */}
        <motion.div
          className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4">每日明细</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] sm:text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium pr-3">日期</th>
                  <th className="pb-2 font-medium text-right pr-3">总 Token</th>
                  <th className="pb-2 font-medium text-right pr-3">Prompt</th>
                  <th className="pb-2 font-medium text-right pr-3">Completion</th>
                  <th className="pb-2 font-medium text-right pr-3">调用</th>
                  <th className="pb-2 font-medium text-right">次均</th>
                </tr>
              </thead>
              <tbody>
                {data.daily.map((d, i) => (
                  <motion.tr
                    key={d.date}
                    className="border-b border-gray-50 text-gray-600"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td className="py-2 sm:py-2.5 font-medium text-gray-700 pr-3">{d.date}</td>
                    <td className="py-2 sm:py-2.5 text-right font-mono pr-3">{fmt(d.total)}</td>
                    <td className="py-2 sm:py-2.5 text-right font-mono text-violet-600 pr-3">{fmt(d.prompt)}</td>
                    <td className="py-2 sm:py-2.5 text-right font-mono text-amber-600 pr-3">{fmt(d.completion)}</td>
                    <td className="py-2 sm:py-2.5 text-right pr-3">{d.calls.toLocaleString()}</td>
                    <td className="py-2 sm:py-2.5 text-right font-mono text-gray-400">{fmt(Math.round(d.total / d.calls))}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center text-[10px] sm:text-xs text-gray-400 pb-4 space-y-1"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.5 }}
        >
          <p>更新方式：运行 <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">get_token_usage</code> → 编辑 <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">src/token-data.ts</code> → Git 推送自动部署</p>
          <p>Powered by Hermes ⚡ · Data from CoPaw API</p>
        </motion.div>

      </div>
    </div>
  )
}

export default App
