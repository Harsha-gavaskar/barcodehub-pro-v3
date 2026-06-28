import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';
const DAILY = Array.from({ length: 30 }, (_, i) => ({
    date: `Jun ${i + 1}`,
    generated: Math.floor(200 + Math.random() * 600),
    printed: Math.floor(180 + Math.random() * 500),
    failed: Math.floor(Math.random() * 20),
}));
const MONTHLY = [
    { month: 'Jan', generated: 12400, printed: 11200 },
    { month: 'Feb', generated: 14100, printed: 13000 },
    { month: 'Mar', generated: 11800, printed: 10900 },
    { month: 'Apr', generated: 17200, printed: 16400 },
    { month: 'May', generated: 15600, printed: 14800 },
    { month: 'Jun', generated: 18900, printed: 17600 },
];
const TOP_PRODUCTS = [
    { name: 'Wireless Mouse Pro', count: 3842, delta: 12 },
    { name: 'USB-C Hub 7-in-1', count: 2934, delta: 8 },
    { name: 'Mechanical Keyboard', count: 2421, delta: -3 },
    { name: 'Monitor Arm Dual', count: 1912, delta: 22 },
    { name: 'Webcam 4K Ultra', count: 1688, delta: 5 },
    { name: 'LED Desk Lamp', count: 1421, delta: -7 },
    { name: 'Mouse Pad XXL', count: 1200, delta: 15 },
];
const BARCODE_DIST = [
    { name: 'CODE128', value: 42, color: '#6366f1' },
    { name: 'EAN-13', value: 28, color: '#8b5cf6' },
    { name: 'QR Code', value: 18, color: '#06b6d4' },
    { name: 'UPC', value: 8, color: '#10b981' },
    { name: 'Others', value: 4, color: '#f59e0b' },
];
const TABS = ['Daily', 'Weekly', 'Monthly'];
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length)
        return null;
    return (_jsxs("div", { className: "bg-dark-900/95 border border-dark-600/50 rounded-xl px-4 py-3 shadow-2xl", children: [_jsx("p", { className: "text-dark-400 text-xs mb-1", children: label }), payload.map((p, i) => (_jsxs("p", { className: "text-sm font-semibold", style: { color: p.color || p.stroke }, children: [p.name, ": ", Number(p.value).toLocaleString()] }, i)))] }));
};
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState('Daily');
    const data = activeTab === 'Monthly' ? MONTHLY : DAILY.slice(0, activeTab === 'Weekly' ? 7 : 30);
    return (_jsxs(motion.div, { variants: container, initial: "hidden", animate: "show", className: "space-y-5", children: [_jsxs(motion.div, { variants: item, className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-dark-50", children: "Analytics" }), _jsx("p", { className: "text-sm text-dark-400", children: "Label generation and printing insights" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex bg-dark-800/60 rounded-xl p-1 border border-dark-700/40", children: TABS.map(tab => (_jsx("button", { onClick: () => setActiveTab(tab), className: clsx('px-4 py-1.5 rounded-lg text-xs font-medium transition-all', activeTab === tab ? 'bg-brand-500/20 text-brand-300' : 'text-dark-400 hover:text-dark-200'), children: tab }, tab))) }), _jsxs("button", { className: "btn-secondary text-sm", children: [_jsx(Download, { size: 14 }), " Export Report"] })] })] }), _jsx(motion.div, { variants: item, className: "grid grid-cols-2 xl:grid-cols-4 gap-4", children: [
                    { label: 'Labels Generated', value: '18,432', change: '+12.4%', up: true, color: 'brand' },
                    { label: 'Labels Printed', value: '17,012', change: '+9.8%', up: true, color: 'purple' },
                    { label: 'Products Imported', value: '247', change: '+34', up: true, color: 'cyan' },
                    { label: 'Failed Prints', value: '18', change: '-32%', up: false, color: 'red' },
                ].map(k => (_jsxs("div", { className: "glass-card p-5", children: [_jsx("p", { className: "text-xs text-dark-400 font-medium", children: k.label }), _jsx("p", { className: "text-2xl font-bold text-dark-50 mt-1", children: k.value }), _jsxs("p", { className: clsx('text-xs mt-1 flex items-center gap-1', k.up ? 'text-emerald-400' : 'text-red-400'), children: [k.up ? _jsx(TrendingUp, { size: 12 }) : _jsx(TrendingDown, { size: 12 }), k.change, " vs last period"] })] }, k.label))) }), _jsxs(motion.div, { variants: item, className: "chart-container", children: [_jsxs("div", { className: "flex items-center justify-between mb-5", children: [_jsxs("h3", { className: "font-semibold text-dark-100", children: [activeTab, " Print Activity"] }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-dark-400", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" }), " Generated"] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" }), " Printed"] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-red-500 inline-block" }), " Failed"] })] })] }), _jsx(ResponsiveContainer, { width: "100%", height: 260, children: _jsxs(AreaChart, { data: data, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "genGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#6366f1", stopOpacity: 0.3 }), _jsx("stop", { offset: "95%", stopColor: "#6366f1", stopOpacity: 0 })] }), _jsxs("linearGradient", { id: "printGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#8b5cf6", stopOpacity: 0.3 }), _jsx("stop", { offset: "95%", stopColor: "#8b5cf6", stopOpacity: 0 })] })] }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(71,85,105,0.3)" }), _jsx(XAxis, { dataKey: activeTab === 'Monthly' ? 'month' : 'date', tick: { fill: '#64748b', fontSize: 11 }, axisLine: false, tickLine: false, interval: activeTab === 'Daily' ? 4 : 0 }), _jsx(YAxis, { tick: { fill: '#64748b', fontSize: 11 }, axisLine: false, tickLine: false }), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) }), _jsx(Area, { type: "monotone", dataKey: "generated", name: "Generated", stroke: "#6366f1", strokeWidth: 2, fill: "url(#genGrad)" }), _jsx(Area, { type: "monotone", dataKey: "printed", name: "Printed", stroke: "#8b5cf6", strokeWidth: 2, fill: "url(#printGrad)" }), 'failed' in (data[0] ?? {}) && (_jsx(Line, { type: "monotone", dataKey: "failed", name: "Failed", stroke: "#ef4444", strokeWidth: 1.5, dot: false }))] }) })] }), _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-5", children: [_jsxs(motion.div, { variants: item, className: "xl:col-span-2 chart-container", children: [_jsx("h3", { className: "font-semibold text-dark-100 mb-5", children: "Top Products by Label Count" }), _jsx(ResponsiveContainer, { width: "100%", height: 220, children: _jsxs(BarChart, { data: TOP_PRODUCTS, layout: "vertical", barSize: 14, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(71,85,105,0.3)", horizontal: false }), _jsx(XAxis, { type: "number", tick: { fill: '#64748b', fontSize: 11 }, axisLine: false, tickLine: false }), _jsx(YAxis, { dataKey: "name", type: "category", width: 140, tick: { fill: '#94a3b8', fontSize: 11 }, axisLine: false, tickLine: false }), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) }), _jsx(Bar, { dataKey: "count", name: "Labels", radius: [0, 6, 6, 0], children: TOP_PRODUCTS.map((_, i) => (_jsx(Cell, { fill: `hsl(${245 + i * 15}, 80%, ${65 - i * 5}%)` }, i))) })] }) })] }), _jsxs(motion.div, { variants: item, className: "chart-container", children: [_jsx("h3", { className: "font-semibold text-dark-100 mb-2", children: "Format Distribution" }), _jsx("p", { className: "text-xs text-dark-500 mb-4", children: "Labels by barcode type" }), _jsx(ResponsiveContainer, { width: "100%", height: 180, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: BARCODE_DIST, cx: "50%", cy: "50%", innerRadius: 50, outerRadius: 72, paddingAngle: 3, dataKey: "value", children: BARCODE_DIST.map((entry, i) => (_jsx(Cell, { fill: entry.color }, i))) }), _jsx(Tooltip, { formatter: (v) => [`${v}%`], contentStyle: { background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(71,85,105,0.5)', borderRadius: '12px' } })] }) }), _jsx("div", { className: "space-y-1.5 mt-2", children: BARCODE_DIST.map(t => (_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsxs("span", { className: "flex items-center gap-2 text-dark-400", children: [_jsx("span", { className: "w-2 h-2 rounded-full inline-block", style: { background: t.color } }), t.name] }), _jsxs("span", { className: "font-semibold text-dark-200", children: [t.value, "%"] })] }, t.name))) })] })] })] }));
}
