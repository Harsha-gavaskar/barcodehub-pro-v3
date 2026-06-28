import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Package, QrCode, Printer, ArrowUpRight, ArrowDownRight, RefreshCw, AlertTriangle, CheckCircle, Layers, Clock } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
const dailyData = [
    { day: 'Mon', labels: 420, prints: 380 },
    { day: 'Tue', labels: 580, prints: 510 },
    { day: 'Wed', labels: 340, prints: 300 },
    { day: 'Thu', labels: 720, prints: 680 },
    { day: 'Fri', labels: 890, prints: 820 },
    { day: 'Sat', labels: 230, prints: 200 },
    { day: 'Sun', labels: 150, prints: 130 },
];
const weeklyData = [
    { week: 'W1', labels: 3200 },
    { week: 'W2', labels: 4100 },
    { week: 'W3', labels: 3800 },
    { week: 'W4', labels: 5200 },
];
const barcodeTypes = [
    { name: 'CODE128', value: 42, color: '#6366f1' },
    { name: 'EAN13', value: 28, color: '#8b5cf6' },
    { name: 'QR Code', value: 18, color: '#06b6d4' },
    { name: 'UPC', value: 8, color: '#10b981' },
    { name: 'Others', value: 4, color: '#f59e0b' },
];
const topProducts = [
    { name: 'Wireless Mouse Pro', labels: 842, trend: 12 },
    { name: 'USB-C Hub 7-in-1', labels: 634, trend: 8 },
    { name: 'Mechanical Keyboard', labels: 521, trend: -3 },
    { name: 'Monitor Arm Dual', labels: 412, trend: 22 },
    { name: 'Webcam 4K Ultra', labels: 388, trend: 5 },
];
const recentActivity = [
    { action: 'Google Sheets Synced', detail: '124 products updated', time: '2m ago', icon: RefreshCw, color: 'text-emerald-400' },
    { action: 'Print Job Completed', detail: '50 EAN13 labels — HP LaserJet', time: '15m ago', icon: Printer, color: 'text-blue-400' },
    { action: 'Low Stock Alert', detail: 'Webcam 4K Ultra — 5 remaining', time: '1h ago', icon: AlertTriangle, color: 'text-amber-400' },
    { action: 'Barcode Generated', detail: 'SKU-009012 — CODE128', time: '2h ago', icon: QrCode, color: 'text-purple-400' },
    { action: 'CSV Import Success', detail: '48 new products imported', time: '3h ago', icon: CheckCircle, color: 'text-emerald-400' },
];
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
];
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (_jsxs("div", { className: "bg-dark-900/95 border border-dark-600/50 rounded-xl px-4 py-3 shadow-2xl", children: [_jsx("p", { className: "text-dark-400 text-xs mb-1", children: label }), payload.map((p, i) => (_jsxs("p", { className: "text-sm font-semibold", style: { color: p.color }, children: [p.name, ": ", p.value.toLocaleString()] }, i)))] }));
    }
    return null;
};
const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};
export default function DashboardPage() {
    return (_jsxs(motion.div, { variants: container, initial: "hidden", animate: "show", className: "space-y-6", children: [_jsxs(motion.div, { variants: item, className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-bold text-dark-50", children: ["Good morning, ", _jsx("span", { className: "gradient-text", children: "Alex" }), " \uD83D\uDC4B"] }), _jsx("p", { className: "text-dark-400 text-sm mt-1", children: "Here's your platform overview for today." })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }), _jsx("span", { className: "text-xs text-emerald-400 font-medium", children: "All Systems Operational" })] }) })] }), _jsx(motion.div, { variants: item, className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4", children: STAT_CARDS.map((card) => {
                    const Icon = card.icon;
                    return (_jsxs(motion.div, { whileHover: { y: -2, transition: { duration: 0.2 } }, className: "stat-card", children: [_jsx("div", { className: `absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-2xl opacity-60` }), _jsxs("div", { className: "relative", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsx("div", { className: `w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`, children: _jsx(Icon, { size: 20, className: card.iconColor }) }), _jsx(ArrowUpRight, { size: 16, className: "text-dark-600" })] }), _jsx("p", { className: "text-dark-400 text-sm font-medium", children: card.label }), _jsx("p", { className: "text-3xl font-bold text-dark-50 mt-1", children: card.value }), _jsxs("p", { className: `text-xs mt-1 flex items-center gap-1 ${card.positive ? 'text-emerald-400' : 'text-red-400'}`, children: [card.positive ? _jsx(ArrowUpRight, { size: 12 }) : _jsx(ArrowDownRight, { size: 12 }), card.change] })] })] }, card.label));
                }) }), _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-4", children: [_jsxs(motion.div, { variants: item, className: "xl:col-span-2 chart-container", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-dark-100", children: "Daily Activity" }), _jsx("p", { className: "text-xs text-dark-500", children: "Labels generated vs printed this week" })] }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-dark-400", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" }), " Generated"] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" }), " Printed"] })] })] }), _jsx(ResponsiveContainer, { width: "100%", height: 220, children: _jsxs(AreaChart, { data: dailyData, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "labelsGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#6366f1", stopOpacity: 0.3 }), _jsx("stop", { offset: "95%", stopColor: "#6366f1", stopOpacity: 0 })] }), _jsxs("linearGradient", { id: "printsGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#8b5cf6", stopOpacity: 0.3 }), _jsx("stop", { offset: "95%", stopColor: "#8b5cf6", stopOpacity: 0 })] })] }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(71,85,105,0.3)" }), _jsx(XAxis, { dataKey: "day", tick: { fill: '#64748b', fontSize: 12 }, axisLine: false, tickLine: false }), _jsx(YAxis, { tick: { fill: '#64748b', fontSize: 12 }, axisLine: false, tickLine: false }), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) }), _jsx(Area, { type: "monotone", dataKey: "labels", name: "Generated", stroke: "#6366f1", strokeWidth: 2, fill: "url(#labelsGrad)" }), _jsx(Area, { type: "monotone", dataKey: "prints", name: "Printed", stroke: "#8b5cf6", strokeWidth: 2, fill: "url(#printsGrad)" })] }) })] }), _jsxs(motion.div, { variants: item, className: "chart-container", children: [_jsx("h3", { className: "font-semibold text-dark-100 mb-1", children: "Barcode Types" }), _jsx("p", { className: "text-xs text-dark-500 mb-4", children: "Distribution this month" }), _jsx(ResponsiveContainer, { width: "100%", height: 160, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: barcodeTypes, cx: "50%", cy: "50%", innerRadius: 45, outerRadius: 70, paddingAngle: 3, dataKey: "value", children: barcodeTypes.map((entry, i) => (_jsx(Cell, { fill: entry.color }, i))) }), _jsx(Tooltip, { formatter: (value) => [`${value}%`, 'Share'], contentStyle: { background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(71,85,105,0.5)', borderRadius: '12px' } })] }) }), _jsx("div", { className: "space-y-1.5 mt-2", children: barcodeTypes.map(t => (_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsxs("span", { className: "flex items-center gap-2 text-dark-400", children: [_jsx("span", { className: "w-2 h-2 rounded-full inline-block", style: { background: t.color } }), t.name] }), _jsxs("span", { className: "font-medium text-dark-200", children: [t.value, "%"] })] }, t.name))) })] })] }), _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-4", children: [_jsxs(motion.div, { variants: item, className: "glass-card p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-5", children: [_jsx("h3", { className: "font-semibold text-dark-100", children: "Top Products" }), _jsx("span", { className: "badge-blue", children: "This Month" })] }), _jsx("div", { className: "space-y-3", children: topProducts.map((p, i) => (_jsxs("div", { className: "flex items-center gap-3 group", children: [_jsx("span", { className: "text-dark-600 text-xs font-mono w-4", children: i + 1 }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm text-dark-200 font-medium truncate", children: p.name }), _jsx("div", { className: "mt-1 h-1.5 bg-dark-700/60 rounded-full overflow-hidden", children: _jsx(motion.div, { initial: { width: 0 }, animate: { width: `${(p.labels / 1000) * 100}%` }, transition: { duration: 0.8, delay: 0.2 + i * 0.1 }, className: "h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400" }) })] }), _jsx("span", { className: "text-sm font-semibold text-dark-200 shrink-0", children: p.labels.toLocaleString() }), _jsxs("span", { className: `text-xs shrink-0 flex items-center gap-0.5 ${p.trend > 0 ? 'text-emerald-400' : 'text-red-400'}`, children: [p.trend > 0 ? _jsx(ArrowUpRight, { size: 12 }) : _jsx(ArrowDownRight, { size: 12 }), Math.abs(p.trend), "%"] })] }, p.name))) })] }), _jsxs(motion.div, { variants: item, className: "glass-card p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-5", children: [_jsx("h3", { className: "font-semibold text-dark-100", children: "Recent Activity" }), _jsx("button", { className: "text-xs text-brand-400 hover:text-brand-300", children: "View all" })] }), _jsx("div", { className: "space-y-3", children: recentActivity.map((a, i) => {
                                    const Icon = a.icon;
                                    return (_jsxs(motion.div, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.3 + i * 0.1 }, className: "flex items-start gap-3 p-3 rounded-xl hover:bg-dark-700/30 transition-colors", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-dark-700/60 flex items-center justify-center shrink-0", children: _jsx(Icon, { size: 14, className: a.color }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-dark-100", children: a.action }), _jsx("p", { className: "text-xs text-dark-500 truncate", children: a.detail })] }), _jsx("span", { className: "text-xs text-dark-600 shrink-0", children: a.time })] }, i));
                                }) })] })] }), _jsxs(motion.div, { variants: item, className: "chart-container", children: [_jsx("h3", { className: "font-semibold text-dark-100 mb-1", children: "Weekly Overview" }), _jsx("p", { className: "text-xs text-dark-500 mb-5", children: "Total labels generated per week this month" }), _jsx(ResponsiveContainer, { width: "100%", height: 160, children: _jsxs(BarChart, { data: weeklyData, barSize: 40, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(71,85,105,0.3)", vertical: false }), _jsx(XAxis, { dataKey: "week", tick: { fill: '#64748b', fontSize: 12 }, axisLine: false, tickLine: false }), _jsx(YAxis, { tick: { fill: '#64748b', fontSize: 12 }, axisLine: false, tickLine: false }), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) }), _jsx(Bar, { dataKey: "labels", name: "Labels", fill: "url(#barGrad)", radius: [6, 6, 0, 0], children: _jsx("defs", { children: _jsxs("linearGradient", { id: "barGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "#6366f1" }), _jsx("stop", { offset: "100%", stopColor: "#4338ca" })] }) }) })] }) })] })] }));
}
