import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { AlertTriangle, Package, TrendingDown, TrendingUp, Plus, Minus, Edit3 } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
const getStatus = (stock) => {
    if (stock === 0)
        return { label: 'Out of Stock', badge: 'badge-red' };
    if (stock < 10)
        return { label: 'Low Stock', badge: 'badge-orange' };
    if (stock < 30)
        return { label: 'Available', badge: 'badge-green' };
    return { label: 'In Stock', badge: 'badge-blue' };
};
export default function InventoryPage() {
    const products = useSelector((s) => s.products.products);
    const [filter, setFilter] = useState('all');
    const [adjustId, setAdjustId] = useState(null);
    const [adjustQty, setAdjustQty] = useState(0);
    const filtered = products.filter(p => {
        if (filter === 'all')
            return true;
        if (filter === 'out')
            return p.stock === 0;
        if (filter === 'low')
            return p.stock > 0 && p.stock < 10;
        if (filter === 'available')
            return p.stock >= 10;
        return true;
    });
    const totalStock = products.reduce((a, p) => a + p.stock, 0);
    const lowCount = products.filter(p => p.stock > 0 && p.stock < 10).length;
    const outCount = products.filter(p => p.stock === 0).length;
    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
    const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
    return (_jsxs(motion.div, { variants: container, initial: "hidden", animate: "show", className: "space-y-5", children: [_jsxs(motion.div, { variants: item, className: "flex items-center justify-between flex-wrap gap-3", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-dark-50", children: "Inventory" }), _jsx("p", { className: "text-sm text-dark-400", children: "Track stock levels across all products" })] }), _jsxs("button", { className: "btn-primary text-sm", children: [_jsx(Plus, { size: 15 }), " Adjust Stock"] })] }), _jsx(motion.div, { variants: item, className: "grid grid-cols-2 xl:grid-cols-4 gap-4", children: [
                    { label: 'Total Stock', value: totalStock.toLocaleString(), icon: Package, color: 'text-brand-400', bg: 'bg-brand-500/10' },
                    { label: 'Low Stock Items', value: lowCount, icon: TrendingDown, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { label: 'Out of Stock', value: outCount, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
                    { label: 'Total Products', value: products.length, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                ].map(s => {
                    const Icon = s.icon;
                    return (_jsxs("div", { className: "glass-card p-5 flex items-center gap-4", children: [_jsx("div", { className: clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', s.bg), children: _jsx(Icon, { size: 20, className: s.color }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-dark-50", children: s.value }), _jsx("p", { className: "text-xs text-dark-400", children: s.label })] })] }, s.label));
                }) }), _jsx(motion.div, { variants: item, className: "flex gap-2 flex-wrap", children: ['all', 'available', 'low', 'out'].map(f => (_jsx("button", { onClick: () => setFilter(f), className: clsx('px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border', filter === f
                        ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                        : 'bg-dark-700/40 text-dark-400 border-dark-600/30 hover:text-dark-200'), children: f === 'all' ? 'All Products' : f === 'low' ? 'Low Stock' : f === 'out' ? 'Out of Stock' : 'Available' }, f))) }), _jsx(motion.div, { variants: item, className: "table-container", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsx("tr", { className: "border-b border-dark-700/50", children: ['Product', 'SKU', 'Category', 'Location', 'Stock', 'Status', 'Actions'].map(h => (_jsx("th", { className: "table-header text-left", children: h }, h))) }) }), _jsx("tbody", { children: filtered.map((p, i) => {
                                    const st = getStatus(p.stock);
                                    return (_jsxs(motion.tr, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: i * 0.04 }, className: "table-row", children: [_jsx("td", { className: "table-cell", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center", children: _jsx(Package, { size: 14, className: "text-brand-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-dark-100 text-sm", children: p.name }), _jsx("p", { className: "text-xs text-dark-500", children: p.manufacturer })] })] }) }), _jsx("td", { className: "table-cell", children: _jsx("span", { className: "font-mono text-xs text-dark-300 bg-dark-700/40 px-2 py-0.5 rounded", children: p.sku }) }), _jsx("td", { className: "table-cell", children: _jsx("span", { className: "badge-blue", children: p.category }) }), _jsx("td", { className: "table-cell text-dark-400 text-sm", children: p.location }), _jsx("td", { className: "table-cell", children: adjustId === p.id ? (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: () => setAdjustQty(q => q - 1), className: "btn-icon w-6 h-6", children: _jsx(Minus, { size: 10 }) }), _jsx("span", { className: "text-sm font-bold text-dark-100 w-10 text-center", children: p.stock + adjustQty }), _jsx("button", { onClick: () => setAdjustQty(q => q + 1), className: "btn-icon w-6 h-6", children: _jsx(Plus, { size: 10 }) }), _jsx("button", { onClick: () => { toast.success(`Stock updated to ${p.stock + adjustQty}`); setAdjustId(null); setAdjustQty(0); }, className: "text-xs text-emerald-400 ml-1 hover:text-emerald-300", children: "Save" })] })) : (_jsx("span", { className: clsx('text-sm font-semibold', p.stock === 0 ? 'text-red-400' : p.stock < 10 ? 'text-amber-400' : 'text-dark-200'), children: p.stock.toLocaleString() })) }), _jsx("td", { className: "table-cell", children: _jsx("span", { className: st.badge, children: st.label }) }), _jsx("td", { className: "table-cell", children: _jsx("button", { onClick: () => { setAdjustId(p.id); setAdjustQty(0); }, className: "btn-icon", title: "Adjust stock", children: _jsx(Edit3, { size: 13 }) }) })] }, p.id));
                                }) })] }) }) })] }));
}
