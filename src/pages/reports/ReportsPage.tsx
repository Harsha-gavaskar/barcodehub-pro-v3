import { motion } from 'framer-motion'
import { Download, FileText, Table, File, Calendar, BarChart3, Package, Printer, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const REPORTS = [
  {
    title: 'Labels Report',
    desc: 'All labels generated and printed with timestamps and user info',
    icon: FileText,
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
    formats: ['PDF', 'Excel', 'CSV'],
  },
  {
    title: 'Product Catalog',
    desc: 'Complete product list with SKUs, barcodes, categories, and prices',
    icon: Package,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    formats: ['PDF', 'Excel', 'CSV'],
  },
  {
    title: 'Inventory Report',
    desc: 'Stock levels, movements, low stock alerts, and value summary',
    icon: Table,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    formats: ['PDF', 'Excel'],
  },
  {
    title: 'Print Jobs Log',
    desc: 'All print jobs with status, printer, quantity, and timestamps',
    icon: Printer,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    formats: ['PDF', 'CSV'],
  },
  {
    title: 'Analytics Report',
    desc: 'Charts and KPIs for label activity, top products, and trends',
    icon: BarChart3,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    formats: ['PDF'],
  },
  {
    title: 'User Activity Log',
    desc: 'Audit trail of all user actions in the platform',
    icon: TrendingUp,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    formats: ['PDF', 'CSV'],
  },
]

const RECENT_DOWNLOADS = [
  { name: 'Labels_Report_June_2024.pdf', size: '2.4 MB', date: 'Jun 28, 2024', format: 'PDF' },
  { name: 'Product_Catalog_Q2.xlsx', size: '1.1 MB', date: 'Jun 25, 2024', format: 'Excel' },
  { name: 'Inventory_Jun_2024.csv', size: '340 KB', date: 'Jun 20, 2024', format: 'CSV' },
]

const FORMAT_BADGE: Record<string, string> = {
  PDF: 'badge-red',
  Excel: 'badge-green',
  CSV: 'badge-blue',
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export default function ReportsPage() {
  const handleDownload = (title: string, format: string) => {
    toast.success(`Generating ${title} as ${format}...`)
    setTimeout(() => toast.success(`${title}.${format.toLowerCase()} downloaded!`), 1500)
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item}>
        <h2 className="text-xl font-bold text-dark-50">Reports</h2>
        <p className="text-sm text-dark-400">Generate and download platform reports</p>
      </motion.div>

      {/* Date Range */}
      <motion.div variants={item} className="glass-card p-4 flex flex-wrap items-center gap-3">
        <Calendar size={16} className="text-brand-400" />
        <span className="text-sm text-dark-300 font-medium">Date Range:</span>
        <input type="date" defaultValue="2024-06-01" className="input-field py-1.5 w-auto text-sm" />
        <span className="text-dark-500">→</span>
        <input type="date" defaultValue="2024-06-28" className="input-field py-1.5 w-auto text-sm" />
        <button className="btn-primary text-sm ml-auto"><Download size={14} /> Generate All</button>
      </motion.div>

      {/* Report Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {REPORTS.map((r) => {
          const Icon = r.icon
          return (
            <motion.div
              key={r.title}
              whileHover={{ y: -2 }}
              className="glass-card-hover p-5"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', r.bg)}>
                  <Icon size={18} className={r.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-dark-100 text-sm">{r.title}</h3>
                  <p className="text-xs text-dark-500 mt-0.5">{r.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {r.formats.map(f => (
                  <button
                    key={f}
                    onClick={() => handleDownload(r.title, f)}
                    className={clsx(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:scale-105',
                      f === 'PDF' ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' :
                      f === 'Excel' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
                    )}
                  >
                    <Download size={11} /> {f}
                  </button>
                ))}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Recent Downloads */}
      <motion.div variants={item} className="glass-card">
        <div className="px-6 py-4 border-b border-dark-700/50">
          <h3 className="font-semibold text-dark-100">Recent Downloads</h3>
        </div>
        <div className="divide-y divide-dark-800/50">
          {RECENT_DOWNLOADS.map((d, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-dark-700/20 transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-dark-700/40 flex items-center justify-center">
                <File size={16} className="text-dark-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-200">{d.name}</p>
                <p className="text-xs text-dark-500">{d.size} · {d.date}</p>
              </div>
              <span className={FORMAT_BADGE[d.format]}>{d.format}</span>
              <button
                onClick={() => toast.success(`Re-downloading ${d.name}`)}
                className="btn-icon opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Download size={13} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
