import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import toast from 'react-hot-toast'
import {
  Printer, Play, Pause, Trash2, Eye, Plus, CheckCircle,
  Clock, XCircle, RefreshCw, ChevronRight, Settings, Download
} from 'lucide-react'
import clsx from 'clsx'

const PRINTERS = [
  { id: 'hp-laserjet', name: 'HP LaserJet Pro', status: 'online', type: 'Laser', location: 'Office A' },
  { id: 'zebra-zd420', name: 'Zebra ZD420', status: 'online', type: 'Thermal', location: 'Warehouse' },
  { id: 'epson-lx350', name: 'Epson LX-350', status: 'offline', type: 'Dot Matrix', location: 'Storage' },
  { id: 'canon-pixma', name: 'Canon PIXMA', status: 'busy', type: 'Inkjet', location: 'Office B' },
]

const PAPER_SIZES = [
  { id: 'a4', label: 'A4', desc: '210 × 297 mm' },
  { id: 'a5', label: 'A5', desc: '148 × 210 mm' },
  { id: '4x6', label: '4×6"', desc: '101 × 152 mm' },
  { id: '2x1', label: '2×1"', desc: '50 × 25 mm' },
  { id: 'custom', label: 'Custom', desc: 'Set dimensions' },
]

interface PrintJob {
  id: string
  product: string
  quantity: number
  format: string
  printer: string
  paperSize: string
  status: 'queued' | 'printing' | 'done' | 'failed'
  created: string
  pages: number
}

const DEMO_JOBS: PrintJob[] = [
  { id: '1', product: 'Wireless Mouse Pro (×50)', quantity: 50, format: 'EAN13', printer: 'HP LaserJet Pro', paperSize: 'A4', status: 'done', created: '10:23 AM', pages: 6 },
  { id: '2', product: 'USB-C Hub (×25)', quantity: 25, format: 'CODE128', printer: 'Zebra ZD420', paperSize: '4×6"', status: 'printing', created: '11:04 AM', pages: 3 },
  { id: '3', product: 'Mechanical Keyboard (×10)', quantity: 10, format: 'EAN13', printer: 'HP LaserJet Pro', paperSize: 'A4', status: 'queued', created: '11:15 AM', pages: 2 },
  { id: '4', product: 'Monitor Arm (×8)', quantity: 8, format: 'CODE128', printer: 'Zebra ZD420', paperSize: '2×1"', status: 'failed', created: '09:45 AM', pages: 1 },
]

const STATUS_CONFIG = {
  queued: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Queued' },
  printing: { icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Printing' },
  done: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Done' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Failed' },
}

const PRINTER_STATUS = {
  online: 'text-emerald-400',
  offline: 'text-dark-500',
  busy: 'text-amber-400',
}

