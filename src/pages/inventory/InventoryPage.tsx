import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { AlertTriangle, Package, TrendingDown, TrendingUp, Plus, Minus, Edit3, Filter } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

type StockStatus = 'all' | 'available' | 'low' | 'out' | 'reserved'

const getStatus = (stock: number): { label: string; badge: string } => {
  if (stock === 0) return { label: 'Out of Stock', badge: 'badge-red' }
  if (stock < 10) return { label: 'Low Stock', badge: 'badge-orange' }
  if (stock < 30) return { label: 'Available', badge: 'badge-green' }
  return { label: 'In Stock', badge: 'badge-blue' }
}

export default function InventoryPage() {
  const products = useSelector((s: RootState) => s.products.products)
  const [filter, setFilter] = useState<StockStatus>('all')
  const [adjustId, setAdjustId] = useState<string | null>(null)
  const [adjustQty, setAdjustQty] = useState(0)

  const filtered = products.filter(p => {
    if (filter === 'all') return true
    if (filter === 'out') return p.stock === 0
    if (filter === 'low') return p.stock > 0 && p.stock < 10
    if (filter === 'available') return p.stock >= 10
    return true
  })

  const totalStock = products.reduce((a, p) => a + p.stock, 0)
  const lowCount = products.filter(p => p.stock > 0 && p.stock < 10).length
  const outCount = products.filter(p => p.stock === 0).length

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-dark-50">Inventory</h2>
          <p className="text-sm text-dark-400">Track stock levels across all products</p>
        </div>
        <button className="btn-primary text-sm"><Plus size={15} /> Adjust Stock</button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Stock', value: totalStock.toLocaleString(), icon: Package, color: 'text-brand-400', bg: 'bg-brand-500/10' },
          { label: 'Low Stock Items', value: lowCount, icon: TrendingDown, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Out of Stock', value: outCount, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Total Products', value: products.length, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="glass-card p-5 flex items-center gap-4">
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', s.bg)}>
                <Icon size={20} className={s.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-50">{s.value}</p>
                <p className="text-xs text-dark-400">{s.label}</p>
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex gap-2 flex-wrap">
        {(['all', 'available', 'low', 'out'] as StockStatus[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border',
              filter === f
                ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                : 'bg-dark-700/40 text-dark-400 border-dark-600/30 hover:text-dark-200'
            )}
          >
            {f === 'all' ? 'All Products' : f === 'low' ? 'Low Stock' : f === 'out' ? 'Out of Stock' : 'Available'}
          </button>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                {['Product', 'SKU', 'Category', 'Location', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="table-header text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const st = getStatus(p.stock)
                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="table-row"
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                          <Package size={14} className="text-brand-400" />
                        </div>
                        <div>
                          <p className="font-medium text-dark-100 text-sm">{p.name}</p>
                          <p className="text-xs text-dark-500">{p.manufacturer}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="font-mono text-xs text-dark-300 bg-dark-700/40 px-2 py-0.5 rounded">{p.sku}</span>
                    </td>
                    <td className="table-cell"><span className="badge-blue">{p.category}</span></td>
                    <td className="table-cell text-dark-400 text-sm">{p.location}</td>
                    <td className="table-cell">
                      {adjustId === p.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => setAdjustQty(q => q - 1)} className="btn-icon w-6 h-6"><Minus size={10} /></button>
                          <span className="text-sm font-bold text-dark-100 w-10 text-center">{p.stock + adjustQty}</span>
                          <button onClick={() => setAdjustQty(q => q + 1)} className="btn-icon w-6 h-6"><Plus size={10} /></button>
                          <button
                            onClick={() => { toast.success(`Stock updated to ${p.stock + adjustQty}`); setAdjustId(null); setAdjustQty(0) }}
                            className="text-xs text-emerald-400 ml-1 hover:text-emerald-300"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <span className={clsx('text-sm font-semibold', p.stock === 0 ? 'text-red-400' : p.stock < 10 ? 'text-amber-400' : 'text-dark-200')}>
                          {p.stock.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className={st.badge}>{st.label}</span>
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => { setAdjustId(p.id); setAdjustQty(0) }}
                        className="btn-icon"
                        title="Adjust stock"
                      >
                        <Edit3 size={13} />
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
