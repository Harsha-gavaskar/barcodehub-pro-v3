import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import {
  addProduct, updateProduct, deleteProduct,
  setSearchQuery, setSelectedCategory, setCurrentPage, setSortBy,
  Product
} from '../../redux/slices/productSlice'
import toast from 'react-hot-toast'
import {
  Plus, Search, Filter, Upload, Download, Edit3,
  Trash2, ChevronUp, ChevronDown, Package, X,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
  RefreshCw, AlertTriangle
} from 'lucide-react'
import clsx from 'clsx'
import { useForm } from 'react-hook-form'

const CATEGORIES = ['All', 'Electronics', 'Accessories', 'Lighting', 'Audio', 'Storage']
const FORMATS = ['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'QR']

const STATUS_BADGE: Record<string, string> = {
  active: 'badge-green',
  inactive: 'badge-gray',
  discontinued: 'badge-red',
}

function ProductModal({ product, onClose }: { product?: Product; onClose: () => void }) {
  const dispatch = useDispatch()
  const { register, handleSubmit, formState: { errors } } = useForm<Product>({
    defaultValues: product ?? {
      id: Date.now().toString(),
      status: 'active',
      barcodeFormat: 'CODE128',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    },
  })

  const onSubmit = (data: Product) => {
    if (product) {
      dispatch(updateProduct({ ...data, updatedAt: new Date().toISOString().split('T')[0] }))
      toast.success('Product updated!')
    } else {
      dispatch(addProduct({ ...data, id: Date.now().toString() }))
      toast.success('Product added!')
    }
    onClose()
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
              <select {...register('barcodeFormat')} className="select-field">
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
                {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Stock Quantity</label>
              <input type="number" {...register('stock')} className="input-field" placeholder="0" />
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
              <input type="date" {...register('expiryDate')} className="input-field" />
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

export default function ProductsPage() {
  const dispatch = useDispatch()
  const { products, searchQuery, selectedCategory, currentPage, pageSize, sortBy, sortOrder } = useSelector((s: RootState) => s.products)
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filtered = products
    .filter(p => {
      const q = searchQuery.toLowerCase()
      return (
        (selectedCategory === 'All' || p.category === selectedCategory) &&
        (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q))
      )
    })
    .sort((a, b) => {
      const va = String(a[sortBy] ?? '')
      const vb = String(b[sortBy] ?? '')
      return sortOrder === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const openEdit = (p: Product) => { setEditProduct(p); setShowModal(true) }
  const openAdd = () => { setEditProduct(undefined); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditProduct(undefined) }

  const handleDelete = (id: string) => {
    dispatch(deleteProduct(id))
    setDeleteConfirm(null)
    toast.success('Product deleted')
  }

  const SortIcon = ({ col }: { col: keyof Product }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp size={10} className={sortBy === col && sortOrder === 'asc' ? 'text-brand-400' : 'text-dark-600'} />
      <ChevronDown size={10} className={sortBy === col && sortOrder === 'desc' ? 'text-brand-400' : 'text-dark-600'} />
    </span>
  )

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Header */}
      <motion.div variants={item} className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-dark-50">Products</h2>
          <p className="text-sm text-dark-400">{filtered.length} products{searchQuery ? ` matching "${searchQuery}"` : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="btn-secondary text-sm"><Upload size={15} /> Import</button>
          <button className="btn-secondary text-sm"><Download size={15} /> Export</button>
          <button className="btn-secondary text-sm"><RefreshCw size={15} /> Sync Sheets</button>
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
            value={searchQuery}
            onChange={e => dispatch(setSearchQuery(e.target.value))}
            placeholder="Search by name, SKU, barcode..."
            className="input-field pl-9 py-2.5"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => dispatch(setSelectedCategory(cat))}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                selectedCategory === cat
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
                  { label: 'Product', col: 'name' as keyof Product },
                  { label: 'SKU', col: 'sku' as keyof Product },
                  { label: 'Barcode', col: 'barcode' as keyof Product },
                  { label: 'Category', col: 'category' as keyof Product },
                  { label: 'Price', col: 'price' as keyof Product },
                  { label: 'Stock', col: 'stock' as keyof Product },
                  { label: 'Status', col: 'status' as keyof Product },
                  { label: 'Actions', col: null },
                ].map(h => (
                  <th
                    key={h.label}
                    className="table-header text-left cursor-pointer select-none"
                    onClick={() => h.col && dispatch(setSortBy(h.col))}
                  >
                    {h.label}
                    {h.col && <SortIcon col={h.col} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
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
                    <span className="badge-blue">{p.category}</span>
                  </td>
                  <td className="table-cell font-semibold text-dark-200">
                    ${Number(p.price).toFixed(2)}
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
                    <div className="flex items-center gap-1">
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
              {paginated.length === 0 && (
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
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => dispatch(setCurrentPage(1))} disabled={currentPage === 1} className="btn-icon disabled:opacity-30"><ChevronsLeft size={13} /></button>
              <button onClick={() => dispatch(setCurrentPage(currentPage - 1))} disabled={currentPage === 1} className="btn-icon disabled:opacity-30"><ChevronLeft size={13} /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = Math.max(1, currentPage - 2) + i
                if (page > totalPages) return null
                return (
                  <button
                    key={page}
                    onClick={() => dispatch(setCurrentPage(page))}
                    className={clsx('w-8 h-8 rounded-lg text-xs font-medium transition-all', page === currentPage ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40' : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/40')}
                  >
                    {page}
                  </button>
                )
              })}
              <button onClick={() => dispatch(setCurrentPage(currentPage + 1))} disabled={currentPage === totalPages} className="btn-icon disabled:opacity-30"><ChevronRight size={13} /></button>
              <button onClick={() => dispatch(setCurrentPage(totalPages))} disabled={currentPage === totalPages} className="btn-icon disabled:opacity-30"><ChevronsRight size={13} /></button>
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
                <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1">Delete</button>
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