export default function PrintManagerPage() {
  const products = useSelector((s: RootState) => s.products.products)
  const [jobs, setJobs] = useState<PrintJob[]>(DEMO_JOBS)
  const [selectedPrinter, setSelectedPrinter] = useState(PRINTERS[0].id)
  const [selectedPaper, setSelectedPaper] = useState('a4')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(10)
  const [format, setFormat] = useState('CODE128')
  const [previewOpen, setPreviewOpen] = useState(false)

  const printJob = () => {
    if (!selectedProduct) { toast.error('Select a product first'); return }
    const product = products.find(p => p.id === selectedProduct)
    const printer = PRINTERS.find(p => p.id === selectedPrinter)
    const paper = PAPER_SIZES.find(p => p.id === selectedPaper)
    const newJob: PrintJob = {
      id: Date.now().toString(),
      product: `${product?.name ?? 'Product'} (×${quantity})`,
      quantity,
      format,
      printer: printer?.name ?? '',
      paperSize: paper?.label ?? '',
      status: 'queued',
      created: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pages: Math.ceil(quantity / 9),
    }
    setJobs(prev => [newJob, ...prev])
    toast.success(`Print job queued for ${printer?.name}!`)
    setTimeout(() => {
      setJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, status: 'printing' } : j))
      setTimeout(() => {
        setJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, status: 'done' } : j))
        toast.success('Print job completed!')
      }, 3000)
    }, 1500)
  }

  const removeJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id))
    toast.success('Job removed')
  }

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark-50">Print Manager</h2>
          <p className="text-sm text-dark-400">Configure and send label print jobs</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Print Configuration */}
        <motion.div variants={item} className="xl:col-span-1 space-y-4">
          {/* Printer Selection */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
              <Printer size={14} className="text-brand-400" /> Select Printer
            </h3>
            <div className="space-y-2">
              {PRINTERS.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPrinter(p.id)}
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                    selectedPrinter === p.id
                      ? 'border-brand-500/50 bg-brand-500/10'
                      : 'border-dark-600/30 bg-dark-800/30 hover:border-dark-500/50'
                  )}
                >
                  <Printer size={16} className={p.status === 'online' ? 'text-emerald-400' : p.status === 'busy' ? 'text-amber-400' : 'text-dark-600'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-dark-100 truncate">{p.name}</p>
                    <p className="text-[10px] text-dark-500">{p.type} · {p.location}</p>
                  </div>
                  <span className={clsx('text-[10px] font-medium capitalize', PRINTER_STATUS[p.status as keyof typeof PRINTER_STATUS])}>
                    ● {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Paper Size */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-dark-200 mb-3">Paper Size</h3>
            <div className="grid grid-cols-2 gap-2">
              {PAPER_SIZES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedPaper(s.id)}
                  className={clsx(
                    'text-left p-3 rounded-xl border text-xs transition-all',
                    selectedPaper === s.id
                      ? 'border-brand-500/60 bg-brand-500/10 text-brand-300'
                      : 'border-dark-600/40 bg-dark-800/40 text-dark-400 hover:border-dark-500/60'
                  )}
                >
                  <div className="font-bold text-sm">{s.label}</div>
                  <div className="opacity-60 mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Job Options */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-dark-200">Print Options</h3>
            <div>
              <label className="input-label">Product</label>
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="select-field">
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Quantity: {quantity} labels</label>
              <input type="range" min={1} max={200} value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="input-label">Barcode Format</label>
              <select value={format} onChange={e => setFormat(e.target.value)} className="select-field">
                {['CODE128', 'EAN13', 'EAN8', 'UPC', 'QR Code'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setPreviewOpen(true)} className="btn-secondary flex-1 text-sm">
                <Eye size={14} /> Preview
              </button>
              <button onClick={printJob} className="btn-primary flex-1 text-sm">
                <Printer size={14} /> Print
              </button>
            </div>
          </div>
        </motion.div>

        {/* Print Queue */}
        <motion.div variants={item} className="xl:col-span-2 space-y-4">
          <div className="glass-card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700/50">
              <h3 className="font-semibold text-dark-100">Print Queue</h3>
              <div className="flex items-center gap-2">
                <span className="badge-blue">{jobs.filter(j => j.status !== 'done').length} active</span>
                <button className="btn-icon"><RefreshCw size={13} /></button>
              </div>
            </div>

            <div className="divide-y divide-dark-800/50">
              {jobs.map((job, i) => {
                const cfg = STATUS_CONFIG[job.status]
                const Icon = cfg.icon
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-dark-700/20 transition-colors"
                  >
                    <div className={clsx('w-9 h-9 rounded-xl border flex items-center justify-center shrink-0', cfg.bg)}>
                      <Icon size={16} className={clsx(cfg.color, job.status === 'printing' && 'animate-spin')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-100 truncate">{job.product}</p>
                      <p className="text-xs text-dark-500">{job.printer} · {job.paperSize} · {job.pages} page{job.pages > 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={clsx('badge border', cfg.bg, cfg.color)}>{cfg.label}</span>
                      <p className="text-[10px] text-dark-600 mt-1">{job.created}</p>
                    </div>
                    <button
                      onClick={() => removeJob(job.id)}
                      className="btn-icon text-dark-600 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                )
              })}
              {jobs.length === 0 && (
                <div className="text-center py-16 text-dark-500">
                  <Printer size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No print jobs yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Print Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Today\'s Prints', value: '127', color: 'text-brand-400' },
              { label: 'Pages Used', value: '14', color: 'text-purple-400' },
              { label: 'Failed Jobs', value: '1', color: 'text-red-400' },
            ].map(s => (
              <div key={s.label} className="glass-card p-4 text-center">
                <p className={clsx('text-2xl font-bold', s.color)}>{s.value}</p>
                <p className="text-xs text-dark-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Print Preview Modal */}
      <AnimatePresence>
        {previewOpen && (
          <div className="modal-backdrop" onClick={() => setPreviewOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-lg p-6"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-dark-100 mb-4">Label Preview</h3>
              <div className="bg-white rounded-xl p-4 grid grid-cols-3 gap-2 border-2 border-dashed border-dark-700/40">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-gray-200 p-2 flex flex-col items-center text-gray-800 text-[10px]">
                    <p className="font-semibold text-center mb-1 truncate w-full">Product Name</p>
                    <div className="bg-gray-100 w-full h-8 flex items-center justify-center text-[8px] text-gray-500 rounded">
                      ▮▮▮▮▮▮▮▮▮▮
                    </div>
                    <p className="mt-1 font-mono">BH-00{1000 + i}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-dark-500 mt-2 text-center">Preview: A4 · 9 labels per page</p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setPreviewOpen(false)} className="btn-secondary flex-1">Close</button>
                <button onClick={() => { setPreviewOpen(false); printJob() }} className="btn-primary flex-1">
                  <Printer size={14} /> Print Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
