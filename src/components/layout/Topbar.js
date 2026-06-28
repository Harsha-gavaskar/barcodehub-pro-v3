import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { markNotificationRead, markAllRead } from '../../redux/slices/uiSlice';
import { Bell, Search, Sun, Moon, ChevronDown, CheckCheck, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
const PAGE_TITLES = {
    '/': { title: 'Dashboard', subtitle: 'Welcome back! Here\'s what\'s happening today.' },
    '/products': { title: 'Products', subtitle: 'Manage your product catalog and SKUs.' },
    '/barcodes': { title: 'Barcode Generator', subtitle: 'Generate barcodes in multiple formats.' },
    '/labels': { title: 'Label Designer', subtitle: 'Design custom labels with drag & drop.' },
    '/print': { title: 'Print Queue', subtitle: 'Manage and send print jobs.' },
    '/analytics': { title: 'Analytics', subtitle: 'Insights on label and print activity.' },
    '/inventory': { title: 'Inventory', subtitle: 'Track stock levels and movements.' },
    '/reports': { title: 'Reports', subtitle: 'Download PDF, Excel, and CSV reports.' },
    '/settings': { title: 'Settings', subtitle: 'Configure your account and integrations.' },
    '/admin': { title: 'Admin Panel', subtitle: 'Manage users, roles, and system settings.' },
};
const NOTIF_ICONS = {
    success: _jsx(CheckCircle, { size: 14, className: "text-emerald-400" }),
    warning: _jsx(AlertTriangle, { size: 14, className: "text-amber-400" }),
    info: _jsx(Info, { size: 14, className: "text-blue-400" }),
    error: _jsx(X, { size: 14, className: "text-red-400" }),
};
export default function Topbar() {
    const dispatch = useDispatch();
    const location = useLocation();
    const notifications = useSelector((s) => s.ui.notifications);
    const user = useSelector((s) => s.auth.user);
    const [showNotifs, setShowNotifs] = useState(false);
    const [search, setSearch] = useState('');
    const [dark, setDark] = useState(true);
    const notifRef = useRef(null);
    const pageInfo = PAGE_TITLES[location.pathname] ?? { title: 'BarcodeHub Pro', subtitle: '' };
    const unreadCount = notifications.filter(n => !n.read).length;
    useEffect(() => {
        function handleClick(e) {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifs(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);
    return (_jsxs("header", { className: "h-16 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/40 flex items-center px-6 gap-4 shrink-0 sticky top-0 z-20", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h1", { className: "text-lg font-bold text-dark-50 truncate", children: pageInfo.title }), _jsx("p", { className: "text-xs text-dark-500 truncate hidden sm:block", children: pageInfo.subtitle })] }), _jsxs("div", { className: "relative hidden md:block", children: [_jsx(Search, { size: 15, className: "absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" }), _jsx("input", { value: search, onChange: e => setSearch(e.target.value), placeholder: "Search products, SKUs...", className: "pl-9 pr-4 py-2 bg-dark-800/60 border border-dark-600/40 rounded-xl text-sm text-dark-200 placeholder-dark-500 focus:outline-none focus:border-brand-500/50 focus:bg-dark-800 w-56 transition-all duration-200" })] }), _jsxs("div", { className: "relative", ref: notifRef, children: [_jsxs("button", { onClick: () => setShowNotifs(v => !v), className: "btn-icon relative", id: "notifications-button", children: [_jsx(Bell, { size: 16 }), unreadCount > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center", children: unreadCount }))] }), _jsx(AnimatePresence, { children: showNotifs && (_jsxs(motion.div, { initial: { opacity: 0, y: 8, scale: 0.96 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 8, scale: 0.96 }, transition: { duration: 0.15 }, className: "absolute right-0 top-12 w-80 glass-panel border border-dark-700/50 shadow-2xl z-50 overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-dark-700/50", children: [_jsx("span", { className: "font-semibold text-dark-100 text-sm", children: "Notifications" }), _jsxs("button", { onClick: () => dispatch(markAllRead()), className: "text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1", children: [_jsx(CheckCheck, { size: 12 }), " Mark all read"] })] }), _jsx("div", { className: "max-h-72 overflow-y-auto scrollable", children: notifications.map(n => (_jsxs("div", { onClick: () => dispatch(markNotificationRead(n.id)), className: clsx('flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 hover:bg-dark-700/30 border-b border-dark-800/50 last:border-0', !n.read && 'bg-brand-500/5'), children: [_jsx("div", { className: "mt-0.5 shrink-0", children: NOTIF_ICONS[n.type] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs font-semibold text-dark-100", children: n.title }), _jsx("p", { className: "text-xs text-dark-400 truncate", children: n.message }), _jsx("p", { className: "text-[10px] text-dark-600 mt-0.5", children: formatDistanceToNow(new Date(n.timestamp), { addSuffix: true }) })] }), !n.read && _jsx("div", { className: "w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1" })] }, n.id))) })] })) })] }), _jsx("button", { onClick: () => setDark(v => !v), className: "btn-icon", title: "Toggle theme", children: dark ? _jsx(Sun, { size: 16 }) : _jsx(Moon, { size: 16 }) }), _jsxs("div", { className: "flex items-center gap-2 cursor-pointer group", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs", children: user?.name?.charAt(0) ?? 'A' }), _jsx(ChevronDown, { size: 14, className: "text-dark-500 group-hover:text-dark-300 transition-colors" })] })] }));
}
