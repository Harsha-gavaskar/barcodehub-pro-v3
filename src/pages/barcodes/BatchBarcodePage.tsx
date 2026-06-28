import { useState, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'
import { FileUp, Printer, Trash2, CheckCircle, FileSpreadsheet, Plus, Minus, Pencil, Eye, X, Save } from 'lucide-react'
import JsBarcode from 'jsbarcode'
import PrintableBarcodeGrid, { PrintItem } from '../../components/print/PrintableBarcodeGrid'

interface TableItem extends PrintItem {
  qty: number
}

// ─── Preview Modal ─────────────────────────────────────────────────────────────
function PreviewModal({ item, onClose }: { item: TableItem; onClose: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (svgRef.current && item.barcode) {
      try {
        JsBarcode(svgRef.current, item.barcode, {
          format: 'CODE128',
          width: 2,
          height: 60,
          displayValue: false,
          margin: 0,
        })
      } catch (err) {
        console.error('Invalid barcode:', item.barcode)
      }
    }
  }, [item.barcode])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="modal-panel max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark-100 flex items-center gap-2">
            <Eye size={16} className="text-brand-400" /> Label Preview
          </h3>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        {/* Label Preview */}
        <div className="bg-white rounded-xl p-4 border-2 border-dashed border-gray-300 shadow-inner">
          <div className="flex flex-col gap-2">
            {/* Name */}
            <div className="text-[11px] font-semibold text-gray-800 truncate uppercase tracking-wider">
              {item.name || 'UNKNOWN PRODUCT'}
            </div>
            {/* Price & Hash */}
            <div className="flex items-end justify-between">
              <div className="text-xl font-bold text-black tracking-tight">
                ₹ {item.price || '0.00'}
              </div>
              <div className="text-[12px] font-bold text-gray-800">{item.hashCode}</div>
            </div>
            {/* Barcode */}
            <div className="flex justify-center w-full py-1">
              <svg ref={svgRef} className="max-w-full" />
            </div>
            {/* Bottom codes */}
            <div className="flex justify-between text-[10px] font-semibold text-gray-800">
              <span>{item.barcode}</span>
              <span>{item.subCode}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-dark-400 mt-3 text-center">This is an exact preview of how your label will print.</p>
      </motion.div>
    </div>
  )
}

