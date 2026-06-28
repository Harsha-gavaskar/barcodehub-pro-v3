import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Download, TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react'
import clsx from 'clsx'

const DAILY = Array.from({ length: 30 }, (_, i) => ({
  date: `Jun ${i + 1}`,
  generated: Math.floor(200 + Math.random() * 600),
  printed: Math.floor(180 + Math.random() * 500),
  failed: Math.floor(Math.random() * 20),
}))

const MONTHLY = [
  { month: 'Jan', generated: 12400, printed: 11200 },
  { month: 'Feb', generated: 14100, printed: 13000 },
  { month: 'Mar', generated: 11800, printed: 10900 },
  { month: 'Apr', generated: 17200, printed: 16400 },
  { month: 'May', generated: 15600, printed: 14800 },
  { month: 'Jun', generated: 18900, printed: 17600 },
]

const TOP_PRODUCTS = [
  { name: 'Wireless Mouse Pro', count: 3842, delta: 12 },
  { name: 'USB-C Hub 7-in-1', count: 2934, delta: 8 },
  { name: 'Mechanical Keyboard', count: 2421, delta: -3 },
  { name: 'Monitor Arm Dual', count: 1912, delta: 22 },
  { name: 'Webcam 4K Ultra', count: 1688, delta: 5 },
  { name: 'LED Desk Lamp', count: 1421, delta: -7 },
  { name: 'Mouse Pad XXL', count: 1200, delta: 15 },
]

const BARCODE_DIST = [
  { name: 'CODE128', value: 42, color: '#6366f1' },
  { name: 'EAN-13', value: 28, color: '#8b5cf6' },
  { name: 'QR Code', value: 18, color: '#06b6d4' },
  { name: 'UPC', value: 8, color: '#10b981' },
  { name: 'Others', value: 4, color: '#f59e0b' },
]

const TABS = ['Daily', 'Weekly', 'Monthly'] as const
type Tab = typeof TABS[number]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-900/95 border border-dark-600/50 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-dark-400 text-xs mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color || p.stroke }}>
          {p.name}: {Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  )
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Daily')

  const data = activeTab === 'Monthly' ? MONTHLY : DAILY.slice(0, activeTab === 'Weekly' ? 7 : 30)

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-dark-50">Analytics</h2>
          <p className="text-sm text-dark-400">Label generation and printing insights</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-dark-800/60 rounded-xl p-1 border border-dark-700/40">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'px-4 py-1.5 rounded-lg text-xs font-medium transition-all',
                  activeTab === tab ? 'bg-brand-500/20 text-brand-300' : 'text-dark-400 hover:text-dark-200'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <button className="btn-secondary text-sm"><Download size={14} /> Export Report</button>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={item} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Labels Generated', value: '18,432', change: '+12.4%', up: true, color: 'brand' },
          { label: 'Labels Printed', value: '17,012', change: '+9.8%', up: true, color: 'purple' },
          { label: 'Products Imported', value: '247', change: '+34', up: true, color: 'cyan' },
          { label: 'Failed Prints', value: '18', change: '-32%', up: false, color: 'red' },
        ].map(k => (
          <div key={k.label} className="glass-card p-5">
            <p className="text-xs text-dark-400 font-medium">{k.label}</p>
            <p className="text-2xl font-bold text-dark-50 mt-1">{k.value}</p>
            <p className={clsx('text-xs mt-1 flex items-center gap-1', k.up ? 'text-emerald-400' : 'text-red-400')}>
              {k.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {k.change} vs last period
            </p>
          </div>
        ))}
      </motion.div>

      {/* Main Chart */}
      <motion.div variants={item} className="chart-container">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-dark-100">{activeTab} Print Activity</h3>
          <div className="flex items-center gap-4 text-xs text-dark-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" /> Generated</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Printed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Failed</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="genGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="printGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.3)" />
            <XAxis dataKey={activeTab === 'Monthly' ? 'month' : 'date'} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} interval={activeTab === 'Daily' ? 4 : 0} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="generated" name="Generated" stroke="#6366f1" strokeWidth={2} fill="url(#genGrad)" />
            <Area type="monotone" dataKey="printed" name="Printed" stroke="#8b5cf6" strokeWidth={2} fill="url(#printGrad)" />
            {'failed' in (data[0] ?? {}) && (
              <Line type="monotone" dataKey="failed" name="Failed" stroke="#ef4444" strokeWidth={1.5} dot={false} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Top products bar */}
        <motion.div variants={item} className="xl:col-span-2 chart-container">
          <h3 className="font-semibold text-dark-100 mb-5">Top Products by Label Count</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={TOP_PRODUCTS} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.3)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={140} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Labels" radius={[0, 6, 6, 0]}>
                {TOP_PRODUCTS.map((_, i) => (
                  <Cell key={i} fill={`hsl(${245 + i * 15}, 80%, ${65 - i * 5}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Barcode Distribution */}
        <motion.div variants={item} className="chart-container">
          <h3 className="font-semibold text-dark-100 mb-2">Format Distribution</h3>
          <p className="text-xs text-dark-500 mb-4">Labels by barcode type</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={BARCODE_DIST} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                {BARCODE_DIST.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(71,85,105,0.5)', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {BARCODE_DIST.map(t => (
              <div key={t.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-dark-400">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: t.color }} />
                  {t.name}
                </span>
                <span className="font-semibold text-dark-200">{t.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
