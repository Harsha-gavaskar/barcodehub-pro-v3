import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addProduct, updateProduct, deleteProduct, setSearchQuery, setSelectedCategory, setCurrentPage, setSortBy } from '../../redux/slices/productSlice';
import toast from 'react-hot-toast';
import { Plus, Search, Upload, Download, Edit3, Trash2, ChevronUp, ChevronDown, Package, X, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, RefreshCw, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
const CATEGORIES = ['All', 'Electronics', 'Accessories', 'Lighting', 'Audio', 'Storage'];
const FORMATS = ['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'QR'];
const STATUS_BADGE = {
    active: 'badge-green',
    inactive: 'badge-gray',
    discontinued: 'badge-red',
};
function ProductModal({ product, onClose }) {
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: product ?? {
            id: Date.now().toString(),
            status: 'active',
            barcodeFormat: 'CODE128',
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
        },
    });
    const onSubmit = (data) => {
        if (product) {
            dispatch(updateProduct({ ...data, updatedAt: new Date().toISOString().split('T')[0] }));
            toast.success('Product updated!');
        }
        else {
            dispatch(addProduct({ ...data, id: Date.now().toString() }));
            toast.success('Product added!');
        }
        onClose();
    };
    return (_jsx("div", { className: "modal-backdrop", onClick: e => e.target === e.currentTarget && onClose(), children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.95, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 20 }, className: "glass-panel w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto scrollable", children: [_jsxs("div", { className: "flex items-center justify-between mb-5", children: [_jsx("h3", { className: "text-lg font-bold text-dark-50", children: product ? 'Edit Product' : 'Add New Product' }), _jsx("button", { onClick: onClose, className: "btn-icon", children: _jsx(X, { size: 16 }) })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Product Name *" }), _jsx("input", { ...register('name', { required: true }), className: clsx('input-field', errors.name && 'border-red-500/60'), placeholder: "Product name" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "SKU *" }), _jsx("input", { ...register('sku', { required: true }), className: "input-field", placeholder: "SKU-000001" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Barcode Value *" }), _jsx("input", { ...register('barcode', { required: true }), className: "input-field", placeholder: "Barcode number" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Barcode Format" }), _jsx("select", { ...register('barcodeFormat'), className: "select-field", children: FORMATS.map(f => _jsx("option", { value: f, children: f }, f)) })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Price ($)" }), _jsx("input", { type: "number", step: "0.01", ...register('price'), className: "input-field", placeholder: "0.00" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Category" }), _jsx("select", { ...register('category'), className: "select-field", children: CATEGORIES.slice(1).map(c => _jsx("option", { value: c, children: c }, c)) })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Stock Quantity" }), _jsx("input", { type: "number", ...register('stock'), className: "input-field", placeholder: "0" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Location" }), _jsx("input", { ...register('location'), className: "input-field", placeholder: "Shelf A-01" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Weight" }), _jsx("input", { ...register('weight'), className: "input-field", placeholder: "0.5kg" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Manufacturer" }), _jsx("input", { ...register('manufacturer'), className: "input-field", placeholder: "Manufacturer name" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Expiry Date" }), _jsx("input", { type: "date", ...register('expiryDate'), className: "input-field" })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Status" }), _jsxs("select", { ...register('status'), className: "select-field", children: [_jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" }), _jsx("option", { value: "discontinued", children: "Discontinued" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "input-label", children: "Description" }), _jsx("textarea", { ...register('description'), className: "input-field h-20 resize-none", placeholder: "Product description..." })] }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "btn-secondary flex-1", children: "Cancel" }), _jsx("button", { type: "submit", className: "btn-primary flex-1", children: product ? 'Save Changes' : 'Add Product' })] })] })] }) }));
}
export default function ProductsPage() {
    const dispatch = useDispatch();
    const { products, searchQuery, selectedCategory, currentPage, pageSize, sortBy, sortOrder } = useSelector((s) => s.products);
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState();
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const filtered = products
        .filter(p => {
        const q = searchQuery.toLowerCase();
        return ((selectedCategory === 'All' || p.category === selectedCategory) &&
            (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q)));
    })
        .sort((a, b) => {
        const va = String(a[sortBy] ?? '');
        const vb = String(b[sortBy] ?? '');
        return sortOrder === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const openEdit = (p) => { setEditProduct(p); setShowModal(true); };
    const openAdd = () => { setEditProduct(undefined); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditProduct(undefined); };
    const handleDelete = (id) => {
        dispatch(deleteProduct(id));
        setDeleteConfirm(null);
        toast.success('Product deleted');
    };
    const SortIcon = ({ col }) => (_jsxs("span", { className: "ml-1 inline-flex flex-col", children: [_jsx(ChevronUp, { size: 10, className: sortBy === col && sortOrder === 'asc' ? 'text-brand-400' : 'text-dark-600' }), _jsx(ChevronDown, { size: 10, className: sortBy === col && sortOrder === 'desc' ? 'text-brand-400' : 'text-dark-600' })] }));
    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
    const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
    return (_jsxs(motion.div, { variants: container, initial: "hidden", animate: "show", className: "space-y-5", children: [_jsxs(motion.div, { variants: item, className: "flex flex-wrap items-center gap-3", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h2", { className: "text-xl font-bold text-dark-50", children: "Products" }), _jsxs("p", { className: "text-sm text-dark-400", children: [filtered.length, " products", searchQuery ? ` matching "${searchQuery}"` : ''] })] }), _jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsxs("button", { className: "btn-secondary text-sm", children: [_jsx(Upload, { size: 15 }), " Import"] }), _jsxs("button", { className: "btn-secondary text-sm", children: [_jsx(Download, { size: 15 }), " Export"] }), _jsxs("button", { className: "btn-secondary text-sm", children: [_jsx(RefreshCw, { size: 15 }), " Sync Sheets"] }), _jsxs("button", { onClick: openAdd, className: "btn-primary text-sm", id: "add-product-btn", children: [_jsx(Plus, { size: 15 }), " Add Product"] })] })] }), _jsxs(motion.div, { variants: item, className: "glass-card p-4 flex flex-wrap gap-3 items-center", children: [_jsxs("div", { className: "relative flex-1 min-w-48", children: [_jsx(Search, { size: 15, className: "absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" }), _jsx("input", { value: searchQuery, onChange: e => dispatch(setSearchQuery(e.target.value)), placeholder: "Search by name, SKU, barcode...", className: "input-field pl-9 py-2.5" })] }), _jsx("div", { className: "flex gap-2 flex-wrap", children: CATEGORIES.map(cat => (_jsx("button", { onClick: () => dispatch(setSelectedCategory(cat)), className: clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', selectedCategory === cat
                                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                                : 'bg-dark-700/40 text-dark-400 border border-dark-600/30 hover:text-dark-200'), children: cat }, cat))) })] }), _jsxs(motion.div, { variants: item, className: "table-container", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsx("tr", { className: "border-b border-dark-700/50", children: [
                                            { label: 'Product', col: 'name' },
                                            { label: 'SKU', col: 'sku' },
                                            { label: 'Barcode', col: 'barcode' },
                                            { label: 'Category', col: 'category' },
                                            { label: 'Price', col: 'price' },
                                            { label: 'Stock', col: 'stock' },
                                            { label: 'Status', col: 'status' },
                                            { label: 'Actions', col: null },
                                        ].map(h => (_jsxs("th", { className: "table-header text-left cursor-pointer select-none", onClick: () => h.col && dispatch(setSortBy(h.col)), children: [h.label, h.col && _jsx(SortIcon, { col: h.col })] }, h.label))) }) }), _jsxs("tbody", { children: [paginated.map((p, i) => (_jsxs(motion.tr, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.04 }, className: "table-row", children: [_jsx("td", { className: "table-cell", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center", children: _jsx(Package, { size: 14, className: "text-brand-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-dark-100 text-sm", children: p.name }), _jsx("p", { className: "text-xs text-dark-500", children: p.manufacturer })] })] }) }), _jsx("td", { className: "table-cell", children: _jsx("span", { className: "font-mono text-xs text-dark-300 bg-dark-700/40 px-2 py-0.5 rounded", children: p.sku }) }), _jsx("td", { className: "table-cell", children: _jsx("span", { className: "font-mono text-xs text-dark-400", children: p.barcode }) }), _jsx("td", { className: "table-cell", children: _jsx("span", { className: "badge-blue", children: p.category }) }), _jsxs("td", { className: "table-cell font-semibold text-dark-200", children: ["$", Number(p.price).toFixed(2)] }), _jsx("td", { className: "table-cell", children: _jsx("span", { className: clsx('font-medium', p.stock === 0 ? 'text-red-400' : p.stock < 10 ? 'text-amber-400' : 'text-emerald-400'), children: p.stock === 0 ? (_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(AlertTriangle, { size: 12 }), " Out of Stock"] })) : p.stock < 10 ? (_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(AlertTriangle, { size: 12 }), " ", p.stock, " low"] })) : p.stock }) }), _jsx("td", { className: "table-cell", children: _jsx("span", { className: STATUS_BADGE[p.status], children: p.status }) }), _jsx("td", { className: "table-cell", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: () => openEdit(p), className: "btn-icon", title: "Edit", children: _jsx(Edit3, { size: 13 }) }), _jsx("button", { onClick: () => setDeleteConfirm(p.id), className: "btn-icon text-red-400 hover:text-red-300 hover:bg-red-500/10", title: "Delete", children: _jsx(Trash2, { size: 13 }) })] }) })] }, p.id))), paginated.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 8, className: "table-cell text-center text-dark-500 py-12", children: "No products found" }) }))] })] }) }), totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-t border-dark-700/50", children: [_jsxs("p", { className: "text-xs text-dark-500", children: ["Showing ", (currentPage - 1) * pageSize + 1, "\u2013", Math.min(currentPage * pageSize, filtered.length), " of ", filtered.length] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: () => dispatch(setCurrentPage(1)), disabled: currentPage === 1, className: "btn-icon disabled:opacity-30", children: _jsx(ChevronsLeft, { size: 13 }) }), _jsx("button", { onClick: () => dispatch(setCurrentPage(currentPage - 1)), disabled: currentPage === 1, className: "btn-icon disabled:opacity-30", children: _jsx(ChevronLeft, { size: 13 }) }), Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        const page = Math.max(1, currentPage - 2) + i;
                                        if (page > totalPages)
                                            return null;
                                        return (_jsx("button", { onClick: () => dispatch(setCurrentPage(page)), className: clsx('w-8 h-8 rounded-lg text-xs font-medium transition-all', page === currentPage ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40' : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/40'), children: page }, page));
                                    }), _jsx("button", { onClick: () => dispatch(setCurrentPage(currentPage + 1)), disabled: currentPage === totalPages, className: "btn-icon disabled:opacity-30", children: _jsx(ChevronRight, { size: 13 }) }), _jsx("button", { onClick: () => dispatch(setCurrentPage(totalPages)), disabled: currentPage === totalPages, className: "btn-icon disabled:opacity-30", children: _jsx(ChevronsRight, { size: 13 }) })] })] }))] }), _jsx(AnimatePresence, { children: deleteConfirm && (_jsx("div", { className: "modal-backdrop", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "glass-panel p-6 w-full max-w-sm text-center", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4", children: _jsx(Trash2, { size: 20, className: "text-red-400" }) }), _jsx("h3", { className: "font-bold text-dark-100 mb-2", children: "Delete Product?" }), _jsx("p", { className: "text-sm text-dark-400 mb-5", children: "This action cannot be undone." }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => setDeleteConfirm(null), className: "btn-secondary flex-1", children: "Cancel" }), _jsx("button", { onClick: () => handleDelete(deleteConfirm), className: "btn-danger flex-1", children: "Delete" })] })] }) })) }), _jsx(AnimatePresence, { children: showModal && _jsx(ProductModal, { product: editProduct, onClose: closeModal }) })] }));
}