// ─── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ item, onSave, onClose }: { item: TableItem; onSave: (updated: TableItem) => void; onClose: () => void }) {
  const [form, setForm] = useState({ ...item })

  const handleChange = (field: keyof TableItem, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Product name cannot be empty'); return }
    onSave(form)
    toast.success('Product updated!')
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="modal-panel max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-dark-100 flex items-center gap-2">
            <Pencil size={16} className="text-brand-400" /> Edit Product
          </h3>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Product Name', field: 'name' as keyof TableItem, placeholder: 'e.g. BASKET COLANDER G9' },
            { label: 'Price (₹)', field: 'price' as keyof TableItem, placeholder: 'e.g. 500.00' },
            { label: 'Hash Code', field: 'hashCode' as keyof TableItem, placeholder: 'e.g. # ZI' },
            { label: 'Barcode Value', field: 'barcode' as keyof TableItem, placeholder: 'e.g. CBG9' },
            { label: 'Sub-code', field: 'subCode' as keyof TableItem, placeholder: 'e.g. ZCOS ZEO BM' },
          ].map(({ label, field, placeholder }) => (
            <div key={field}>
              <label className="input-label">{label}</label>
              <input
                className="input-field"
                value={String(form[field] ?? '')}
                placeholder={placeholder}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} className="btn-primary flex-1">
            <Save size={15} /> Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Single-item print helper ──────────────────────────────────────────────────
// Renders a hidden popup with qty copies of that barcode and prints it
function printSingleItem(item: TableItem) {
  const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  try {
    JsBarcode(svgEl, item.barcode, { format: 'CODE128', width: 2, height: 50, displayValue: false, margin: 0 })
  } catch (e) {
    toast.error('Invalid barcode value, cannot print.')
    return
  }
  const svgHTML = svgEl.outerHTML

  // Build one label block
  const labelHTML = `
    <div class="label">
      <div class="name">${item.name}</div>
      <div class="row">
        <div class="price">&#8377; ${item.price}</div>
        <div class="hash">${item.hashCode}</div>
      </div>
      <div class="barcode-wrap">${svgHTML}</div>
      <div class="codes"><span>${item.barcode}</span><span>${item.subCode}</span></div>
    </div>
  `

  // Repeat the label block qty times
  const allLabels = Array(item.qty).fill(labelHTML).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { margin: 5mm; }
        body { margin: 0; font-family: sans-serif; background: white; color: black; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .label {
          display: flex; flex-direction: column; gap: 4px;
          padding: 6px; border: 1px dashed #ccc; border-radius: 6px;
          break-inside: avoid;
        }
        .name { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .row { display: flex; justify-content: space-between; align-items: flex-end; }
        .price { font-size: 18px; font-weight: 900; }
        .hash { font-size: 11px; font-weight: 700; }
        .barcode-wrap { display: flex; justify-content: center; }
        .barcode-wrap svg { max-width: 100%; }
        .codes { display: flex; justify-content: space-between; font-size: 9px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="grid">${allLabels}</div>
      <script>window.onload = () => { window.print(); window.close(); }<\/script>
    </body>
    </html>
  `

  const win = window.open('', '_blank', 'width=400,height=400')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}


// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BatchBarcodePage() {
  const [items, setItems] = useState<TableItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [editItem, setEditItem] = useState<TableItem | null>(null)
  const [previewItem, setPreviewItem] = useState<TableItem | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (file: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 })

        const rows = json.length > 0 && typeof json[0][0] === 'string' && json[0][0].toLowerCase().includes('name')
          ? json.slice(1) : json

        const newItems: TableItem[] = []
        const seenBarcodes = new Set<string>()

        const generateUniqueId = () => {
          let id
          do { id = 'BH-' + Math.random().toString(36).substring(2, 8).toUpperCase() }
          while (seenBarcodes.has(id))
          return id
        }

        rows.forEach((row: any, idx: number) => {
          if (!row || row.length === 0 || (!row[0] && !row[3])) return
          const name = row[0] ? String(row[0]).trim() : 'Unknown Product'
          const price = row[1] ? String(row[1]).trim() : '0.00'
          const hashCode = row[2] ? String(row[2]).trim() : ''
          let barcode = row[3] ? String(row[3]).trim() : ''
          const subCode = row[4] ? String(row[4]).trim() : ''
          let qty = 1
          if (row[5] && !isNaN(Number(row[5]))) qty = Math.max(1, Number(row[5]))
          if (barcode && !barcode.match(/^[a-zA-Z0-9-\.]+$/)) barcode = ''
          if (!barcode || seenBarcodes.has(barcode)) barcode = generateUniqueId()
          seenBarcodes.add(barcode)
          newItems.push({ id: `item-${Date.now()}-${idx}`, name, price, hashCode, barcode, subCode, qty })
        })

        setItems(newItems)
        toast.success(`Successfully loaded ${newItems.length} products`)
      } catch (err) {
        toast.error('Failed to parse file. Please check the format.')
      }
    }
    reader.readAsBinaryString(file)
  }

  const updateQuantity = (id: string, newQty: number) =>
    setItems(items.map(item => item.id === id ? { ...item, qty: Math.max(1, newQty) } : item))

  const handleSaveEdit = (updated: TableItem) => {
    setItems(items.map(item => item.id === updated.id ? updated : item))
    setEditItem(null)
  }

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id))
    toast.success('Product removed')
  }

  const expandedPrintItems = useMemo(() => {
    const expanded: PrintItem[] = []
    items.forEach(item => {
      for (let i = 0; i < item.qty; i++) expanded.push({ ...item, id: `${item.id}-copy-${i}` })
    })
    return expanded
  }, [items])

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
  const itemVariant = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 screen-only">
        {/* Header */}
        <motion.div variants={itemVariant} className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-dark-50">Batch Excel Print</h2>
            <p className="text-sm text-dark-400 mt-0.5">Upload your Excel sheet • Edit, preview, and print each label individually.</p>
          </div>
          {items.length > 0 && (
            <div className="flex gap-3">
              <button onClick={() => setItems([])} className="btn-secondary text-sm">
                <Trash2 size={15} /> Clear All
              </button>
              <button onClick={() => window.print()} className="btn-primary text-sm px-5">
                <Printer size={16} /> Print All ({expandedPrintItems.length})
              </button>
            </div>
          )}
        </motion.div>

        {/* Upload Zone */}
        {items.length === 0 ? (
          <motion.div variants={itemVariant} className="glass-card p-12">
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                isDragging ? 'border-brand-500 bg-brand-500/10' : 'border-dark-700/50 bg-dark-800/30'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]) }}
            >
              <FileSpreadsheet size={48} className={`mx-auto mb-4 ${isDragging ? 'text-brand-400' : 'text-dark-500'}`} />
              <h3 className="text-lg font-semibold text-dark-100 mb-2">Upload Excel or CSV File</h3>
              <p className="text-sm text-dark-400 mb-6 max-w-lg mx-auto">
                Drag and drop your spreadsheet here. The system expects up to 6 columns:<br />
                <span className="font-mono text-xs text-brand-300">Name | Price | Hash Code | Barcode | Sub-code | Quantity (Optional)</span>
              </p>
              <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv"
                onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]) }} />
              <button onClick={() => fileInputRef.current?.click()} className="btn-primary mx-auto">
                <FileUp size={16} /> Browse Files
              </button>
            </div>
          </motion.div>
        ) : (
          /* Product Table */
          <motion.div variants={itemVariant} className="glass-card overflow-hidden">
            <div className="p-5 border-b border-dark-700/50 flex items-center justify-between">
              <h3 className="font-semibold text-dark-100 flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                Products ({items.length})
              </h3>
              <div className="text-xs text-dark-400 bg-dark-800/50 px-3 py-1.5 rounded-lg border border-dark-700/50">
                Total labels: <span className="text-brand-300 font-semibold">{expandedPrintItems.length}</span>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-dark-900/90 backdrop-blur z-10">
                  <tr className="border-b border-dark-700/50">
                    <th className="p-3 text-xs font-semibold text-dark-400 w-10 text-center">#</th>
                    <th className="p-3 text-xs font-semibold text-dark-400">Name</th>
                    <th className="p-3 text-xs font-semibold text-dark-400">Price (₹)</th>
                    <th className="p-3 text-xs font-semibold text-dark-400">Hash</th>
                    <th className="p-3 text-xs font-semibold text-dark-400">Barcode</th>
                    <th className="p-3 text-xs font-semibold text-dark-400">Sub-code</th>
                    <th className="p-3 text-xs font-semibold text-dark-400 text-center">Qty</th>
                    <th className="p-3 text-xs font-semibold text-dark-400 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-dark-700/20 hover:bg-dark-800/30 transition-colors group">
                      <td className="p-3 text-sm text-dark-500 text-center">{idx + 1}</td>
                      <td className="p-3 text-sm text-dark-200 font-medium max-w-[180px] truncate">{item.name}</td>
                      <td className="p-3 text-sm text-emerald-400 font-semibold">₹{item.price}</td>
                      <td className="p-3 text-sm text-purple-400">{item.hashCode}</td>
                      <td className="p-3 text-sm text-brand-300 font-mono">{item.barcode}</td>
                      <td className="p-3 text-sm text-dark-300">{item.subCode}</td>

                      {/* Quantity Controls */}
                      <td className="p-3 text-sm text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => updateQuantity(item.id, item.qty - 1)} disabled={item.qty <= 1}
                            className="p-1 rounded bg-dark-700/50 text-dark-300 hover:bg-dark-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center font-bold text-dark-100 text-sm">{item.qty}</span>
                          <button onClick={() => updateQuantity(item.id, item.qty + 1)}
                            className="p-1 rounded bg-dark-700/50 text-dark-300 hover:bg-dark-600 transition-colors">
                            <Plus size={12} />
                          </button>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Preview */}
                          <button onClick={() => setPreviewItem(item)} title="Preview Label"
                            className="p-1.5 rounded-lg bg-dark-700/50 text-dark-300 hover:bg-brand-600/30 hover:text-brand-300 transition-colors border border-transparent hover:border-brand-600/30">
                            <Eye size={14} />
                          </button>
                          {/* Edit */}
                          <button onClick={() => setEditItem(item)} title="Edit Product"
                            className="p-1.5 rounded-lg bg-dark-700/50 text-dark-300 hover:bg-amber-600/30 hover:text-amber-300 transition-colors border border-transparent hover:border-amber-600/30">
                            <Pencil size={14} />
                          </button>
                          {/* Print Single */}
                          <button onClick={() => printSingleItem(item)} title="Print This Label"
                            className="p-1.5 rounded-lg bg-dark-700/50 text-dark-300 hover:bg-emerald-600/30 hover:text-emerald-300 transition-colors border border-transparent hover:border-emerald-600/30">
                            <Printer size={14} />
                          </button>
                          {/* Delete */}
                          <button onClick={() => handleDelete(item.id)} title="Remove Product"
                            className="p-1.5 rounded-lg bg-dark-700/50 text-dark-300 hover:bg-red-600/30 hover:text-red-400 transition-colors border border-transparent hover:border-red-600/30">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {previewItem && <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />}
        {editItem && <EditModal item={editItem} onSave={handleSaveEdit} onClose={() => setEditItem(null)} />}
      </AnimatePresence>

      {/* Print-only grid for "Print All" */}
      <PrintableBarcodeGrid items={expandedPrintItems} />
    </>
  )
}
