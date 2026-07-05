import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useCategories, useSyncGoogleSheets, APIProduct
} from '../../api/products'
import { useLabelTemplates, LabelTemplate } from '../../api/labels'
import JsBarcode from 'jsbarcode'
import toast from 'react-hot-toast'
import {
  Plus, Search, Filter, Upload, Download, Edit3,
  Trash2, ChevronUp, ChevronDown, Package, X,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
  RefreshCw, AlertTriangle, Printer
} from 'lucide-react'
import clsx from 'clsx'
import { useForm } from 'react-hook-form'

const FORMATS = ['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'QR']

const STATUS_BADGE: Record<string, string> = {
  active: 'badge-green',
  inactive: 'badge-gray',
  discontinued: 'badge-red',
}

function ProductModal({ product, onClose }: { product?: APIProduct; onClose: () => void }) {
  const { data: categories } = useCategories()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()

  const { register, handleSubmit, formState: { errors } } = useForm<Partial<APIProduct>>({
    defaultValues: product ? {
      ...product,
      price: product.price ? Number(product.price) : undefined,
      category: product.category || undefined,
    } : {
      status: 'active',
      barcode_format: 'CODE128',
      stock: 0,
      low_stock_threshold: 10,
    },
  })

  const onSubmit = (data: Partial<APIProduct>) => {
    const formattedData = {
      ...data,
      price: data.price ? Number(data.price) : null,
      stock: data.stock ? Number(data.stock) : 0,
      low_stock_threshold: data.low_stock_threshold ? Number(data.low_stock_threshold) : 10,
      category: data.category === "" ? null : data.category
    }

    if (product) {
      updateMutation.mutate({ id: product.id, data: formattedData }, {
        onSuccess: () => {
          toast.success('Product updated!')
          onClose()
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.detail || 'Failed to update product')
        }
      })
    } else {
      createMutation.mutate(formattedData, {
        onSuccess: () => {
          toast.success('Product added!')
          onClose()
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.detail || 'Failed to add product')
        }
      })
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-panel w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto scrollable"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-dark-50">{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Product Name *</label>
              <input {...register('name', { required: true })} className={clsx('input-field', errors.name && 'border-red-500/60')} placeholder="Product name" />
            </div>
            <div>
              <label className="input-label">SKU *</label>
              <input {...register('sku', { required: true })} className="input-field" placeholder="SKU-000001" />
            </div>
            <div>
              <label className="input-label">Barcode Value *</label>
              <input {...register('barcode', { required: true })} className="input-field" placeholder="Barcode number" />
            </div>
            <div>
              <label className="input-label">Barcode Format</label>
              <select {...register('barcode_format')} className="select-field">
                {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Price ($)</label>
              <input type="number" step="0.01" {...register('price')} className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="input-label">Category</label>
              <select {...register('category')} className="select-field">
                <option value="">None</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Stock Quantity</label>
              <input type="number" {...register('stock')} className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="input-label">Low Stock Threshold</label>
              <input type="number" {...register('low_stock_threshold')} className="input-field" placeholder="10" />
            </div>
            <div>
              <label className="input-label">Location</label>
              <input {...register('location')} className="input-field" placeholder="Shelf A-01" />
            </div>
            <div>
              <label className="input-label">Weight</label>
              <input {...register('weight')} className="input-field" placeholder="0.5kg" />
            </div>
            <div>
              <label className="input-label">Manufacturer</label>
              <input {...register('manufacturer')} className="input-field" placeholder="Manufacturer name" />
            </div>
            <div>
              <label className="input-label">Expiry Date</label>
              <input type="date" {...register('expiry_date')} className="input-field" />
            </div>
            <div>
              <label className="input-label">Status</label>
              <select {...register('status')} className="select-field">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea {...register('description')} className="input-field h-20 resize-none" placeholder="Product description..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">
              {product ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function printProduct(product: APIProduct, template: LabelTemplate | null) {
  const item = {
    id: product.id,
    name: product.name,
    price: product.price ? String(product.price) : '0.00',
    hashCode: product.sku || '',
    barcode: product.barcode,
    subCode: product.category_name || 'Uncategorized',
    qty: 1
  }
  
  if (template) {
    const canvasJson = template.canvas_json || {}
    const elements = canvasJson.elements || []
    const width = template.width || 400
    const height = template.height || 100

    let elementsHTML = ''
    elements.forEach((el: any) => {
      if (el.type === 'text') {
        let displayText = el.text || ''
        if (displayText.startsWith('SQPR2') || displayText.startsWith('CTZ9') || displayText.startsWith('DCF3') || displayText.startsWith('89042') || displayText.startsWith('IMPORT:')) {
          displayText = item.name
        } else if (displayText.includes('₹')) {
          displayText = `₹ ${item.price}`
        } else if (displayText.includes('#')) {
          displayText = item.hashCode || displayText
        } else if (displayText === '12345678') {
          displayText = item.barcode
        }
        elementsHTML += `
          <div style="
            position: absolute;
            left: ${el.x}px;
            top: ${el.y}px;
            font-size: ${el.fontSize || 12}px;
            font-weight: ${el.fontWeight || 'normal'};
            color: ${el.color || '#000000'};
            font-family: sans-serif;
            white-space: nowrap;
            transform: ${el.rotate ? `rotate(${el.rotate}deg)` : 'none'};
            transform-origin: center;
          ">${displayText}</div>
        `
      } else if (el.type === 'barcode') {
        const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        try {
          JsBarcode(svgEl, item.barcode, {
            format: el.format || 'CODE128',
            width: el.width ? Math.max(1, Math.floor(Number(el.width) / 100)) : 2,
            height: el.height || 40,
            displayValue: el.displayValue !== undefined ? el.displayValue : false,
            margin: 0,
          })
          const svgHTML = svgEl.outerHTML
          elementsHTML += `
            <div style="
              position: absolute;
              left: ${el.x}px;
              top: ${el.y}px;
              width: ${el.width || 300}px;
              height: ${el.height || 50}px;
              display: flex;
              justify-content: center;
              align-items: center;
              transform: ${el.rotate ? `rotate(${el.rotate}deg)` : 'none'};
              transform-origin: center;
            ">${svgHTML}</div>
          `
        } catch (e) {
          console.error(e)
        }
      }
    })

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @page { margin: 5mm; }
          body { margin: 0; font-family: sans-serif; background: white; color: black; display: flex; justify-content: center; align-items: center; height: 100vh; }
          .label {
            position: relative;
            width: ${width}px;
            height: ${height}px;
            background-color: ${template.background_color || '#ffffff'};
            border: 1px dashed #ccc;
          }
        </style>
      </head>
      <body>
        <div class="label">
          ${elementsHTML}
        </div>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body>
      </html>
    `
    const win = window.open('', '_blank', 'width=500,height=400')
    if (win) {
      win.document.write(html)
      win.document.close()
    }
  } else {
    // Default fallback print
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    try {
      JsBarcode(svgEl, item.barcode, { format: 'CODE128', width: 2, height: 50, displayValue: false, margin: 0 })
    } catch (e) {
      toast.error('Invalid barcode value, cannot print.')
      return
    }
    const svgHTML = svgEl.outerHTML

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @page { margin: 5mm; }
          body { margin: 0; font-family: sans-serif; background: white; color: black; display: flex; justify-content: center; align-items: center; height: 100vh; }
          .label {
            display: flex; flex-direction: column; gap: 4px;
            padding: 10px; border: 1px dashed #ccc; border-radius: 6px;
            width: 320px;
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
        <div class="label">
          <div class="name">${item.name}</div>
          <div class="row">
            <div class="price">&#8377; ${item.price}</div>
            <div class="hash">${item.hashCode}</div>
          </div>
          <div class="barcode-wrap">${svgHTML}</div>
          <div class="codes"><span>${item.barcode}</span><span>${item.subCode}</span></div>
        </div>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body>
      </html>
    `

    const win = window.open('', '_blank', 'width=450,height=400')
    if (win) {
      win.document.write(html)
      win.document.close()
    }
  }
}

export default function ProductsPage() {
  const { data: templates } = useLabelTemplates()
  const [rowTemplates, setRowTemplates] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [ordering, setOrdering] = useState('-created_at')
  const pageSize = 12

  const { data: categoriesData } = useCategories()
  const { data, isLoading, refetch } = useProducts({
    search,
    category_name: category,
    ordering,
    page,
    page_size: pageSize,
  })

  const deleteMutation = useDeleteProduct()
  const syncMutation = useSyncGoogleSheets()

  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<APIProduct | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const openEdit = (p: APIProduct) => { setEditProduct(p); setShowModal(true) }
  const openAdd = () => { setEditProduct(undefined); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditProduct(undefined) }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Product deleted')
        setDeleteConfirm(null)
      },
      onError: () => {
        toast.error('Failed to delete product')
      }
    })
  }

  const handleSyncSheets = () => {
    toast.promise(
      syncMutation.mutateAsync(),
      {
        loading: 'Syncing with Google Sheets...',
        success: 'Sync complete!',
        error: 'Failed to sync sheets'
      }
    ).then(() => refetch())
  }

  const toggleSort = (col: string) => {
    if (ordering === col) {
      setOrdering(`-${col}`)
    } else {
      setOrdering(col)
    }
  }

  const SortIcon = ({ col }: { col: string }) => {
    const isSorted = ordering === col || ordering === `-${col}`
    const isAsc = ordering === col
    return (
      <span className="ml-1 inline-flex flex-col">
        <ChevronUp size={10} className={isSorted && isAsc ? 'text-brand-400' : 'text-dark-600'} />
        <ChevronDown size={10} className={isSorted && !isAsc ? 'text-brand-400' : 'text-dark-600'} />
      </span>
    )
  }

  const productsList = data?.results ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)

  const categories = ['All', ...(categoriesData?.map(c => c.name) ?? [])]

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Header */}
      <motion.div variants={item} className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-dark-50">Products</h2>
          <p className="text-sm text-dark-400">{totalCount} products total</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="btn-secondary text-sm" onClick={() => window.open('http://localhost:8000/api/products/export-csv/')}><Download size={15} /> Export CSV</button>
          <button className="btn-secondary text-sm" onClick={handleSyncSheets} disabled={syncMutation.isPending}>
            <RefreshCw size={15} className={clsx(syncMutation.isPending && 'animate-spin')} /> Sync Sheets
          </button>
          <button onClick={openAdd} className="btn-primary text-sm" id="add-product-btn">
            <Plus size={15} /> Add Product
          </button>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={item} className="glass-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, SKU, barcode..."
            className="input-field pl-9 py-2.5"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1) }}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                category === cat
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                  : 'bg-dark-700/40 text-dark-400 border border-dark-600/30 hover:text-dark-200'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                {[
                  { label: 'Product', col: 'name' },
                  { label: 'SKU', col: 'sku' },
                  { label: 'Barcode', col: 'barcode' },
                  { label: 'Category', col: 'category__name' },
                  { label: 'Price', col: 'price' },
                  { label: 'Stock', col: 'stock' },
                  { label: 'Status', col: 'status' },
                  { label: 'Actions', col: '' },
                ].map(h => (
                  <th
                    key={h.label}
                    className={clsx("table-header text-left select-none", h.col && "cursor-pointer")}
                    onClick={() => h.col && toggleSort(h.col)}
                  >
                    {h.label}
                    {h.col && <SortIcon col={h.col} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="table-cell text-center text-dark-500 py-12">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : productsList.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="table-row"
                >
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center">
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
                  <td className="table-cell">
                    <span className="font-mono text-xs text-dark-400">{p.barcode}</span>
                  </td>
                  <td className="table-cell">
                    <span className="badge-blue">{p.category_name || 'Uncategorized'}</span>
                  </td>
                  <td className="table-cell font-semibold text-dark-200">
                    {p.price ? `$${Number(p.price).toFixed(2)}` : 'N/A'}
                  </td>
                  <td className="table-cell">
                    <span className={clsx('font-medium', p.stock === 0 ? 'text-red-400' : p.stock < 10 ? 'text-amber-400' : 'text-emerald-400')}>
                      {p.stock === 0 ? (
                        <span className="flex items-center gap-1"><AlertTriangle size={12} /> Out of Stock</span>
                      ) : p.stock < 10 ? (
                        <span className="flex items-center gap-1"><AlertTriangle size={12} /> {p.stock} low</span>
                      ) : p.stock}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={STATUS_BADGE[p.status]}>{p.status}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      {/* Template Selector */}
                      <select
                        value={rowTemplates[p.id] || ''}
                        onChange={(e) => setRowTemplates(prev => ({ ...prev, [p.id]: e.target.value }))}
                        className="bg-dark-800 text-[10px] text-dark-300 rounded border border-dark-700/60 px-1.5 py-0.5 outline-none max-w-[100px] cursor-pointer"
                      >
                        <option value="">Default Layout</option>
                        {templates?.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      {/* Print Button */}
                      <button
                        onClick={() => {
                          const activeTemplateId = rowTemplates[p.id] || ''
                          const activeTemplate = templates?.find(t => t.id === activeTemplateId) || null
                          printProduct(p, activeTemplate)
                        }}
                        className="btn-icon text-brand-400 hover:text-brand-300 hover:bg-brand-500/10"
                        title="Print Barcode"
                      >
                        <Printer size={13} />
                      </button>
                      <button onClick={() => openEdit(p)} className="btn-icon" title="Edit">
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(p.id)}
                        className="btn-icon text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {!isLoading && productsList.length === 0 && (
                <tr>
                  <td colSpan={8} className="table-cell text-center text-dark-500 py-12">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-dark-700/50">
            <p className="text-xs text-dark-500">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page === 1} className="btn-icon disabled:opacity-30"><ChevronsLeft size={13} /></button>
              <button onClick={() => setPage(page - 1)} disabled={page === 1} className="btn-icon disabled:opacity-30"><ChevronLeft size={13} /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = Math.max(1, page - 2) + i
                if (pageNum > totalPages) return null
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={clsx('w-8 h-8 rounded-lg text-xs font-medium transition-all', pageNum === page ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40' : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/40')}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="btn-icon disabled:opacity-30"><ChevronRight size={13} /></button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="btn-icon disabled:opacity-30"><ChevronsRight size={13} /></button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="modal-backdrop">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-panel p-6 w-full max-w-sm text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <h3 className="font-bold text-dark-100 mb-2">Delete Product?</h3>
              <p className="text-sm text-dark-400 mb-5">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1" disabled={deleteMutation.isPending}>Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <AnimatePresence>
        {showModal && <ProductModal product={editProduct} onClose={closeModal} />}
      </AnimatePresence>
    </motion.div>
  )
}
