import { motion } from 'framer-motion'
import {
  Package, QrCode, Printer, TrendingUp, ArrowUpRight,
  ArrowDownRight, RefreshCw, AlertTriangle, CheckCircle,
  Layers, BarChart3, Clock
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts'

const dailyData = [
  { day: 'Mon', labels: 420, prints: 380 },
  { day: 'Tue', labels: 580, prints: 510 },
  { day: 'Wed', labels: 340, prints: 300 },
  { day: 'Thu', labels: 720, prints: 680 },
  { day: 'Fri', labels: 890, prints: 820 },
  { day: 'Sat', labels: 230, prints: 200 },
  { day: 'Sun', labels: 150, prints: 130 },
]

const weeklyData = [
  { week: 'W1', labels: 3200 },
  { week: 'W2', labels: 4100 },
  { week: 'W3', labels: 3800 },
  { week: 'W4', labels: 5200 },
]

const barcodeTypes = [
  { name: 'CODE128', value: 42, color: '#6366f1' },
  { name: 'EAN13', value: 28, color: '#8b5cf6' },
  { name: 'QR Code', value: 18, color: '#06b6d4' },
  { name: 'UPC', value: 8, color: '#10b981' },
  { name: 'Others', value: 4, color: '#f59e0b' },
]

const topProducts = [
  { name: 'Wireless Mouse Pro', labels: 842, trend: 12 },
  { name: 'USB-C Hub 7-in-1', labels: 634, trend: 8 },
  { name: 'Mechanical Keyboard', labels: 521, trend: -3 },
  { name: 'Monitor Arm Dual', labels: 412, trend: 22 },
  { name: 'Webcam 4K Ultra', labels: 388, trend: 5 },
]

const recentActivity = [
  { action: 'Google Sheets Synced', detail: '124 products updated', time: '2m ago', icon: RefreshCw, color: 'text-emerald-400' },
  { action: 'Print Job Completed', detail: '50 EAN13 labels — HP LaserJet', time: '15m ago', icon: Printer, color: 'text-blue-400' },
  { action: 'Low Stock Alert', detail: 'Webcam 4K Ultra — 5 remaining', time: '1h ago', icon: AlertTriangle, color: 'text-amber-400' },
  { action: 'Barcode Generated', detail: 'SKU-009012 — CODE128', time: '2h ago', icon: QrCode, color: 'text-purple-400' },
  { action: 'CSV Import Success', detail: '48 new products imported', time: '3h ago', icon: CheckCircle, color: 'text-emerald-400' },
]

const STAT_CARDS = [
  {
    label: 'Total Products',
    value: '2,847',
    change: '+124 this week',
    positive: true,
    icon: Package,
    gradient: 'from-brand-500/20 to-brand-600/5',
    iconColor: 'text-brand-400',
    iconBg: 'bg-brand-500/10',
  },
  {
    label: 'Labels Printed',
    value: '18,432',
    change: '+890 today',
    positive: true,
    icon: QrCode,
    gradient: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
  },
  {
    label: 'Pending Prints',
    value: '47',
    change: '-12 from yesterday',
    positive: true,
    icon: Clock,
    gradient: 'from-amber-500/20 to-amber-600/5',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
  },
  {
    label: 'Barcode Formats',
    value: '8',
    change: 'CODE128, EAN, QR+5',
    positive: true,
    icon: Layers,
    gradient: 'from-cyan-500/20 to-cyan-600/5',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
  },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-900/95 border border-dark-600/50 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-dark-400 text-xs mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function DashboardPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark-50">
            Good morning, <span className="gradient-text">Alex</span> 👋
          </h2>
          <p className="text-dark-400 text-sm mt-1">Here's your platform overview for today.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">All Systems Operational</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="stat-card"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-2xl opacity-60`} />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                    <Icon size={20} className={card.iconColor} />
                  </div>
                  <ArrowUpRight size={16} className="text-dark-600" />
                </div>
                <p className="text-dark-400 text-sm font-medium">{card.label}</p>
                <p className="text-3xl font-bold text-dark-50 mt-1">{card.value}</p>
                <p className={`text-xs mt-1 flex items-center gap-1 ${card.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {card.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {card.change}
                </p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Daily Chart */}
        <motion.div variants={item} className="xl:col-span-2 chart-container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-dark-100">Daily Activity</h3>
              <p className="text-xs text-dark-500">Labels generated vs printed this week</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-dark-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" /> Generated</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Printed</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="labelsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="printsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.3)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="labels" name="Generated" stroke="#6366f1" strokeWidth={2} fill="url(#labelsGrad)" />
              <Area type="monotone" dataKey="prints" name="Printed" stroke="#8b5cf6" strokeWidth={2} fill="url(#printsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Barcode Types Pie */}
        <motion.div variants={item} className="chart-container">
          <h3 className="font-semibold text-dark-100 mb-1">Barcode Types</h3>
          <p className="text-xs text-dark-500 mb-4">Distribution this month</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={barcodeTypes} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {barcodeTypes.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Share']} contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(71,85,105,0.5)', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {barcodeTypes.map(t => (
              <div key={t.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-dark-400">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: t.color }} />
                  {t.name}
                </span>
                <span className="font-medium text-dark-200">{t.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Top Products */}
        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-dark-100">Top Products</h3>
            <span className="badge-blue">This Month</span>
          </div>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 group">
                <span className="text-dark-600 text-xs font-mono w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-dark-200 font-medium truncate">{p.name}</p>
                  <div className="mt-1 h-1.5 bg-dark-700/60 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(p.labels / 1000) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-dark-200 shrink-0">{p.labels.toLocaleString()}</span>
                <span className={`text-xs shrink-0 flex items-center gap-0.5 ${p.trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {p.trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(p.trend)}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-dark-100">Recent Activity</h3>
            <button className="text-xs text-brand-400 hover:text-brand-300">View all</button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((a, i) => {
              const Icon = a.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-dark-700/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-dark-700/60 flex items-center justify-center shrink-0">
                    <Icon size={14} className={a.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-100">{a.action}</p>
                    <p className="text-xs text-dark-500 truncate">{a.detail}</p>
                  </div>
                  <span className="text-xs text-dark-600 shrink-0">{a.time}</span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Weekly Bar Chart */}
      <motion.div variants={item} className="chart-container">
        <h3 className="font-semibold text-dark-100 mb-1">Weekly Overview</h3>
        <p className="text-xs text-dark-500 mb-5">Total labels generated per week this month</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeklyData} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.3)" vertical={false} />
            <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="labels" name="Labels" fill="url(#barGrad)" radius={[6, 6, 0, 0]}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#4338ca" />
                </linearGradient>
              </defs>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  )
}
